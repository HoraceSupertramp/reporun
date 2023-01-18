import child_process from 'child_process';

export interface Environment {
    PORT: number;
}

export interface Execution {
    abort(): void;
}

export interface TaskExecution {
    done: Promise<void>;
    abort?(): void;
}

type Function = () => Promise<void>;
export type Task = () => TaskExecution;

export type Runnable = Function | Task;

function preprocess(command: string, environment: Environment) {
    return Object.entries(environment).reduce((command, [key, value]) => {
        return command.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }, command);
}

export function exec(folder: string, rawCommand: string, environment?: Environment): Task {
    return () => {
        const command = environment ? preprocess(rawCommand, environment) : rawCommand;
        let child: child_process.ChildProcess | null = null;
        return {
            get running() {
                return child != null;
            },
            abort() {
                if (child != null) {
                    child.kill();
                    child = null;
                }
            },
            done: new Promise<void>((resolve, reject) => {
                child = child_process.spawn(command.split(' ')[0], command.split(' ').slice(1), {
                    cwd: folder,
                    stdio: 'inherit',
                });
                console.log(`Running ${command} into ${folder}`.green);
                child.on('error', (error) => {
                    reject(new Error(`Running ${command}\n${error.name}\n${error.message}`));
                });
                child.on('exit', (code) => {
                    child = null;
                    if (code != 0) {
                        reject(new Error(`Running ${command}\nExit code ${code}`));
                    } else {
                        console.log(`Done ${command} into ${folder}`.green);
                        resolve();
                    }
                });
            })
        };
    }
}

export function parallel(...tasks: Runnable[]): Task {
    return () => {
        const results = tasks.map(command => command());
        const runnables = results.filter((result): result is TaskExecution => result != null);
        async function abort() {
            for (const command of runnables) {
                if (command.abort) {
                    await command.abort();
                }
            }
        }
        return {
            abort,
            done: Promise.all(runnables.map(command => command.done))
                .then(() => void 0)
                .catch((error) => {
                    abort();
                    throw error;
                }),
        }
    }
}

export function series(...tasks: Runnable[]): Task {
    return () => {
        let aborted = false;
        let current: TaskExecution | null = null;
        async function step(i: number) {
            if (i === tasks.length) return;
            current = await tasks[i]() || null;
            if (current != null) {
                await current.done;
            }
            if (!aborted) {
                await step(i + 1);
            }
        }
        return {
            abort() {
                if (!aborted) {
                    if (current != null) {
                        if (current.abort) {
                            current.abort();
                        }
                        current = null;
                    }
                    aborted = true;
                }
            },
            done: step(0),
        };
    }
}
