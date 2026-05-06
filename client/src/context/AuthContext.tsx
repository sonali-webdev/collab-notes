import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse } from "../types";
import api from "../services/api";

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken] = useState<string | null>(() => {
        return localStorage.getItem("accessToken");
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setIsLoading(false);
            return;
        }

        (async () => {
            try {
                const response = await api.get("/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data.data);
            } catch {
                localStorage.removeItem("accessToken");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post<{ data: AuthResponse }>("/auth/login", {
            email,
            password,
        });
        const { user, accessToken } = response.data.data;
        setUser(user);
        localStorage.setItem("accessToken", accessToken);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.post<{ data: AuthResponse }>("/auth/register", {
            name,
            email,
            password,
        });
        const { user, accessToken } = response.data.data;
        setUser(user);
        localStorage.setItem("accessToken", accessToken);
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};