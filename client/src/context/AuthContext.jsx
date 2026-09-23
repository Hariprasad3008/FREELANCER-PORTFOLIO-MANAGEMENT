import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { getSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("freelancer_token");
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data.success) {
          setUser(response.data.user);
          getSocket(); // Initialize real-time socket
        } else {
          localStorage.removeItem("freelancer_token");
          localStorage.removeItem("freelancer_user");
        }
      } catch (error) {
        console.warn("Failed to load session:", error.message);
        localStorage.removeItem("freelancer_token");
        localStorage.removeItem("freelancer_user");
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success) {
      const { token, user: loggedUser } = response.data;
      localStorage.setItem("freelancer_token", token);
      localStorage.setItem("freelancer_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      getSocket(); // Connect socket with new token
      return response.data;
    }
    throw new Error(response.data.message || "Login failed");
  }

  async function register({ email, password, fullName, role }) {
    const response = await api.post("/auth/register", {
      email,
      password,
      fullName,
      role,
    });
    if (response.data.success) {
      const { token, user: newUser } = response.data;
      localStorage.setItem("freelancer_token", token);
      localStorage.setItem("freelancer_user", JSON.stringify(newUser));
      setUser(newUser);
      getSocket();
      return response.data;
    }
    throw new Error(response.data.message || "Registration failed");
  }

  function signOut() {
    localStorage.removeItem("freelancer_token");
    localStorage.removeItem("freelancer_user");
    disconnectSocket();
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }

  const value = {
    user,
    role: user?.role,
    isClient: user?.role === "client",
    isFreelancer: user?.role === "freelancer",
    isAuthenticated: !!user,
    login,
    register,
    signOut,
    updateUser,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          <p className="text-xs text-slate-400 font-medium">Connecting to marketplace...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
