import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            sendError(res, 401, "Access denied. No token provided.");
            return;
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (error) {
       sendError(res, 401, "Invalid or expired token.");
        return;
    }
}