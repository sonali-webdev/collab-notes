process.env.DATABASE_URL = "postgresql://neondb_owner:npg_LosAOPwWb18C@ep-twilight-pine-aoamc14r-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";
import { initializeSocket } from "./socket/socketHandler";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

initializeSocket(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 Collab Notes API is running!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.IO initialized`);
});