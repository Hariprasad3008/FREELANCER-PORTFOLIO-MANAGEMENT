import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 mt-12 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 FreelanceHub Marketplace. All rights reserved.</span>
          <span className="text-slate-500 text-[11px]">
            Full-Stack Architecture: React • Node.js • Express • PostgreSQL • Socket.IO
          </span>
        </div>
      </footer>
    </div>
  );
}
