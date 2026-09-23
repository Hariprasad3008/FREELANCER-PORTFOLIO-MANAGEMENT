import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

export default function BrowseProjects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [saveStatus, setSaveStatus] = useState({});

  const { data, isLoading, isError, error } = useProjects({ search, category });
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const role = profile?.role || user?.role;

  async function handleSaveProject(projectId) {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (role !== "freelancer") {
      alert("Only freelancers can save projects to bookmarks.");
      return;
    }

    try {
      setSaveStatus((prev) => ({ ...prev, [projectId]: "saving" }));
      await api.post(`/saved/projects/${projectId}`);
      setSaveStatus((prev) => ({ ...prev, [projectId]: "saved" }));
      queryClient.invalidateQueries(["savedProjects"]);
    } catch (err) {
      console.error(err);
      setSaveStatus((prev) => ({ ...prev, [projectId]: "error" }));
    }
  }

  async function handleMessageClient(client) {
    if (!client?.id) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    if (client.id === user.id) {
      alert("You cannot start a conversation with yourself.");
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
          <h1 className="text-xl font-bold text-slate-100">Explore Open Projects</h1>
          <p className="text-xs text-slate-400">
            Find high-value contract opportunities matching your technical expertise.
          </p>
        </div>

        {role === "client" && (
          <Link
            to="/projects/new"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 transition"
          >
            + Post a New Project
          </Link>
        )}
      </header>

      {/* Filters Bar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 text-xs shadow-lg">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Search Projects
            </label>
            <input
              type="text"
              placeholder="e.g. React dashboard, Node.js API, UI design, mobile app..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="w-48">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-brand-500 transition"
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
            </select>
          </div>
        </div>
      </section>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <p className="text-xs text-slate-400">Loading projects...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          Error loading projects: {error.message}
        </div>
      )}

      {/* Projects List */}
      {!isLoading && data && (
        <section className="space-y-4">
          {data.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
              No projects found matching your search criteria.
            </div>
          )}

          {data.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 hover:border-slate-700 transition shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium capitalize">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Posted by{" "}
                    <Link
                      to={`/profile/${p.client?.id}`}
                      className="text-slate-200 font-medium hover:text-brand-300 transition"
                    >
                      {p.client?.full_name || "Client"}
                    </Link>
                    {p.client?.location ? ` • ${p.client.location}` : ""}
                    {p.category ? ` • ${p.category}` : ""}
                  </p>
                </div>

                <div className="text-right text-xs shrink-0">
                  <p className="font-bold text-emerald-400 text-sm">
                    {p.budget_min || p.budget_max
                      ? `$${p.budget_min || ""}${
                          p.budget_min && p.budget_max ? " - $" : ""
                        }${p.budget_max || ""} ${
                          p.budget_type ? `(${p.budget_type})` : ""
                        }`
                      : "Budget not set"}
                  </p>
                  {p.deadline && (
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Deadline: {p.deadline}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

              <div className="flex flex-wrap gap-1.5 text-[10px] pt-1">
                {(p.required_skills || []).map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300 border border-slate-700/60 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Posted {new Date(p.created_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {role === "freelancer" && (
                    <button
                      onClick={() => handleSaveProject(p.id)}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-brand-500 hover:text-brand-300 transition"
                    >
                      {saveStatus[p.id] === "saved"
                        ? "✓ Saved"
                        : saveStatus[p.id] === "saving"
                        ? "Saving..."
                        : "Save Project"}
                    </button>
                  )}

                  <button
                    onClick={() => handleMessageClient(p.client)}
                    className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/20 transition"
                  >
                    Contact Client
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
