import { ApiResponse } from "../../core/models";

export interface LoginDTO {
    username: string;
    password: string;
}

export interface TokenResponse extends ApiResponse {
    data:{
        token: string;
    }
}