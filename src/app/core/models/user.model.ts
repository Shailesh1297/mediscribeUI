export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    roles:[{[name: string]: string}],
    tokenExpired: boolean;
    enabled: boolean;
    createdAt: Date;
}