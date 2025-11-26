// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("freelancer"); // 'client' | 'freelancer'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setNote("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // 1) Sign up in Supabase Auth with role metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, full_name: fullName },
          },
        });
        if (error) throw error;

        const user = data.user;

        // If email confirmation is required, user might be null
        if (!user) {
          setNote("Signup successful. Check your email to confirm, then log in.");
          setLoading(false);
          return;
        }

        // 2) Create profile row (matches RLS: auth.uid() = id)
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          role,
          full_name: fullName,
        });

        if (profileError) throw profileError;

        setNote("Signup successful! You are now logged in.");
        navigate("/"); // redirect to home
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setNote("Logged in!");
        navigate("/");
      }
    } catch (err) {
      setNote(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">
        {mode === "login" ? "Login" : "Create an account"}
      </h1>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-3">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">I am a</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={role === "client"}
                      onChange={() => setRole("client")}
                    />
                    <span>Client</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="role"
                      value="freelancer"
                      checked={role === "freelancer"}
                      onChange={() => setRole("freelancer")}
                    />
                    <span>Freelancer</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <button
          className="text-[11px] text-brand-400 hover:text-brand-300"
          onClick={() =>
            setMode((m) => (m === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>

        {note && <p className="text-[11px] text-amber-300 mt-1">{note}</p>}
      </div>
    </div>
  );
}
