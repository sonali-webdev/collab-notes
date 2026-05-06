import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../types";
import { send } from "process";


const prisma = new PrismaClient();

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
    const { title, content, emoji } = req.body;
    const userId= req.user?.userId;

    if (!userId) {
        sendError(res, 401, "Not authenticated.");
        return;
    }

    const note = await prisma.note.create({
        data: {
            title: title || "Untitled",
            content: content || "",
            emoji: emoji || "📝",
            ownerId: userId,
        },
    });

    sendSuccess(res, 201, "Note created successfully.", note);
   } catch (error) {
       console.error("Create note error:", error);
       sendError(res, 500, "Internal server error.");
   }
};

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

        const notes = await prisma.note.findMany({
            where: {
                ownerId: userId,
                isDeleted: false,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        sendSuccess(res, 200, "Notes fetched successfully.", notes);
    } catch (error) {
        console.error("Get notes error:", error);
        sendError(res, 500, "Internal server error."); 
    }
};

export const getNoteById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        if(!userId) {
            sendError(res, 402, "Not authenticated.");
            return;
        }

        const note = await prisma.note.findUnique({
            where: { id },
        });

        if (!note) {
            sendError(res, 404, "Note not found.");
            return;
        }

        if (note.ownerId !== userId) {
            sendError(res, 403, "You don't have access to this note.");
            return;
        }
        sendSuccess(res, 200, "Note fetched successfully.", note);
    } catch (error) {
        console.error("Get note error:", error);
        sendError(res, 500, "Internal server error.");
    }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { title, content, emoji, isFavorite } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

        const existingNote = await prisma.note.findUnique({
            where: { id },
        });

        if (!existingNote) {
            sendError(res, 404, "Note not found.");
            return;
        }

        if (existingNote.ownerId !== userId) {
            sendError(res, 403, "You don't have access to this note.");
            return;
        }

        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                title,
                content,
                emoji,
                isFavorite,
            },
        });

        sendSuccess(res, 200, "Note updated successfully.", updatedNote);
    } catch (error) {
          console.error("Update note error:", error);
          sendError(res, 500, "Internal server error.");
    }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

       if (!userId) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

        const existingNote = await prisma.note.findUnique({
            where: { id },
        });

        if (!existingNote) {
            sendError(res, 404, "Note not found.");
            return;
        }

          if (existingNote.ownerId !== userId) {
            sendError(res, 403, "You don't have access to this note.");
            return;
        }

        await prisma.note.update({
            where: { id },
            data: { isDeleted: true },
        });

        sendSuccess(res, 200, "Note deleted successfully.");
    } catch (error) {
        console.error("Delete note error:", error);
        sendError(res, 500, "Internal server error.");
    }
};

export const shareNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { email, role } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

        const note = await prisma.note.findUnique({
            where: { id },
        });

        if (!note) {
            sendError(res, 404, "Note not found.");
            return;
        }

        if (note.ownerId !== userId) {
            sendError(res, 403, "Only the owner can share this note.");
            return;
        }

        const userToShare = await prisma.user.findUnique({
           where: { email },
           select: { id: true, name: true, email: true }, 
        });

        if (!userToShare) {
            sendError(res, 404, "User with this email not found.");
            return;
        }

        if (userToShare.id === userId) {
            sendError(res, 400, "You cannot share a note with yourself.");
            return;
        }

        const collaborator = await prisma.collaborator.upsert({
            where: {
                userId_noteId: {
                    userId: userToShare.id,
                    noteId: id,
                },
            },
            update: { role },
            create: {
                userId: userToShare.id,
                noteId: id,
                role,
            },
        });

        sendSuccess(res, 200, `Note shared with ${userToShare.name} successfully.`, {
            collaborator,
            sharedWith: userToShare,
        });
    } catch (error) {
        console.error("Share note error:", error);
        sendError(res, 500, "internal server error.");
    }
};

export const getSharedNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if(!userId) {
            sendError(res, 401, "Not authenticated.");
            return;
        }

         const sharedNotes = await prisma.collaborator.findMany({
            where: { userId },
            include: {
                note: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        const activeSharedNotes = sharedNotes.filter(
            (collab) => !collab.note.isDeleted
        );

        sendSuccess(res, 200, "Shared notes fetched.", activeSharedNotes);
    } catch (error) {
        console.error("Get shared notes error:", error);
        sendError(res, 500, "Internal server error.");
    }
};