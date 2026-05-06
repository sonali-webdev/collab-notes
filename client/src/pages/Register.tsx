import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">

        <div className="h-3" style={{ backgroundColor: "#FF6B6B" }} />

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Sign Up</h1>
          <p className="text-gray-400 text-sm mb-2">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-gray-700 hover:underline">
              Sign in
            </Link>
          </p>

          <div className="flex justify-center mb-6">
            <img
              src="https://undraw.co/api/illustrations/random"
              alt="illustration"
              className="w-48 h-36 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-pink-400 transition">
              <span className="text-gray-400 mr-3">👤</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="flex-1 outline-none text-gray-700 bg-transparent text-sm"
                required
              />
            </div>

            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-pink-400 transition">
              <span className="text-gray-400 mr-3">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 outline-none text-gray-700 bg-transparent text-sm"
                required
              />
            </div>

            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-pink-400 transition">
              <span className="text-gray-400 mr-3">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 outline-none text-gray-700 bg-transparent text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: "#FF6B6B" }}
            >
              {isLoading ? "Creating account..." : (
                <>
                  <span>Sign Up</span>
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;