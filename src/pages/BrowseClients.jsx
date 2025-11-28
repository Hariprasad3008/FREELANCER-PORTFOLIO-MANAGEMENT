import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClients } from "../hooks/useClients";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { ensureConversation } from "../lib/conversationHelpers";

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
export default function BrowseClients() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const { data: profile } = useCurrentProfile();

  const { data, isLoading, isError, error } = useClients({
    search,
    location,
  });

  async function handleMessageClient(client) {
    if (!client?.id) return;

    if (!profile) {
      navigate("/auth");
      return;
    }

    if (client.id === profile.id) {
      alert("You can't start a conversation with yourself.");
      return;
    }

    try {
      const conversationId = await ensureConversation(profile.id, client.id, {
        full_name: client.full_name,
      });
      navigate(`/messages?c=${conversationId}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert("Could not start a conversation. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Browse Clients</h1>
          <p className="text-xs text-slate-400">
            Connect with active clients to learn more about their needs before
            you apply.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 text-xs">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Product owner, fintech, startup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Remote, Bengaluru, London..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </section>

      {isLoading && (
        <p className="text-xs text-slate-400">Loading clients...</p>
      )}
      {isError && (
        <p className="text-xs text-red-400">Error: {error.message}</p>
      )}

      {!isLoading && data && (
        <section className="space-y-3">
          {data.length === 0 && (
            <p className="text-xs text-slate-400">No clients found.</p>
          )}
          {data.map((client) => {
            const totalPosted = client.projectStats?.total ?? 0;
            const openProjects = client.projectStats?.open ?? 0;

            return (
            <article
              key={client.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-2xl border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-semibold">
                  {client.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "C"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    {client.full_name || "Unnamed client"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {client.title || "Hiring manager"} •{" "}
                    {client.location || "Remote"}
                    {client.category ? ` • ${client.category}` : ""}
                    {client.gender ? ` • ${formatGender(client.gender)}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    {totalPosted} posted projects
                    {openProjects > 0 ? ` • ${openProjects} hiring now` : ""} •{" "}
                    Member since{" "}
                    {client.created_at
                      ? new Date(client.created_at).getFullYear()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex-1 text-xs text-slate-300">
                <p className="line-clamp-3">
                  {client.bio ||
                    "No description yet, but actively hiring on the platform."}
                </p>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  {(client.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-800 px-2 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                  {(client.skills || []).length === 0 && (
                    <span className="text-[11px] text-slate-500">
                      No hiring focus listed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Link
                  to={`/profile/${client.id}`}
                  className="rounded-xl bg-brand-600 px-3 py-1.5 text-[11px] font-medium hover:bg-brand-700 transition"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => handleMessageClient(client)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-[11px] hover:border-brand-500 hover:text-brand-100 transition"
                >
                  Message
                </button>
              </div>
            </article>
          );
          })}
        </section>
      )}
    </div>
  );
}

