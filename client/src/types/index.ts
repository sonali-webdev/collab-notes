export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    emoji: string;
    ownerId: string;
    isFavorite: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}