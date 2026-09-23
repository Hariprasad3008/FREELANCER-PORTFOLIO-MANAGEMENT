import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

export default function Home() {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const role = profile?.role || user?.role;

  // Featured freelancers
  const {
    data: featuredFreelancers,
    isLoading: loadingFreelancers,
  } = useQuery({
    queryKey: ["featured-freelancers"],
    queryFn: async () => {
      const res = await api.get("/profiles/freelancers?limit=6");
      return res.data.data;
    },
  });

  // Featured clients
  const {
    data: featuredClients,
    isLoading: loadingClients,
  } = useQuery({
    queryKey: ["featured-clients"],
    queryFn: async () => {
      const res = await api.get("/profiles/clients?limit=6");
      return res.data.data;
    },
  });

  const isFreelancer = role === "freelancer";
  const isClient = role === "client" || !role;

  return (
    <div className="space-y-10">
      {/* HERO BANNER */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8 md:px-8 md:py-10 relative overflow-hidden shadow-2xl shadow-black/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] font-semibold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse"></span>
              {isFreelancer ? "Freelancer Portal" : "Client Portal"}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-50 leading-snug tracking-tight">
              {isFreelancer
                ? "Find high-impact projects and connect with top clients."
                : "Discover and hire vetted freelance experts for your next build."}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {isFreelancer
                ? "Browse verified client projects, submit proposals, chat in real-time via WebSockets, and build an impressive portfolio."
                : "Search by skills, experience level, and budget. Manage contracts, chat in real-time, and bookmark your top talent."}
            </p>

            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              {isFreelancer ? (
                <>
                  <Link
                    to="/projects"
                    className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/30 transition"
                  >
                    Browse Open Projects
                  </Link>
                  <Link
                    to="/clients"
                    className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 font-medium hover:border-brand-500 hover:text-brand-100 transition"
                  >
                    Browse Clients
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/talent"
                    className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/30 transition"
                  >
                    Explore Talent
                  </Link>
                  <Link
                    to="/projects/new"
                    className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 font-medium hover:border-brand-500 hover:text-brand-100 transition"
                  >
                    Post a Project
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats / Info Widget */}
          <div className="w-full md:w-[280px] space-y-3 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 space-y-2.5 backdrop-blur shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                  Live Platform
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-base font-bold text-slate-50">
                Full-Stack Architecture & Real-Time Sync
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Powered by Node.js, Express, PostgreSQL, and Socket.IO for real-time messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FREELANCERS */}
      {isClient && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Featured Freelancers</h2>
              <p className="text-xs text-slate-400">
                Top-rated professionals ready for contract work.
              </p>
            </div>
            <Link
              to="/talent"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              View all talent →
            </Link>
          </div>

          {loadingFreelancers && (
            <p className="text-xs text-slate-400">Loading freelancers...</p>
          )}

          {!loadingFreelancers && featuredFreelancers?.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
              No freelancers registered yet.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredFreelancers?.map((f) => (
              <article
                key={f.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between gap-3 text-xs hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-300">
                      {f.full_name?.split(" ").map((n) => n[0]).join("") || "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">
                        {f.full_name || "Freelancer"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {f.title || "Specialist"} • {f.location || "Remote"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-emerald-400">
                      {f.hourly_rate ? `$${f.hourly_rate}/hr` : "Rate on request"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300 font-medium">
                      {f.rating ? `${f.rating} ★` : "New"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      {f.projects_completed ?? 0} jobs done
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {(f.skills || []).slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                  <Link
                    to={`/profile/${f.id}`}
                    className="w-full text-center rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED CLIENTS */}
      {isFreelancer && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Featured Clients</h2>
              <p className="text-xs text-slate-400">
                Companies and founders actively hiring on the platform.
              </p>
            </div>
            <Link
              to="/clients"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              Browse all clients →
            </Link>
          </div>

          {loadingClients && (
            <p className="text-xs text-slate-400">Loading clients...</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredClients?.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between gap-3 text-xs hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {c.full_name?.split(" ").map((n) => n[0]).join("") || "C"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {c.full_name || "Client"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {c.location || "Remote"} • {c.category || "General"}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {c.bio || "Active client posting projects."}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <Link
                    to={`/profile/${c.id}`}
                    className="w-full block text-center rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition"
                  >
                    View Client Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
