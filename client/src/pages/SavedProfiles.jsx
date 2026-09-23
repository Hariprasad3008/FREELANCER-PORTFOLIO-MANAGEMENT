import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useSavedProfiles } from "../hooks/useSavedProfiles";
import { useSavedProjects } from "../hooks/useSavedProjects";
import api from "../services/api";

export default function SavedProfiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  const { data: savedProfiles, isLoading: loadingProfiles } = useSavedProfiles();
  const { data: savedProjects, isLoading: loadingProjects } = useSavedProjects();

  async function handleUnsaveProfile(freelancerId) {
    try {
      await api.delete(`/saved/profiles/${freelancerId}`);
      queryClient.invalidateQueries(["savedProfiles"]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUnsaveProject(projectId) {
    try {
      await api.delete(`/saved/projects/${projectId}`);
      queryClient.invalidateQueries(["savedProjects"]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Saved Bookmarks</h1>
        <p className="text-xs text-slate-400">
          {isClient
            ? "Your bookmarked freelancer profiles."
            : "Your saved project listings."}
        </p>
      </header>

      {/* CLIENT SAVED FREELANCERS */}
      {isClient && (
        <section className="space-y-3">
          {loadingProfiles && <p className="text-xs text-slate-400">Loading saved talent...</p>}

          {!loadingProfiles && savedProfiles?.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
              No saved freelancers yet. Explore talent and click "Save" to bookmark them here.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {savedProfiles?.map((item) => {
              const f = item.freelancer;
              return (
                <article
                  key={f.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-600/30 text-brand-300 flex items-center justify-center text-xs font-bold border border-brand-500/30">
                        {f.full_name?.split(" ").map((n) => n[0]).join("") || "F"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{f.full_name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {f.title || "Freelancer"} • {f.location || "Remote"}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-400 font-semibold">
                      {f.hourly_rate ? `$${f.hourly_rate}/hr` : "Rate on request"} •{" "}
                      <span className="text-amber-300">{f.rating ? `${f.rating} ★` : "New"}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/profile/${f.id}`}
                      className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 transition"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() => handleUnsaveProfile(f.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* FREELANCER SAVED PROJECTS */}
      {isFreelancer && (
        <section className="space-y-3">
          {loadingProjects && <p className="text-xs text-slate-400">Loading saved projects...</p>}

          {!loadingProjects && savedProjects?.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
              No saved projects yet. Browse open projects and bookmark interesting gigs.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {savedProjects?.map((item) => {
              const p = item.project;
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      {p.budget_min || p.budget_max
                        ? `$${p.budget_min || ""}${p.budget_min && p.budget_max ? " - $" : ""}${p.budget_max || ""}`
                        : "Budget not set"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to="/projects"
                      className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 transition"
                    >
                      View in Projects
                    </Link>

                    <button
                      onClick={() => handleUnsaveProject(p.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
