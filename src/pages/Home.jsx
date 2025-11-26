// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

export default function Home() {
  const { data: profile } = useCurrentProfile();
  const role = profile?.role; // 'client' | 'freelancer' | undefined

  // Featured freelancers (for clients)
  const {
    data: featuredFreelancers,
    isLoading: loadingFreelancers,
    isError: freelancersErrorState,
    error: freelancersError,
  } = useQuery({
    queryKey: ["featured-freelancers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, title, location, hourly_rate, rating, skills, projects_completed"
        )
        .eq("role", "freelancer")
        .order("rating", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Featured clients (for freelancers)
  const {
    data: featuredClients,
    isLoading: loadingClients,
    isError: clientsErrorState,
    error: clientsError,
  } = useQuery({
    queryKey: ["featured-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, location, bio")
        .eq("role", "client")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const isFreelancer = role === "freelancer";
  const isClient = role === "client" || !role; // treat logged-out like client view

  const showFreelancers = isClient;
  const showClients = isFreelancer;

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-300">
              {isFreelancer ? "For Freelancers" : "For Clients"}
            </p>

            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 leading-snug">
              {isFreelancer
                ? "Find high-quality clients and projects in one place."
                : "Discover top freelancers for your next project."}
            </h1>

            <p className="text-xs md:text-sm text-slate-300">
              {isFreelancer
                ? "Browse projects posted by real clients, message them instantly, and manage everything from one clean workspace."
                : "Search by skills, experience, and budget. Save your favorite freelancers and start a conversation in seconds."}
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              {isFreelancer ? (
                <>
                  <Link
                    to="/projects"
                    className="rounded-xl bg-brand-600 px-4 py-2 font-medium hover:bg-brand-700 transition"
                  >
                    Browse Projects
                  </Link>
                  <Link
                    to="/projects"
                    className="rounded-xl border border-slate-700 px-4 py-2 hover:border-brand-500 hover:text-brand-100 transition"
                  >
                    Browse Clients
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/talent"
                    className="rounded-xl bg-brand-600 px-4 py-2 font-medium hover:bg-brand-700 transition"
                  >
                    Browse Talent
                  </Link>
                  <Link
                    to="/projects/new"
                    className="rounded-xl border border-slate-700 px-4 py-2 hover:border-brand-500 hover:text-brand-100 transition"
                  >
                    Post a Project
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Small stats card */}
          <div className="mt-4 md:mt-0 w-full md:w-[260px] space-y-3 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <p className="text-[11px] text-slate-400">Live marketplace</p>
              <p className="text-lg font-semibold text-slate-50">
                Flexible work for{" "}
                <span className="text-brand-300">real people</span>.
              </p>
              <p className="text-[11px] text-slate-400">
                Chat in real-time, bookmark profiles, and keep everything inside
                one simple dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      {showFreelancers && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Featured Freelancers</h2>
              <p className="text-[11px] text-slate-400">
                Handpicked freelancers with strong profiles and ratings.
              </p>
            </div>
            <Link
              to="/talent"
              className="text-[11px] text-brand-300 hover:text-brand-200"
            >
              View all →
            </Link>
          </div>

          {loadingFreelancers && (
            <p className="text-xs text-slate-400">Loading freelancers...</p>
          )}
          {freelancersErrorState && (
            <p className="text-xs text-red-400">
              Error: {freelancersError.message}
            </p>
          )}
          {!loadingFreelancers &&
            featuredFreelancers &&
            featuredFreelancers.length === 0 && (
              <p className="text-xs text-slate-400">
                No freelancers found yet. Ask some users to sign up as
                freelancers.
              </p>
            )}

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featuredFreelancers?.map((f) => (
              <article
                key={f.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
                    {f.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "F"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {f.full_name || "Unnamed"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {f.title || "Freelancer"} • {f.location || "Remote"}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-300">
                  {f.hourly_rate
                    ? `$${f.hourly_rate}/hr`
                    : "Rate on request"}{" "}
                  • {f.projects_completed ?? 0} projects •{" "}
                  {f.rating ? `${f.rating} ★` : "No rating"}
                </p>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(f.skills || []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-800 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                  {f.skills && f.skills.length > 4 && (
                    <span className="text-[10px] text-slate-500">
                      +{f.skills.length - 4} more
                    </span>
                  )}
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <Link
                    to={`/profile/${f.id}`}
                    className="rounded-xl bg-slate-800 px-3 py-1.5 text-[11px] hover:bg-slate-700"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showClients && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Featured Clients</h2>
              <p className="text-[11px] text-slate-400">
                Clients actively posting projects and looking for talent.
              </p>
            </div>
            <Link
              to="/projects"
              className="text-[11px] text-brand-300 hover:text-brand-200"
            >
              Browse projects →
            </Link>
          </div>

          {loadingClients && (
            <p className="text-xs text-slate-400">Loading clients...</p>
          )}
          {clientsErrorState && (
            <p className="text-xs text-red-400">
              Error: {clientsError.message}
            </p>
          )}
          {!loadingClients && featuredClients && featuredClients.length === 0 && (
            <p className="text-xs text-slate-400">
              No clients found yet. Ask some users to sign up as clients.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featuredClients?.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
                    {c.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "C"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {c.full_name || "Client"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {c.location || "Location not set"}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {c.bio || "Active client looking for great freelancers."}
                </p>

                <div className="mt-2 flex justify-between items-center">
                  <Link
                    to={`/profile/${c.id}`}
                    className="rounded-xl bg-slate-800 px-3 py-1.5 text-[11px] hover:bg-slate-700"
                  >
                    View Client
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
