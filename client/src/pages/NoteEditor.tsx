// client/src/pages/NoteEditor.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import type { Note } from "../types";
import ShareModal from "../components/ShareModal";

const EMOJIS = ["📝", "💡", "🎯", "📌", "🔥", "⭐", "💼", "🎨", "📚", "🚀"];

interface ActiveUser {
  userId: string;
  userName: string;
}

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchNote();

    socket.connect();

    socket.emit("join-note", {
      noteId: id,
      userId: user?.id,
      userName: user?.name,
    });

    socket.on("receive-update", ({ title, content, emoji }) => {
      setTitle(title);
      setContent(content);
      setEmoji(emoji);
    });

    socket.on("active-users", (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    // Cleanup when leaving page
    return () => {
      socket.emit("leave-note", { noteId: id, userId: user?.id });
      socket.off("receive-update");
      socket.off("active-users");
      socket.disconnect();
    };
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${id}`);
      const fetchedNote: Note = response.data.data;
      setNote(fetchedNote);
      setTitle(fetchedNote.title);
      setContent(fetchedNote.content);
      setEmoji(fetchedNote.emoji);
    } catch (error) {
      console.error("Failed to fetch note:", error);
      navigate("/dashboard");
    }
  };

  const saveNote = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      await api.put(`/notes/${id}`, { title, content, emoji });
      setLastSaved(new Date());
      socket.emit("note-saved", { userId: user?.id });
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto save after 1 second of stopping typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      saveNote();
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, emoji]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    socket.emit("note-update", {
      noteId: id,
      title: e.target.value,
      content,
      emoji,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    socket.emit("note-update", {
      noteId: id,
      title,
      content: e.target.value,
      emoji,
    });
  };

  const handleEmojiChange = (e: string) => {
    setEmoji(e);
    setShowEmojiPicker(false);
    socket.emit("note-update", {
      noteId: id,
      title,
      content,
      emoji: e,
    });
  };

  if (!note) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f0f4ff" }}
      >
        <p className="text-gray-400 text-lg">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f4ff" }}>

      <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition font-medium"
        >
          ← Back to Notes
        </button>

        <div className="flex items-center gap-3">
          {activeUsers.map((u) => (
            <div
              key={u.userId}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: "#3B5BDB" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {u.userName}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition"
            style={{ backgroundColor: "#3B5BDB" }}
          >
            🔗 Share
          </button>

          <div className="text-sm text-gray-400">
            {isSaving ? (
              <span className="text-blue-400">💾 Saving...</span>
            ) : lastSaved ? (
              <span className="text-green-500">
                ✅ Saved at {lastSaved.toLocaleTimeString()}
              </span>
            ) : (
              <span>Start typing to auto-save</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="relative mb-4">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-5xl hover:scale-110 transition-transform"
          >
            {emoji}
          </button>

          {showEmojiPicker && (
            <div className="absolute top-16 left-0 bg-white rounded-2xl shadow-xl p-4 flex gap-3 flex-wrap w-64 z-10 border border-gray-100">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleEmojiChange(e)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-4xl font-bold text-gray-800 bg-transparent border-none outline-none mb-6 placeholder-gray-300"
        />

        <div className="border-b border-gray-200 mb-6" />

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your note here..."
          className="w-full min-h-96 text-gray-600 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder-gray-300"
        />
      </div>

      {showShareModal && (
        <ShareModal
          noteId={id!}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;