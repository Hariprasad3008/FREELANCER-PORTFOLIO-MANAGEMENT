export default function About() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">About FreelanceHub</h1>
        <p className="text-sm text-slate-400">
          A high-performance, full-stack marketplace connecting skilled freelancers with top clients.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 text-xs shadow-xl backdrop-blur">
        <h2 className="text-sm font-bold text-slate-200">Architecture & Technical Stack</h2>
        <p className="text-slate-300 leading-relaxed">
          FreelanceHub is engineered as a modern full-stack web application with separation of concerns:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-brand-400">Frontend Layer</span>
            <p className="font-semibold text-slate-200">React.js, Tailwind CSS & Vite</p>
            <p className="text-slate-400 text-[11px]">
              Component-driven design, responsive UI layouts, and TanStack React Query for state caching.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-brand-400">Backend API Layer</span>
            <p className="font-semibold text-slate-200">Node.js, Express & REST APIs</p>
            <p className="text-slate-400 text-[11px]">
              Clean MVC pattern with JWT authentication, role-based authorization, and bcrypt password hashing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-brand-400">Real-Time Messaging</span>
            <p className="font-semibold text-slate-200">WebSockets & Socket.IO</p>
            <p className="text-slate-400 text-[11px]">
              Low-latency messaging rooms, live typing indicators, and presence tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-brand-400">Database Layer</span>
            <p className="font-semibold text-slate-200">PostgreSQL (or Supabase Postgres)</p>
            <p className="text-slate-400 text-[11px]">
              Relational schemas with foreign keys, indexes, transactions, and migration scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
