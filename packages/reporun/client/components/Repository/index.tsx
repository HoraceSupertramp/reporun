import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import React from 'react';
import Avatar from 'rsuite/Avatar';
import List from 'rsuite/List';
import Stack from 'rsuite/Stack';
import Button from 'rsuite/Button';
import Layout from '../Layout';
import styles from './index.module.scss';
import Message from '../../lib/message';
import { Action, Repository, User, UserRepository } from 'reporun';

export async function loader({ params }: LoaderFunctionArgs) {
    const response = await fetch(`/api/repositories/${params.repository}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error();
    }
    return await response.json();
}

export interface Data {
    repository: Repository;
    users: UserRepository[];
}


function sendAction(socket: WebSocket, action: Action) {
    socket.send(JSON.stringify(action));
}

export default function Repository() {
    const socket = React.useRef(new WebSocket("ws://localhost:8883"));
    const windows = React.useRef([] as [User, Window][]);
    const { repository, users, ...others } = useLoaderData() as Data;
    const [ { repositories }, setState ] = React.useState({ repositories: users });
    const onClear = React.useCallback(() => {
        new Message({
            type: 'CLEAR',
            repository,
        }).send(socket.current);
    }, [repository]);
    const onClone = React.useCallback((user: User) => {
        sendAction(socket.current, {
            type: 'CLONE',
            user,
            repository,
        });
    }, [repository]);
    const onPull = React.useCallback((user: User) => {
        sendAction(socket.current, {
            type: 'PULL',
            user,
            repository,
        });
    }, []);
    const onStart = React.useCallback((user: User) => {
        sendAction(socket.current, {
            type: 'START',
            user,
            repository,
        });
    }, []);
    const onStop = React.useCallback((user: User) => {
        sendAction(socket.current, {
            type: 'STOP',
            user,
            repository,
        });
    }, []);
    const onMessage = React.useCallback(async (message: MessageEvent) => {
        const action = JSON.parse(message.data) as Action;
        if (action.type === 'UPDATE') {
            const response = await fetch(`/api/repositories/${repository.id}/users/${action.user.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error();
            }
            const user_repository = await response.json() as UserRepository;
            setState((previousState) => {
                const changedRepository = previousState.repositories.find(({ user: previousUser }) =>
                    previousUser.id === user_repository.user.id
                );
                if (changedRepository) {
                    if (changedRepository.state.type !== 'started' && user_repository.state.type === 'started') {
                        const win = window.open(`http://localhost:${user_repository.state.app.port}`);
                        if (win) {
                            windows.current.push([user_repository.user, win]);
                        }
                    } else if (changedRepository.state.type === 'started' && user_repository.state.type === 'idle') {
                        for (let i = 0; i < windows.current.length; i++) {
                            if (changedRepository.user.id === windows.current[i][0].id) {
                                const window = windows.current[i][1];
                                if (!window.closed) {
                                    window.close();
                                }
                                windows.current.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                return {
                    ...previousState,
                    repositories: previousState.repositories.map((previousRepository) => {
                        if (previousRepository === changedRepository) {
                            return user_repository;
                        } else {
                            return previousRepository;
                        }
                    }),
                };
            });
        }
    }, [users]);
    React.useEffect(() => {
        socket.current.addEventListener('message', onMessage);
        return () => socket.current.removeEventListener('message', onMessage);
    }, []);
    return (
        <Layout
            title={repository.id}
            aside={<Button onClick={onClear}>Clear</Button>}
        >
            <List>
                {repositories.map(({ user, state }, index) => {
                    return (
                        <List.Item key={user.id} className={styles.user}>
                            <Stack spacing={10} justifyContent="space-between">
                                <a target="_blank" href={`https://github.com/${user.id}/${repository.id}`}>
                                    <Stack spacing={10}>
                                        <Avatar src={`https://github.com/${user.id}.png`} size="md" circle/>
                                        <h4>{user.name} {user.surname}</h4>
                                    </Stack>
                                </a>
                                {state.type !== 'remote'
                                    ? <Stack spacing={10}>
                                        {state.type === 'empty' && <span>This repository is empty</span>}
                                        <Button
                                            disabled={state.type === 'starting' || state.type === 'started'}
                                            onClick={() => onPull(user)}
                                        >Pull</Button>
                                        {state.type !== 'empty'
                                            ? state.type !== 'starting'
                                                ? state.type === 'started'
                                                    ? <Button onClick={() => onStop(user)}>Stop</Button>
                                                    : <Button onClick={() => onStart(user)}>Start</Button>
                                                : 'Starting'
                                            : null
                                        }
                                    </Stack>
                                    : <Button onClick={() => onClone(user)}>Clone</Button>
                                }
                            </Stack>
                        </List.Item>
                    );
                })}
            </List>
        </Layout>
    );
}
