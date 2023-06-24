import { User } from "./user.model";

export interface ApiResponse {
    code: number;
    message: string;
}

export interface UserApiResponse extends ApiResponse {
    data: User;
}