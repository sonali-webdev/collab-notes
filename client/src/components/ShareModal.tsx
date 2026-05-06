import { useState } from "react";
import api from "../services/api";

interface ShareModalProps {
  noteId: string;
  onClose: () => void;
}

const ShareModal = ({ noteId, onClose }: ShareModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post(`/notes/${noteId}/share`, {
        email,
        role,
      });

      setSuccess(response.data.message);
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Share Note 🔗
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Invite someone to collaborate on this note
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="text-gray-600 text-sm font-medium mb-1 block">
              Email address
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 transition">
              <span className="text-gray-400 mr-2">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@gmail.com"
                className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-sm font-medium mb-1 block">
              Permission level
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("EDITOR")}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  backgroundColor: role === "EDITOR" ? "#3B5BDB" : "#f3f4f6",
                  color: role === "EDITOR" ? "white" : "#6b7280",
                }}
              >
                ✏️ Editor
                <p className="text-xs font-normal mt-1 opacity-75">
                  Can read & edit
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("VIEWER")}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  backgroundColor: role === "VIEWER" ? "#3B5BDB" : "#f3f4f6",
                  color: role === "VIEWER" ? "white" : "#6b7280",
                }}
              >
                👁️ Viewer
                <p className="text-xs font-normal mt-1 opacity-75">
                  Can only read
                </p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: "#FF6B6B" }}
          >
            {isLoading ? "Sharing..." : "Share Note →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;