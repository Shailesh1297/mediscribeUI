export interface User {
    userId: string;
    firstname: string;
    lastname: string;
    username: string;
    roles:[{[name: string]: string}],
    tokenExpired: boolean;
    enabled: boolean;
    createdAt: Date;
}