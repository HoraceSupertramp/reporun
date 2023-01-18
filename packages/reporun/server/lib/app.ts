import fetch from 'cross-fetch';
import 'colors';
import { Environment, exec, parallel, series, Task, TaskExecution } from "./command";
import { Repository } from 'reporun';

interface FetchError extends Error {
    code: string;
}

function isFetchError(error: Error): error is FetchError {
    return error.name === 'FetchError';
}

export default class App {

    private static counter = 0;
    private static base_port = 8834;

    private static next() {
        return App.base_port + (++App.counter);
    }

    public readonly port = App.next();
    public readonly task: TaskExecution;

    public constructor(
        repository: Repository,
        folder: string,
    ) {
        const environment: Environment = {
            PORT: this.port,
        };
        const prepare = repository.commands != null && repository.commands.prepare != null
            ? repository.commands.prepare.map((code) =>
                exec(folder, code, environment)
            ) : [];
        const start = repository.commands != null && repository.commands.start != null
            ? repository.commands.start.map((code) =>
                exec(folder, code, environment)
            ) : [];
        this.task = series(
            ...prepare,
            parallel(...start),
        )();
        // await sequence.done;
        // const port = environment.PORT;
        //await waitIndexPage(port)().done;
    }

    async stop() {
        if (this.task.abort) {
            this.task.abort();
        }
    }

    private waitIndexPage(port: number): Task {
        return () => {
            let id: NodeJS.Timer | null = null;;
            return {
                get running() {
                    return id != null;
                },
                async abort() {
                    if (id != null) {
                        clearInterval(id);
                        id = null;
                    }
                },
                done: new Promise<void>((resolve, reject) => {
                    id = setInterval(async () => {
                        try {
                            const response = await fetch(`http://localhost:${port}`);
                            if (response.status === 200) {
                                if (id != null) {
                                    clearInterval(id);
                                    id = null;
                                }
                                resolve();
                            }
                        } catch (error) {
                            if (error instanceof Error && isFetchError(error)) {
                                if (error.code !== 'ECONNREFUSED') {
                                    reject(error);
                                }
                            }
                        }
                    }, 1000);
                }),
            }
        };
    }

}