
export interface Commands {
    prepare?: string[];
    start?: string[];
}

export interface Repository {
    id: string;
    commands?: Commands;
}
