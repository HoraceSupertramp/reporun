import path from 'path';

export default class Config {

    public static get(): Config {
        return new Config(
            path.resolve(process.env.GROUPS_PATH!),
            path.resolve(process.env.DATA_PATH!),
            path.resolve(process.env.REPOSITORIES_CONFIG!),
        );
    }

    private constructor(
        public readonly fullClassesPath: string,
        public readonly fullDataPath: string,
        public readonly fullReposPath: string,
    ) {}
}