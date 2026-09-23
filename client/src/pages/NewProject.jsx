import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [skillsText, setSkillsText] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post("/projects", {
        title: title.trim(),
        description: description.trim(),
        category,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        budget_type: budgetType,
        required_skills: skillsArray,
        deadline: deadline.trim() || null,
      });

      if (res.data.success) {
        navigate("/projects");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Post a New Project</h1>
        <p className="text-xs text-slate-400">
          Describe the project scope, required skills, and budget to attract the best talent.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 space-y-5 text-xs shadow-xl backdrop-blur"
      >
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Project Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Build a Responsive Web Application with React & Node.js"
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
            placeholder="Detail the deliverables, timeline, milestones, and technical requirements..."
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
            <label className="text-[11px] font-medium text-slate-300">Budget Type</label>
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Min Budget ($)</label>
            <input
              type="number"
              placeholder="500"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Max Budget ($)</label>
            <input
              type="number"
              placeholder="2000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Target Deadline</label>
            <input
              type="text"
              placeholder="e.g. 3 Weeks"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            placeholder="React, PostgreSQL, REST API, Tailwind CSS"
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
            onClick={() => navigate("/projects")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
