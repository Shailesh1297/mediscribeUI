import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WebSocketService } from './web-socket.service';
import { Message } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {

  private peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  private offerOptions = {
      offerToReceiveVideo: 1,
      offerToReceiveAudio: 0
  };

  private connections: Map<string,RTCPeerConnection> = new Map();
  private remoteStream$: Subject<any> = new Subject();

  constructor(private socket: WebSocketService) { }

  getRemoteStream() {
    return this.remoteStream$;
  }

  joinStream(signal: Message): void {
    this.socket.sendWebRTCSignal(signal);
  }

  initDisconnect(signal: Message) {
    this.connections.get(signal.recipient)?.close();
    this.connections.delete(signal.recipient);
    this.socket.sendWebRTCSignal(signal);
  }

  handleDisconnect(signal: Message) {
    this.connections.get(signal.sender)?.close();
    this.connections.delete(signal.sender);
  }

  clearAllConnections(): void {
    this.connections.clear();
  }

  handleIce(signal: Message, stream: MediaStream) {
    if (signal.content) {
      console.log('Adding ice candidate');
      const connection = this.getRTCPeerConnectionObject(signal.sender, stream);
      connection.addIceCandidate(new RTCIceCandidate(signal.content));
    }
  }

  async handleAnswer(signal: Message, stream: MediaStream) {
    const connection = this.getRTCPeerConnectionObject(signal.sender, stream);
    try {
      await connection.setRemoteDescription(new RTCSessionDescription(signal.content));
    } catch (e) {
      console.log('Error in answer acceptance', e);
    }
  }

  async handleOffer(signal: Message, stream: MediaStream) {
    const peerId = signal.sender;
    const connection = this.getRTCPeerConnectionObject(peerId, stream);

    try {
      console.log('Setting remote description of offer from ',peerId);
      await connection.setRemoteDescription(new RTCSessionDescription(signal.content));
      const sdp = await connection.createAnswer();
      connection.setLocalDescription(sdp);
      //sending sdp to requester
      this.socket.sendWebRTCSignal({
        type: 'answer',
        recipient: peerId,
        sender: this.socket.getUserId!,
        content: sdp
      });

    } catch(e) {
      console.log('Error in offer handling',e)
    }

  }

  async createOffer(signal: Message, stream: MediaStream) {
    const peerId = signal.recipient;
    let connection = this.getRTCPeerConnectionObject(peerId, stream);
    try {
      const sdp = await connection.createOffer();
      connection.setLocalDescription(sdp);
      console.log('Creating an offer for ', peerId);
      this.socket.sendWebRTCSignal({
        type: 'offer',
        recipient: peerId,
        sender: signal.sender,
        content: sdp
      });
    } catch (e) {
      console.log('Error in offer creation', e);
    }

  }

  private getRTCPeerConnectionObject(uuid: string, stream: MediaStream): RTCPeerConnection {
    if (this.connections.has(uuid)) {
      return this.connections.get(uuid)!;
    }
    let connection = new RTCPeerConnection(this.peerConnectionConfig);
    stream?.getTracks().forEach(track => connection.addTrack(track,stream));

    //handle onicecandidate
    connection.onicecandidate = (event)=> {
      console.log('Candidate is ',event.candidate);
      if(event.candidate) {
        console.log('Sending ICE candidate ',event.candidate);
        this.socket.sendWebRTCSignal({
          type: 'ice',
          recipient: uuid,
          content: event.candidate,
          sender: this.socket.getUserId!
        });
      }
    };

    connection.ontrack = (event)=> {
      console.log('ontrack', event);
        this.remoteStream$.next(event);
    }

    // connection.

    this.connections.set(uuid,connection);
    return connection;
  }
}
