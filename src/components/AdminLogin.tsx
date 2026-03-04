import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("user_role") === "admin") {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const adminRes = await fetch("/api/admin/password");
      const adminData = await adminRes.json();
      const adminPass = adminData.password || "EARIST";

      if (password !== adminPass) {
        throw new Error("Invalid admin password");
      }

      localStorage.setItem("user_role", "admin");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Student Portal
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-red-100 rounded-2xl">
            <Shield className="w-7 h-7 text-red-700" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Admin Login</h1>
          <p className="text-neutral-500">Administrators sign in here.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 block">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-4 border-2 border-neutral-200 rounded-2xl bg-neutral-50 focus:border-red-500 focus:ring-0 outline-none transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-2xl transition-colors"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
