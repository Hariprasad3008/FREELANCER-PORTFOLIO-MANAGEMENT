// src/components/Layout.jsx
import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex justify-between">
          <span>© 2025 FreelanceHub</span>
          <span>Built with React, Supabase & Vite</span>
        </div>
      </footer>
    </div>
  );
}
