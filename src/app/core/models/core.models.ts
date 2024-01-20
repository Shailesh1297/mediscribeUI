import { User } from "./user.model";

export interface ApiResponse {
    code: number;
    message: string;
}

export interface UserApiResponse extends ApiResponse {
    data: User;
}

export interface Message {
    id?: string;
    type?: string;
    recipient: string;
    sender: string;
    content: any;
    timestamp?: Date;
    status?: string;
}

export interface DialogData {
    header: string;
    positiveLabel: string;
    negativeLabel: string;
    message: string;
}