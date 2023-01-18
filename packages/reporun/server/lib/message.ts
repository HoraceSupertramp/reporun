import { Action } from 'reporun';
import { fromEvent, map, Observable, switchMap } from 'rxjs';
import { MessageEvent, WebSocket, WebSocketServer } from 'ws';

export default class Message {

    public static receive(socket: WebSocketServer): Observable<Action> {
        const connection = fromEvent(socket, 'connection') as Observable<WebSocket>;
        return connection.pipe(
            switchMap((connection) => fromEvent(connection, 'message') as Observable<MessageEvent>),
            map((message) => message.data as unknown as Action),
        )
    }

}