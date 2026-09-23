import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("freelancer"); // 'client' | 'freelancer'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setNote("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await register({ email, password, fullName, role });
        setNote("Account created successfully!");
        navigate("/");
      } else {
        await login(email, password);
        setNote("Logged in!");
        navigate("/");
      }
    } catch (err) {
      setNote(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-xl shadow-lg shadow-brand-600/30">
          F
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-xs text-slate-400">
          {mode === "login"
            ? "Enter your credentials to access your marketplace dashboard."
            : "Join as a client to hire top talent or as a freelancer to find work."}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-xs space-y-4 shadow-xl shadow-black/40 backdrop-blur">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 transition placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("freelancer")}
                    className={`rounded-xl border p-3 text-left transition flex flex-col gap-1 ${
                      role === "freelancer"
                        ? "border-brand-500 bg-brand-600/15 text-white"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200">Work as Freelancer</span>
                    <span className="text-[10px] text-slate-400">Find projects & earn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    className={`rounded-xl border p-3 text-left transition flex flex-col gap-1 ${
                      role === "client"
                        ? "border-brand-500 bg-brand-600/15 text-white"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200">Hire as Client</span>
                    <span className="text-[10px] text-slate-400">Post jobs & contract talent</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 transition placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 transition placeholder:text-slate-500"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            {mode === "login" ? "Don't have an account?" : "Already registered?"}
          </span>
          <button
            type="button"
            className="font-semibold text-brand-400 hover:text-brand-300 transition"
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setNote("");
            }}
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </div>

        {note && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-300">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
