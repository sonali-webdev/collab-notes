import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest, RegisterInput, LoginInput, JwtPayload } from "../types";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password }: RegisterInput = req.body;

        if (!name || !email || !password) {
            sendError(res, 400, "Name, email and password are required.");
            return;
        }

        if (password.length < 6) {
            sendError(res, 400, "Password must be at least 6 characters.");
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            sendError(res, 409, "Email already registered.");
            return;
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
            },
        });

        const payload: JwtPayload = { userId: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendSuccess(res, 201, "User registered successfully.", {
            user,
            accessToken,
        });
    } catch (error) {
        console.error("Register error:", error);
        sendError(res, 500, "Internal server error.");
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginInput = req.body;

        if (!email || !password) {
            sendError(res, 400, "Email and password are required.");
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            sendError(res, 401, "Invalid email or password.");
            return;
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            sendError(res, 401, "Invalid email or password.");
            return;
        }

        const payload: JwtPayload = { userId: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendSuccess(res, 200, "Login successful.", {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        sendError(res, 500, "Internal server error.");
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            sendError(res, 401, "No refresh token found.");
            return;
        }

        const decoded = verifyRefreshToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true },
        });

        if (!user) {
            sendError(res, 401, "User not found.");
            return;
        }

        const payload: JwtPayload = { userId: user.id, email: user.email };
        const newAccessToken = generateAccessToken(payload);

        sendSuccess(res, 200, "Token refreshed.", {
            accessToken: newAccessToken,
        });
    } catch (error) {
        sendError(res, 401, "Invalid refresh token.");
    }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    sendSuccess(res, 200, "Logged out successfully.");
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
            },
        });

        if (!user) {
            sendError(res, 404, "User not found.");
            return;
        }

        sendSuccess(res, 200, "User profile fetched.", user);
    } catch (error) {
        console.error("GetMe error:", error);
        sendError(res, 500, "Internal server error.");
    }
};
