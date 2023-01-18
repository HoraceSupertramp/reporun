import Config from '../config';
import { WebSocketServer } from 'ws';
import Message from './message';
import UserRepository from './user_repository';

export function createSocket(config: Config) {
    const socket = new WebSocketServer({
        noServer: true,
    });
    Message.receive(socket).subscribe(async (action) => {
        switch (action.type) {
            case 'CLONE': {
                const {
                    repository,
                    user,
                } = action;
                const user_repo = await UserRepository.get(config, repository, user);
                await user_repo.clone();
                break;
            }
            case 'PULL': {
                const {
                    repository,
                    user,
                } = action;
                const user_repo = await UserRepository.get(config, repository, user);
                await user_repo.pull();
                break;
            }
            case 'STOP': {
                const {
                    repository,
                    user,
                } = action;
                const user_repo = await UserRepository.get(config, repository, user);
                user_repo.stop();
                break;
            }
            case 'START': {
                const {
                    repository,
                    user,
                } = action;
                const user_repo = await UserRepository.get(config, repository, user);
                user_repo.start();
                break;
            }
        }
    });
    return socket;
}