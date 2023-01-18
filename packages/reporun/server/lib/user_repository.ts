import Config from "../config";
import User from "./user";
import path from 'path';
import App from './app';
import fs from 'fs/promises';
import simpleGit from 'simple-git';
import { series } from "./command";
import { Repository } from "reporun";

interface UserRepositoryApp {
    user: User;
    repository: Repository;
    app: App;
}

export default class UserRepository implements UserRepository {

    private static apps: UserRepositoryApp[] = [];

    public static async all(config: Config, repository: Repository): Promise<UserRepository[]> {
        const users = await User.all(config);
        return Promise.all(users.map((user) => UserRepository.get(config, repository, user)));
    }

    public static async get(config: Config, repository: Repository, user: User): Promise<UserRepository> {
        const folder = UserRepository.getUserRepositoryPath(config, repository, user);
        return new UserRepository(
            folder,
            user,
            repository,
        );
    }
    
    private static getUserRepositoryPath(config: Config, repo: Repository, user: User) {
        return path.resolve(config.fullDataPath, repo.id, user.id);
    }

    private static async inspect(config: Config, repository: Repository, user: User) {
        const repoPath = UserRepository.getUserRepositoryPath(config, repository, user);
        const exists = await UserRepository.pathExists(repoPath);
        let empty = false;
        if (exists) {
            const contents = await fs.readdir(repoPath);
            empty = contents.length === 0;
        }
        return {
            exists,
            empty,
        };
    };

    public static async pathExists(path: string) {
        try {
            await fs.access(path);
            return true;
        } catch (error) {
            return false;
        }
    }

    private constructor(
        public readonly path: string,
        public readonly user: User,
        public readonly repository: Repository,
    ) {}

    public get state() {
        return {
            type: 'remote',
        };
    }

    public clone() {
        const url = `https://github.com/${this.user.id}/${this.repository.id}.git`;
        return series(
            async () => {
                await fs.mkdir(this.path, { recursive: true });
            },
            async () => {
                await simpleGit({ baseDir: this.path }).clone(url, '.');
            },
        )().done;
    }
    
    public async pull() {
        await simpleGit({ baseDir: this.path }).pull();
    }

    public start() {
        if (this.app == null) {
            const app = new App(this.repository, this.path);
            UserRepository.apps.push({
                app,
                user: this.user,
                repository: this.repository,
            });
        }
    }

    public stop() {
        const app = this.app;
        if (app) {
            app.app.stop();
        }
    }

    private get app() {
        return UserRepository.apps.find((app) =>
            app.user.id === this.user.id && this.repository.id === app.repository.id
        );
    }

    public toJSON() {
        return {
            path: this.path,
            user: this.user,
            repository: this.repository,
            state: this.state,
        };
    }

}

