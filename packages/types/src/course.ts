import { User } from "./user";

export interface Course {
    id: string;
    users: User[];
}