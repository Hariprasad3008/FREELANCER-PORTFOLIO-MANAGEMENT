// src/pages/SavedProfiles.jsx
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSavedProfiles } from "../hooks/useSavedProfiles";
import { useSavedProjects } from "../hooks/useSavedProjects";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

export default function SavedProfiles() {
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  const role = profile?.role;

  const {
    data: savedProfiles,
    isLoading: loadingProfiles,
    isError: errProfiles,
    error: profilesError,
  } = useSavedProfiles();

  const {
    data: savedProjects,
    isLoading: loadingProjects,
    isError: errProjects,
    error: projectsError,
  } = useSavedProjects();

  async function removeSavedProfile(id) {
    const { error } = await supabase
      .from("saved_profiles")
      .delete()
      .eq("id", id);
    if (!error) {
      queryClient.invalidateQueries(["savedProfiles"]);
    } else {
      console.error(error);
    }
  }

  async function removeSavedProject(id) {
    const { error } = await supabase
      .from("saved_projects")
      .delete()
      .eq("id", id);
    if (!error) {
      queryClient.invalidateQueries(["savedProjects"]);
    } else {
      console.error(error);
    }
  }

  if (!role) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Saved</h1>
        <p className="text-xs text-slate-400">
          Login and complete your profile to see saved items.
        </p>
      </div>
    );
  }

  const isClient = role === "client";
  const isFreelancer = role === "freelancer";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        {isClient ? "Saved Freelancers" : "Saved Projects"}
      </h1>
      <p className="text-xs text-slate-400">
        {isClient
          ? "These are freelancers you've bookmarked."
          : "These are projects you've bookmarked."}
      </p>

      {/* Client view: saved freelancers */}
      {isClient && (
        <>
          {loadingProfiles && (
            <p className="text-xs text-slate-400 mt-4">
              Loading saved freelancers...
            </p>
          )}
          {errProfiles && (
            <p className="text-xs text-red-400 mt-4">
              Error loading saved freelancers: {profilesError.message}
            </p>
          )}
          {!loadingProfiles && savedProfiles && savedProfiles.length === 0 && (
            <p className="text-xs text-slate-400 mt-4">
              You haven't saved any freelancers yet.
            </p>
          )}

          <div className="space-y-3 mt-4">
            {savedProfiles?.map((row) => {
              const f = row.freelancer;
              if (!f) return null;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
                      {f.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "F"}
                    </div>
                    <div>
                      <Link
                        to={`/profile/${f.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-brand-400"
                      >
                        {f.full_name || "Unnamed"}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {f.title || "Freelancer"}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {f.hourly_rate
                          ? `$${f.hourly_rate}/hr`
                          : "Rate on request"}{" "}
                        • {(f.projects_completed ?? 0) + " projects"} •{" "}
                        {(f.rating ?? "No rating") + " ★"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSavedProfile(row.id)}
                    className="rounded-xl border border-slate-700 px-3 py-1.5 text-[11px] hover:border-brand-500 hover:text-brand-100 transition"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Freelancer view: saved projects */}
      {isFreelancer && (
        <>
          {loadingProjects && (
            <p className="text-xs text-slate-400 mt-4">
              Loading saved projects...
            </p>
          )}
          {errProjects && (
            <p className="text-xs text-red-400 mt-4">
              Error loading saved projects: {projectsError.message}
            </p>
          )}
          {!loadingProjects && savedProjects && savedProjects.length === 0 && (
            <p className="text-xs text-slate-400 mt-4">
              You haven't saved any projects yet.
            </p>
          )}

          <div className="space-y-3 mt-4">
            {savedProjects?.map((row) => {
              const p = row.project;
              if (!p) return null;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {p.status}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSavedProject(row.id)}
                      className="rounded-xl border border-slate-700 px-3 py-1.5 text-[11px] hover:border-brand-500 hover:text-brand-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {p.description || "No description"}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
