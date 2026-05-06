import { Router } from "express";
import {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    shareNote,
    getSharedNotes,
} from "../controllers/noteController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createNote);
router.get("/", authenticate, getNotes);
router.get("/shared", authenticate, getSharedNotes);
router.get("/:id", authenticate, getNoteById);
router.put("/:id", authenticate, updateNote);
router.delete("/:id", authenticate, deleteNote);
router.post("/:id/share", authenticate, shareNote);

export default router;