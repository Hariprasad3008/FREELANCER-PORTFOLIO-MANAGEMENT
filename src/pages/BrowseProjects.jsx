import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { supabase } from "../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export default function BrowseProjects() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useProjects({ search });
  const { data: profile } = useCurrentProfile();
  const queryClient = useQueryClient();
  const role = profile?.role;

  async function handleSaveProject(projectId) {
    if (!profile) {
      alert("Please log in as a freelancer to save projects.");
      return;
    }
    if (role !== "freelancer") {
      alert("Only freelancers can save projects.");
      return;
    }

    const { error: insertError } = await supabase.from("saved_projects").insert({
      freelancer_id: profile.id,
      project_id: projectId,
    });

    if (insertError && insertError.code !== "23505") {
      console.error(insertError);
    } else {
      queryClient.invalidateQueries(["savedProjects"]);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Browse Projects</h1>
          <p className="text-xs text-slate-400">
            Find clients looking for your skills and experience.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 text-xs">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-slate-400 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="dashboard, landing page, API..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </section>

      {isLoading && (
        <p className="text-xs text-slate-400">Loading projects...</p>
      )}
      {isError && (
        <p className="text-xs text-red-400">Error: {error.message}</p>
      )}

      {!isLoading && data && (
        <section className="space-y-3">
          {data.length === 0 && (
            <p className="text-xs text-slate-400">No projects found.</p>
          )}
          {data.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{p.title}</h3>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {p.status}
                  </p>
                </div>
                <div className="text-xs text-right">
                  <p className="text-slate-200">
                    {p.budget_min || p.budget_max
                      ? `$${p.budget_min || ""}${
                          p.budget_min && p.budget_max ? " - " : ""
                        }${p.budget_max || ""} ${
                          p.budget_type ? `(${p.budget_type})` : ""
                        }`
                      : "Budget not set"}
                  </p>
                  {p.deadline && (
                    <p className="text-slate-400 text-[11px]">
                      Deadline: {p.deadline}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-300">{p.description}</p>
              <div className="flex flex-wrap gap-1 text-[10px] mt-2">
                {(p.required_skills || []).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-800 px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => handleSaveProject(p.id)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-[11px] hover:border-brand-500 hover:text-brand-100 transition"
                >
                  Save
                </button>
                <button className="rounded-xl bg-brand-600 px-3 py-1.5 text-[11px] font-medium hover:bg-brand-700 transition">
                  Message Client
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
