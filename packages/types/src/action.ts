import { Repository } from "./repository";
import { User } from "./user";

export interface UpdateAction {
    type: 'UPDATE';
    repository: Repository;
    user: User;
}

export interface ClearAction {
    type: 'CLEAR';
    repository: Repository;
}

export interface StartAction {
    type: 'START';
    repository: Repository;
    user: User;
}

export interface StopAction {
    type: 'STOP';
    repository: Repository;
    user: User;
}

export interface CloneAction {
    type: 'CLONE';
    repository: Repository;
    user: User;
}

export interface PullAction {
    type: 'PULL';
    repository: Repository;
    user: User;
}

export type Action =
    | ClearAction
    | StartAction
    | StopAction
    | CloneAction
    | PullAction
    | UpdateAction;