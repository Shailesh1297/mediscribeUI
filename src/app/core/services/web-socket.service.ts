import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../../environments/environment';
import { Message } from '../models';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  //web socket end-point
  private webSocketEndPoint: string = `${environment.baseurl}${environment.webSocketEndpoint}`;
  // broker ->/topic & receiving endpoint ->/topic/messages
  // private topic: string = '/topic/messages'
  private stompClient: any;
  private publicMessageEvent$: Subject<Message> = new Subject();
  private privateMessageEvent$: Subject<Message> = new Subject();
  private webRTCSignalEvent$: Subject<any> = new Subject();
  private activeUsersEvent$: Subject<any> = new Subject();
  private streamersEvent$: Subject<any> = new Subject();
  private sessionId: string|null = null;
  private userId: string|null = null;


  constructor(private user: UserService) { }

  /**
   * @function to connect to web socket
   */
  public connect(alias?: string): void {
    this.userId = this.user.getUser.userId;
    const data = {
      userId: this.userId,
      alias: alias ||''
    }
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    //debugging false
    this.stompClient.debug = null;
    this.stompClient.connect(data,
      //on success
      (frame: any) => {
        //extract session id
        const urlArray = (<any>ws)._transport.url.split('/');
        const idx = urlArray.length - 2;
        this.sessionId = urlArray[idx];

        //public channel
        this.stompClient.subscribe("/topic/all", (sdkEvent: any) => {
          this.onPublicMessageReceived(sdkEvent);
        });

        //private channel
        this.stompClient.subscribe("/user/topic/private", (sdkEvent: any) => {
          this.onPrivateMessageReceived(sdkEvent);
        });

        //private webRTC signal
        this.stompClient.subscribe("/user/topic/signal", (sdkEvent: any)=>{
          this.onWebRTCSignalReceived(sdkEvent);
        })

        //active users
        this.stompClient.subscribe("/topic/users",(sdkEvent: any)=> {
          this.onUsersSessionUpdate(sdkEvent);
        });

        //streamers
        this.stompClient.subscribe("/topic/streamers",(sdkEvent: any)=> {
          this.onStreamersUpdated(sdkEvent);
        });
      },
      //on error
      (err: any) => {
        this.resetUserData();
      });
  }

  get isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  /**
   * @function to disconnect from web socket
   */
  public disconnect(): void {
    if(this.stompClient !== null) {
      this.stompClient.disconnect();
      this.resetUserData();
    }
  }

  /**
   * @function to send message
   * @param message
   */
  public sendPublic(message: Message): void {
    console.log('sending message ===>',message);
    //destination prefix - /app
    //controller mapped /all
    //sending end point
    this.stompClient.send('/app/all',{},JSON.stringify(message));
  }

  public sendPrivate(message: Message): void {
    this.privateMessageEvent$.next(message);
    this.stompClient.send('/app/private',{},JSON.stringify(message));
  }

  public sendWebRTCSignal(signal: Message): void {
    this.stompClient.send('/app/signal',{},JSON.stringify(signal));
  }

  public getActives(): void {
    this.stompClient.send('/app/actives',{},'');
  }

  public sendStreamSignal(stream: Message): void {
    this.stompClient.send('/app/stream',{},JSON.stringify(stream));
  }

  /**
   * @function to listen incoming messages
   * @returns
   */
  public listenPublic(): Subject<any> {
    return this.publicMessageEvent$;
  }

  public listenPrivate(): Subject<any> {
    return this.privateMessageEvent$;
  }

  public listenWebRTCSignal(): Subject<any> {
    return this.webRTCSignalEvent$;
  }

  public activeUsers(): Subject<any> {
    return this.activeUsersEvent$;
  }

  public streamers(): Subject<any> {
    return this.streamersEvent$;
  }

  get getUserId() {
    return this.userId;
  }

  get getSessionId(){
    return this.sessionId;
  }

  private resetUserData() {
    this.userId = null;
    this.sessionId = null;
  }


  /**
   * @function to emit messages on receive
   * @param message
   */
  private onPublicMessageReceived(message: any): void {
    const msg: Message = <Message>JSON.parse(message.body);
    this.publicMessageEvent$.next(msg);
  }

  private onPrivateMessageReceived(message: any): void {
    const msg: Message = <Message>JSON.parse(message.body);
    this.privateMessageEvent$.next(msg);
  }

  private onWebRTCSignalReceived(message: any): void {
    const msg = JSON.parse(message.body);
    this.webRTCSignalEvent$.next(msg);
  }

  private onUsersSessionUpdate(users: any): void {
    const usersData = JSON.parse(users.body);
    this.activeUsersEvent$.next(usersData);
  }

  private onStreamersUpdated(streamers: any): void {
    const streamerList = JSON.parse(streamers.body);
    this.streamersEvent$.next(streamerList);
  }

}
