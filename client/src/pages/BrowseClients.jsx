import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClients } from "../hooks/useClients";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function BrowseClients() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useClients({ search });
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleMessageClient(client) {
    if (!client?.id) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    if (client.id === user.id) {
      alert("You cannot message yourself.");
      return;
    }

    try {
      const res = await api.post("/messages/conversations", {
        targetUserId: client.id,
      });
      if (res.data.success) {
        navigate(`/messages?c=${res.data.conversationId}`);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert(err.response?.data?.message || "Could not start conversation.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Browse Active Clients</h1>
          <p className="text-xs text-slate-400">
            Connect with companies and founders looking for top freelance talent.
          </p>
        </div>
      </header>

      {/* Search Filter */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 text-xs shadow-lg">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Search by Name, Industry, or Location
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor, Fintech, New York..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      </section>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <p className="text-xs text-slate-400">Loading clients...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          Error loading clients: {error.message}
        </div>
      )}

      {/* Clients Grid */}
      {!isLoading && data && (
        <section className="space-y-3">
          {data.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
              No clients found matching your search.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {data.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                      {c.full_name?.split(" ").map((n) => n[0]).join("") || "C"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        {c.full_name || "Unnamed Client"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {c.title || "Client"} • {c.location || "Location not specified"}
                        {c.category ? ` • ${c.category}` : ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {c.bio || "Active client seeking top talent on the marketplace."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    to={`/profile/${c.id}`}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={() => handleMessageClient(c)}
                    className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/20 transition"
                  >
                    Message Client
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
