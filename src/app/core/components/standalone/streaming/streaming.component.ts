import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Observable, Subscription, asapScheduler, catchError, delayWhen, filter, from, map, mergeMap, of, take, tap, timer } from 'rxjs';

import { ToastService, WebRTCService, WebSocketService } from '../../../services';
import { User } from '../../../models/user.model';
import { Codecs } from '../../../enums';
import { DialogData, Message } from '../../../models';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule,  MatSelectModule],
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss']
})
export class StreamingComponent implements OnInit {

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  selectedUser: User | null = null;

  supportedCodecTypes!: string[];
  //video/audio
  isLocalMediaActive: boolean = false;
  isRemoteMediaActive: boolean = false;

  //recorder
  isRecording: boolean = false;
  recordedBlobs: Blob[] = [];
  selectedCodec!: string;
  mediaRecorder!: MediaRecorder;

  //call data
  callData: DialogData = {
    header: 'Incoming Call',
    message: '',
    negativeLabel: 'Hang Up',
    positiveLabel: 'Pick Up'
  };

  //streaming
  streaming: boolean = false;
  spectating: boolean = false;

  activeUsers: User[] = [];
  streamers: Set<string> = new Set();

  private activeSubscription!: Subscription;
  private streamersSubscription!: Subscription;

  private signalSubscription!: Subscription;
  private remoteStreamSubscription!: Subscription;

  private mediaConstraints = {
    video: true,
    audio: false
  }

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(
    public webRtc: WebRTCService,
    public socket: WebSocketService,
    private toast: ToastService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getSupportedCodecTypes();
    this.signalSubscription = this.socket.listenWebRTCSignal().subscribe(async(signal: Message) => {
          if (signal.sender != this.selectedUser?.userId) {
              this.selectedUser = this.activeUsers.find(user => user.userId === signal.sender) || null;
          }
          //     this.handleSignal(signal);
          // } else {
            this.handleSignal(signal);
          // }
    });

    this.remoteStreamSubscription = this.webRtc.getRemoteStream().subscribe(event => {
          console.info('remote stream recieved!!!!!');
          this.remoteStream = event.streams[0];
          this.remoteVideo.nativeElement.autoplay = true;
          this.remoteVideo.nativeElement.srcObject = event.streams[0];
          this.isRemoteMediaActive = true;
    });

    this.activeSubscription = this.socket.activeUsers().pipe(map((users) => (<User[]>Object.values(users)).filter((user: User) => user.userId != this.socket.getUserId)))
      .subscribe(activeUsers => {
        this.activeUsers = activeUsers;
        //incase of user disconnected
        const findUser = this.activeUsers.find(user => user.userId == this.selectedUser?.userId);
        if (!findUser) {
          this.disconnect();
        }
      });

    this.streamersSubscription = this.socket.streamers().pipe(map((streamers: string[]) => <string[]>streamers.filter((streamer) => streamer !== this.socket.getUserId))).subscribe((streamers:string[]) => {
      this.streamers = new Set(streamers);
      if (this.spectating && !this.streamers.has(this.selectedUser?.userId!)) {
        this.disconnect();
      }
    })

    this.socket.getActives();
  }

  ngOnDestroy(): void {
    this.signalSubscription.unsubscribe();
    this.remoteStreamSubscription.unsubscribe();
  }

  onActiveUserChange(change: MatSelectChange): void {
    this.selectedUser = change.value;
  }

  onStreamStart() {
    this.streaming = true;
    this.socket.sendStreamSignal({ type: 'stream', content: 'start', recipient: '', sender: this.socket.getUserId! });
  }

  onStreamEnd() {
    this.streaming = false;
    this.socket.sendStreamSignal({ type: 'stream', content: 'stop', recipient: '', sender: this.socket.getUserId! });
  }

  joinStream() {
    this.spectating = true;
    this.webRtc.joinStream({
      type: 'join',
      recipient: this.selectedUser?.userId!,
      sender: this.socket.getUserId!,
      content: null
    });
  }

  async call() {
    // await this.onVideoToggle();
    if (!this.isLocalMediaActive) {
      this.toast.show({ message: `media is not active`, type: 'Error' })
      return;
    }

    if (!this.selectedUser) {
      this.toast.show({ message: `Recipient is not selected`, type: 'Error' })
      return;
    }

    const signal: Message = {
      type: 'create',
      recipient: this.selectedUser.userId,
      sender: this.socket.getUserId!,
      content: null
    }
    this.handleSignal(signal);
  }

  disconnect(): void {
    this.stopLocalStream();
    this.stopRemoteStream();
    if (this.selectedUser && !this.streaming && !this.spectating) {
      const signal: Message = {
        type: 'disconnect',
        recipient: this.selectedUser?.userId!,
        sender: this.socket.getUserId!,
        content: null
      }
      this.webRtc.initDisconnect(signal);
    } else if (this.streaming || this.spectating) {
      this.streaming = false;
      this.spectating = false;
      this.webRtc.clearAllConnections();
    }
  }

  //recorder start
  toggleRecorder(): void {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.startRecorder();
    } else {
      this.stopRecorder();
    }
  }

  startRecorder(): void {
    this.recordedBlobs = [];
    const codecType = this.selectedCodec;
    const options: MediaRecorderOptions = { mimeType: codecType };

    try {
      this.mediaRecorder = new MediaRecorder(this.localStream!, options);
    } catch (e) {
      console.log('Error while creating media recorder', e);
      return;
    }
    console.log('Created media recorder');
    this.mediaRecorder.onstop = (event) => {
      console.log('Recorder Stopped');
      const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' })
      this.remoteVideo.nativeElement.src = window.URL.createObjectURL(superBuffer);
      this.remoteVideo.nativeElement.play();
    };
    this.mediaRecorder.ondataavailable = (event) => {
      console.log('media data available ', event);
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
    this.mediaRecorder.start();
    console.log('media recorder started');
  }

  stopRecorder(): void {
    this.mediaRecorder.stop();
  }
  //recorder end

  camera(): Observable<MediaStream | null> {
    return of(null).pipe(
      mergeMap(_ =>
        from(navigator.mediaDevices.getUserMedia(this.mediaConstraints))
        .pipe(tap((stream)=>this.handleStreamSuccess(stream)),
          catchError(error => {
            this.toast.show({message: 'Enable System Camera', type: 'Error'});
          return of(null)
        })))
    );
  }

  openCamera(){
    this.camera().subscribe({
      next(value) {
        console.log('camera opened!');
      }
    })
  }

  closeCamera(): void {
    this.stopLocalStream();
  }

  private stopLocalStream(): void {
    this.localVideo.nativeElement.pause();
    this.localStream?.getTracks().forEach(track => track?.stop());
    this.localVideo.nativeElement.srcObject = null;
    this.localStream = null;
    this.isLocalMediaActive = false;
  }

  private stopRemoteStream(): void {
    this.remoteStream?.getTracks().forEach(track => track?.stop());
    this.remoteVideo.nativeElement.srcObject = null;
    this.remoteStream = null;
    this.isRemoteMediaActive = false;
  }

  private handleStreamSuccess(stream: MediaStream) {
    console.debug("Initialized once");
    this.localStream = stream;
    stream.getTracks().forEach(track => console.log(track.label))
    console.log('Got stream with constraints:', this.mediaConstraints);
    this.localVideo.nativeElement.srcObject = stream;
    this.localVideo.nativeElement.play();
    this.isLocalMediaActive = true;
  }

  // throttling: boolean = false;

  private handleSignal(signal: Message) {
    switch (signal.type) {
      case 'create':
        this.webRtc.createOffer(signal, this.localStream!);
        break;
      case 'offer':
        if (!this.spectating) {
          this.dialog.open(DialogComponent, { data: { ...this.callData, message: `Incoming call from ${this.selectedUser?.username} !` } }).afterClosed().subscribe(async (state) => {
            if (state) {
              if(!this.localStream) {
                this.camera().subscribe((stream) =>{
                  if(stream){
                    this.webRtc.handleOffer(signal, this.localStream!);
                  }
                });
              } else {
                this.webRtc.handleOffer(signal, this.localStream!)
              }
            }
          });
        } else {
          this.webRtc.handleOffer(signal, this.localStream!);
        }
        break;
      case 'answer':
        this.webRtc.handleAnswer(signal, this.localStream!);
        break;
      case 'ice':
        if(!this.localStream && !this.spectating) {
          this.camera().subscribe(stream => {
            if(stream) {
              this.webRtc.handleIce(signal, this.localStream!);
            }
          });
        }else {
          this.webRtc.handleIce(signal, this.localStream!);
        }
        break;
      case 'disconnect':
        this.stopLocalStream();
        this.stopRemoteStream();
        this.webRtc.handleDisconnect(signal);
        break;
      case 'join':
        this.webRtc.createOffer({
          type: 'create',
          recipient: signal.sender,
          sender: this.socket.getUserId!,
          content: null
        }, this.localStream!);
        break;
    }
  }

  private getSupportedCodecTypes() {
    this.supportedCodecTypes = Object.values(Codecs).filter(codec => MediaRecorder.isTypeSupported(codec));
    this.selectedCodec = this.supportedCodecTypes[0];
  }

}
