import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [skillsText, setSkillsText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("open");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setCategory(project.category || "Web Development");
      setBudgetMin(project.budget_min ?? "");
      setBudgetMax(project.budget_max ?? "");
      setBudgetType(project.budget_type || "fixed");
      setSkillsText((project.required_skills || []).join(", "));
      setDeadline(project.deadline || "");
      setStatus(project.status || "open");
    }
  }, [project]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.put(`/projects/${id}`, {
        title: title.trim(),
        description: description.trim(),
        category,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        budget_type: budgetType,
        required_skills: skillsArray,
        deadline: deadline.trim() || null,
        status,
      });

      if (res.data.success) {
        queryClient.invalidateQueries(["projects"]);
        queryClient.invalidateQueries(["project", id]);
        navigate(`/profile/${user?.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project listing?")) return;

    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      queryClient.invalidateQueries(["projects"]);
      navigate(`/profile/${user?.id}`);
    } catch (err) {
      alert("Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return <p className="text-xs text-slate-400 py-10">Loading project details...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Edit Project Listing</h1>
          <p className="text-xs text-slate-400">Update the job details, budget, and open status.</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Project"}
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 space-y-5 text-xs shadow-xl backdrop-blur"
      >
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Project Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Project Description</label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500 leading-relaxed"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            >
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Project Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            >
              <option value="open">Open (Accepting Proposals)</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Min Budget ($)</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Max Budget ($)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Deadline</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Required Skills</label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 transition disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
