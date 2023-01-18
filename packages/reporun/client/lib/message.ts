import { Action } from 'reporun';
import { filter, fromEvent, map } from 'rxjs';

export default class Message {

    public static receive(websocket: WebSocket) {
        return fromEvent<MessageEvent>(websocket, 'message').pipe(
            map((message) => message.data),
            filter((data) => data.__id != null),
        );
    }

    constructor(public readonly action: Action) {}

    public send(websocket: WebSocket) {
        websocket.send(JSON.stringify(this.action));
    }

}