import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Note } from "../types";
import api from "../services/api";
import socket from "../services/socket";

const NOTE_COLORS = [
  { bg: "#FFE4E4", border: "#FFB3B3", text: "#cc0000" },
  { bg: "#E4F0FF", border: "#B3D4FF", text: "#0055cc" },
  { bg: "#E4FFE9", border: "#B3FFB3", text: "#006600" },
  { bg: "#FFF8E4", border: "#FFE4B3", text: "#cc7700" },
  { bg: "#F4E4FF", border: "#D4B3FF", text: "#6600cc" },
  { bg: "#E4FFFD", border: "#B3FFF6", text: "#007755" },
];

interface SharedNote {
  id: string;
  role: string;
  note: Note & {
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "shared">("my");

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSharedNotes = sharedNotes.filter(
    (collab) =>
      collab.note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collab.note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes");
      setNotes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedNotes = async () => {
    try {
      const response = await api.get("/notes/shared");
      setSharedNotes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch shared notes:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchNotes();
    fetchSharedNotes();

    socket.connect();
    socket.on(`refresh-notes-${user?.id}`, () => {
      fetchNotes();
      fetchSharedNotes();
    });

    return () => {
      socket.off(`refresh-notes-${user?.id}`);
      socket.disconnect();
    };
  }, []);

  const createNote = async () => {
    try {
      setIsCreating(true);
      const response = await api.post("/notes", {
        title: "Untitled",
        content: "",
        emoji: "📝",
      });
      const newNote = response.data.data;
      setNotes([newNote, ...notes]);
      navigate(`/note/${newNote.id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string, isFavorite: boolean) => {
    e.stopPropagation();
    try {
      await api.put(`/notes/${id}`, { isFavorite: !isFavorite });
      setNotes(
        notes.map((note) =>
          note.id === id ? { ...note, isFavorite: !isFavorite } : note
        )
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f4ff" }}>

      <div
        className="relative overflow-hidden px-8 py-10"
        style={{ backgroundColor: "#3B5BDB" }}
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-blue-200 text-sm font-medium mb-1">
            Hello, {user?.name}! 👋
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-2">
            Happy<br />Working!
          </h1>
          <p className="text-blue-200 text-sm max-w-xs">
            Capture your thoughts, ideas and collaborate with others in real-time.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={createNote}
              disabled={isCreating}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: "#FF6B6B" }}
            >
              {isCreating ? "Creating..." : "+ New Note"}
            </button>
            <button
              onClick={logout}
              className="px-5 py-2 rounded-full text-sm font-semibold border border-blue-300 text-blue-100 hover:bg-blue-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 h-full flex items-end">
          <svg viewBox="0 0 400 250" className="h-48 w-auto opacity-90" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="280" cy="230" rx="50" ry="20" fill="#2d4bc4" opacity="0.5"/>
            <ellipse cx="280" cy="220" rx="45" ry="35" fill="#f5a623"/>
            <rect x="255" y="170" width="35" height="50" rx="10" fill="#2c3e7a"/>
            <circle cx="272" cy="158" r="18" fill="#f4a261"/>
            <ellipse cx="272" cy="145" rx="18" ry="10" fill="#2c2c2c"/>
            <rect x="245" y="195" width="50" height="30" rx="4" fill="#1a1a2e"/>
            <rect x="248" y="198" width="44" height="24" rx="2" fill="#4a90d9"/>
            <circle cx="150" cy="158" r="18" fill="#e8956d"/>
            <ellipse cx="150" cy="145" rx="20" ry="12" fill="#8B4513"/>
            <rect x="130" y="172" width="38" height="45" rx="10" fill="#e74c3c"/>
            <rect x="108" y="195" width="25" height="30" rx="6" fill="#9b59b6"/>
            <rect x="185" y="185" width="60" height="8" rx="4" fill="#8B6914"/>
            <rect x="193" y="193" width="6" height="30" rx="3" fill="#8B6914"/>
            <rect x="233" y="193" width="6" height="30" rx="3" fill="#8B6914"/>
            <rect x="205" y="172" width="16" height="20" rx="3" fill="#e74c3c"/>
            <ellipse cx="213" cy="172" rx="8" ry="4" fill="#c0392b"/>
            <rect x="340" y="180" width="12" height="50" rx="3" fill="#6B4226"/>
            <ellipse cx="346" cy="175" rx="22" ry="30" fill="#27ae60"/>
            <ellipse cx="330" cy="185" rx="15" ry="20" fill="#2ecc71"/>
            <line x1="320" y1="0" x2="320" y2="60" stroke="#FFE066" strokeWidth="2"/>
            <path d="M300 60 Q320 90 340 60" fill="#FFE066"/>
            <ellipse cx="320" cy="60" rx="20" ry="8" fill="#FFD700"/>
            <circle cx="80" cy="200" r="20" fill="#27ae60" opacity="0.8"/>
            <rect x="73" y="220" width="14" height="25" rx="3" fill="#6B4226"/>
          </svg>
        </div>

        <div className="absolute top-0 right-48 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: "white" }}/>
        <div className="absolute bottom-0 right-32 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: "white" }}/>
      </div>

      <div className="px-8 py-8">

        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
              Notes
            </h2>

            <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab("my")}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
                style={{
                  backgroundColor: activeTab === "my" ? "#3B5BDB" : "transparent",
                  color: activeTab === "my" ? "white" : "#6b7280",
                }}
              >
                My Notes ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
                style={{
                  backgroundColor: activeTab === "shared" ? "#3B5BDB" : "transparent",
                  color: activeTab === "shared" ? "white" : "#6b7280",
                }}
              >
                Shared With Me ({sharedNotes.length})
              </button>
            </div>
          </div>

          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 flex-1 max-w-md">
            <span className="text-gray-400 mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-gray-400">
            Loading your notes...
          </div>
        )}

        {!isLoading && activeTab === "my" && (
          <>
            {notes.length === 0 && (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-gray-500 text-xl font-semibold mb-2">No notes yet!</p>
                <p className="text-gray-400 mb-6">Click "+ New Note" to get started</p>
                <button
                  onClick={createNote}
                  className="px-6 py-3 rounded-full text-white font-semibold"
                  style={{ backgroundColor: "#3B5BDB" }}
                >
                  + Create First Note
                </button>
              </div>
            )}

            {notes.length > 0 && filteredNotes.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-gray-500 text-xl font-semibold mb-2">
                  No notes found for "{searchQuery}"
                </p>
                <button onClick={() => setSearchQuery("")} className="text-indigo-500 hover:underline">
                  Clear search
                </button>
              </div>
            )}

            {filteredNotes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNotes.map((note, index) => {
                  const color = NOTE_COLORS[index % NOTE_COLORS.length];
                  return (
                    <div
                      key={note.id}
                      onClick={() => navigate(`/note/${note.id}`)}
                      className="rounded-2xl p-5 cursor-pointer group transition-transform hover:-translate-y-1 hover:shadow-lg"
                      style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{note.emoji}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleFavorite(e, note.id, note.isFavorite)}
                            className="transition text-lg"
                          >
                            {note.isFavorite ? "⭐" : "☆"}
                          </button>
                          <button
                            onClick={(e) => deleteNote(e, note.id)}
                            className="opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded-full"
                            style={{ color: color.text, backgroundColor: color.border }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg mb-2 truncate" style={{ color: color.text }}>
                        {note.title || "Untitled"}
                      </h3>

                      <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                        {note.content || "No content yet..."}
                      </p>

                      <div
                        className="text-xs font-medium px-3 py-1 rounded-full inline-block"
                        style={{ backgroundColor: color.border, color: color.text }}
                      >
                        {new Date(note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!isLoading && activeTab === "shared" && (
          <>
            {sharedNotes.length === 0 && (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🤝</p>
                <p className="text-gray-500 text-xl font-semibold mb-2">
                  No shared notes yet!
                </p>
                <p className="text-gray-400">
                  When someone shares a note with you, it will appear here.
                </p>
              </div>
            )}

            {filteredSharedNotes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSharedNotes.map((collab, index) => {
                  const color = NOTE_COLORS[index % NOTE_COLORS.length];
                  return (
                    <div
                      key={collab.id}
                      onClick={() => navigate(`/note/${collab.note.id}`)}
                      className="rounded-2xl p-5 cursor-pointer group transition-transform hover:-translate-y-1 hover:shadow-lg"
                      style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{collab.note.emoji}</span>
                        <span
                          className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{
                            backgroundColor: collab.role === "EDITOR" ? "#dcfce7" : "#f3f4f6",
                            color: collab.role === "EDITOR" ? "#16a34a" : "#6b7280",
                          }}
                        >
                          {collab.role === "EDITOR" ? "✏️ Editor" : "👁️ Viewer"}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg mb-2 truncate" style={{ color: color.text }}>
                        {collab.note.title || "Untitled"}
                      </h3>

                      <p className="text-gray-500 text-sm line-clamp-3 mb-3">
                        {collab.note.content || "No content yet..."}
                      </p>

                      <p className="text-gray-400 text-xs mb-3">
                        Shared by <span className="font-semibold">{collab.note.owner.name}</span>
                      </p>

                      <div
                        className="text-xs font-medium px-3 py-1 rounded-full inline-block"
                        style={{ backgroundColor: color.border, color: color.text }}
                      >
                        {new Date(collab.note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;