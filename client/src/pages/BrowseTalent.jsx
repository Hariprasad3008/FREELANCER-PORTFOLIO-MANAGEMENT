import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useFreelancers } from "../hooks/useFreelancers";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function formatGender(value) {
  if (!value) return null;
  const map = {
    male: "Male",
    female: "Female",
    "non-binary": "Non-binary",
    other: "Other",
  };
  return map[value] || value;
}

export default function BrowseTalent() {
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("any");
  const [saveStatus, setSaveStatus] = useState({});

  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const role = profile?.role || user?.role;

  const { data, isLoading, isError, error } = useFreelancers({
    search,
    experience,
  });

  async function handleSaveFreelancer(freelancerId) {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (role !== "client") {
      alert("Only clients can save freelancers to their bookmarks.");
      return;
    }

    try {
      setSaveStatus((prev) => ({ ...prev, [freelancerId]: "saving" }));
      await api.post(`/saved/profiles/${freelancerId}`);
      setSaveStatus((prev) => ({ ...prev, [freelancerId]: "saved" }));
      queryClient.invalidateQueries(["savedProfiles"]);
    } catch (err) {
      console.error(err);
      setSaveStatus((prev) => ({ ...prev, [freelancerId]: "error" }));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Browse Freelance Talent</h1>
          <p className="text-xs text-slate-400">
            Search verified engineers, designers, and consultants for your projects.
          </p>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 text-xs shadow-lg">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Search by Keyword or Skill
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, UI/UX, Python..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="w-48">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-brand-500 transition"
            >
              <option value="any">Any Experience</option>
              <option value="junior">Junior (1-2 yrs)</option>
              <option value="mid">Mid-level (3-5 yrs)</option>
              <option value="senior">Senior (5+ yrs)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <p className="text-xs text-slate-400">Loading freelancers...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          Error loading talent: {error.message}
        </div>
      )}

      {/* Talent List */}
      {!isLoading && data && (
        <section className="space-y-3">
          {data.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
              No freelancers match your criteria. Try adjusting your search keywords.
            </div>
          )}

          {data.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-4 md:flex-row md:items-center justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center text-base font-bold text-brand-300 shrink-0">
                  {t.full_name?.split(" ").map((n) => n[0]).join("") || "F"}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">
                      {t.full_name || "Unnamed"}
                    </h3>
                    {t.availability_status && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {t.availability_status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t.title || "Freelancer"} • {t.location || "Remote"}
                    {t.category ? ` • ${t.category}` : ""}
                    {t.gender ? ` • ${formatGender(t.gender)}` : ""}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="font-semibold text-emerald-400">
                      {t.hourly_rate ? `$${t.hourly_rate}/hr` : "Rate on request"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300 font-medium">
                      {t.rating ? `${t.rating} ★` : "No rating"}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">
                      {t.projects_completed ?? 0} projects completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex-1 max-w-sm">
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {(t.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/profile/${t.id}`}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/20 transition"
                >
                  View Profile
                </Link>

                {role === "client" && (
                  <button
                    onClick={() => handleSaveFreelancer(t.id)}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-brand-500 hover:text-brand-300 transition"
                  >
                    {saveStatus[t.id] === "saved"
                      ? "✓ Saved"
                      : saveStatus[t.id] === "saving"
                      ? "Saving..."
                      : "Save"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
