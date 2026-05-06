import { Request } from "express";

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: Date;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}