import Config from './../config';
import fs from 'fs/promises';
import yaml from 'yaml';
import { Commands, Repository } from 'reporun';

export default class RepositoryImplementation implements Repository {

    public static async get(config: Config): Promise<Repository[]> {
        const repositories = yaml.parse(await fs.readFile(config.fullReposPath, 'utf8'));
        return Object.keys(repositories).map((repo) => new RepositoryImplementation(
            repo,
            {
                prepare: repositories[repo].prepare,
                start: repositories[repo].start,
            },
        ));
    }

    public constructor(
        public readonly id: string,
        public readonly commands: Commands,
    ) {}

}