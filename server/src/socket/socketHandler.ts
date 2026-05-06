
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const activeUsers: Record<string, { userId: string; userName: string }[]> = {};

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        socket.on("join-note", ({ noteId, userId, userName }) => {
            socket.join(noteId);

            if (!activeUsers[noteId]) {
                activeUsers[noteId] = [];
            }

            activeUsers[noteId] = activeUsers[noteId].filter(
                (u) => u.userId !== userId
            );
            activeUsers[noteId].push({ userId, userName });

            io.to(noteId).emit("active-users", activeUsers[noteId]);
            console.log(`👤 ${userName} joined note: ${noteId}`);
        });

        socket.on("note-update", ({ noteId, title, content, emoji }) => {
            socket.to(noteId).emit("receive-update", { title, content, emoji });
        });

        socket.on("note-saved", ({ userId }) => {
            socket.broadcast.emit(`refresh-notes-${userId}`);
        });

        socket.on("leave-note", ({ noteId, userId }) => {
            socket.leave(noteId);

            if (activeUsers[noteId]) {
                activeUsers[noteId] = activeUsers[noteId].filter(
                    (u) => u.userId !== userId
                );
                io.to(noteId).emit("active-users", activeUsers[noteId]);
            }

            console.log(`👤 User left note: ${noteId}`);
        });

        socket.on("disconnect", () => {
            Object.keys(activeUsers).forEach((noteId) => {
                activeUsers[noteId] = activeUsers[noteId].filter(
                    (u) => u.userId !== socket.id
                );
                io.to(noteId).emit("active-users", activeUsers[noteId]);
            });
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    return io;
};