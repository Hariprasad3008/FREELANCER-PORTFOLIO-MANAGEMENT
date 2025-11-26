import { useState } from "react";
import { Link } from "react-router-dom";
import { useFreelancers } from "../hooks/useFreelancers";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { supabase } from "../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export default function BrowseTalent() {
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("any");
  const queryClient = useQueryClient();

  const { data: profile } = useCurrentProfile();
  const role = profile?.role;

  const { data, isLoading, isError, error } = useFreelancers({
    search,
    experience,
  });

  async function handleSaveFreelancer(freelancerId) {
    if (!profile) {
      alert("Please log in as a client to save freelancers.");
      return;
    }
    if (role !== "client") {
      alert("Only clients can save freelancers.");
      return;
    }

    const { error: insertError } = await supabase.from("saved_profiles").insert({
      client_id: profile.id,
      freelancer_id: freelancerId,
    });

    if (insertError && insertError.code !== "23505") {
      // 23505 = unique violation (already saved)
      console.error(insertError);
    } else {
      queryClient.invalidateQueries(["savedProfiles"]);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Browse Freelancers</h1>
          <p className="text-xs text-slate-400">
            Filter by skills, experience level, rate, and availability.
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
              placeholder="React, UI designer, data engineer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            >
              <option value="any">Any</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data states */}
      {isLoading && (
        <p className="text-xs text-slate-400">Loading freelancers...</p>
      )}
      {isError && (
        <p className="text-xs text-red-400">Error: {error.message}</p>
      )}

      {/* Talent List */}
      {!isLoading && data && (
        <section className="space-y-3">
          {data.length === 0 && (
            <p className="text-xs text-slate-400">No freelancers found.</p>
          )}
          {data.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-2xl border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-semibold">
                  {t.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "F"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    {t.full_name || "Unnamed"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.title || "Freelancer"} • {t.location || "Remote"}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    {t.experience_level || "N/A"} •{" "}
                    {t.hourly_rate
                      ? `$${t.hourly_rate}/hr`
                      : "Rate on request"}
                  </p>
                </div>
              </div>

              <div className="flex-1 text-xs text-slate-300">
                <p>
                  {(t.projects_completed ?? 0) + " projects"} •{" "}
                  {(t.rating ?? "No rating") + " ★"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  {(t.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-800 px-2 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Link
                  to={`/profile/${t.id}`}
                  className="rounded-xl bg-brand-600 px-3 py-1.5 text-[11px] font-medium hover:bg-brand-700 transition"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => handleSaveFreelancer(t.id)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-[11px] hover:border-brand-500 hover:text-brand-100 transition"
                >
                  Save
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
