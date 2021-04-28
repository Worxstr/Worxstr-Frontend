export type Role = {
    id: number;
    name: string;
}

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
    [key: string]: any;
}