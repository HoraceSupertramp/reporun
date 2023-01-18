import { App } from "./app";
import { User } from "./user";

export interface EmptyState {
    type: 'empty';
}

export interface RemoteState {
    type: 'remote';
}

export interface CloningState {
    type: 'cloning';
}

export interface IdleState {
    type: 'idle';
}

export interface PullingState {
    type: 'pulling';
}

export interface StartingState {
    type: 'starting';
    app: App;
}

export interface StartedState {
    type: 'started';
    app: App;
}

export type RepositoryState =
    | EmptyState
    | RemoteState
    | CloningState
    | IdleState
    | PullingState
    | StartingState
    | StartedState;

export interface UserRepository {
    user: User;
    path: string;
    state: RepositoryState;
}