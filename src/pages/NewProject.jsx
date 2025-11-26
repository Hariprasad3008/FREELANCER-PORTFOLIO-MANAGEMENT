// src/pages/NewProject.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { supabase } from "../lib/supabaseClient";

export default function NewProject() {
  const { data: profile, isLoading } = useCurrentProfile();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <p className="text-xs text-slate-400">Loading your profile...</p>
    );
  }

  if (!profile || profile.role !== "client") {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Post a Project</h1>
        <p className="text-xs text-slate-400">
          Only logged-in clients can post projects.
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setNote("");

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from("projects").insert({
        client_id: profile.id,
        title,
        description,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        budget_type: budgetType,
        deadline: deadline || null,
        required_skills: skillsArray,
        status: "open",
      });

      if (error) throw error;

      setNote("Project created!");
      navigate("/projects");
    } catch (err) {
      setNote(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Post a New Project</h1>
      <p className="text-xs text-slate-400">
        Fill in the details below. Freelancers will be able to find this in the
        Browse Projects page.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-3"
      >
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Budget Min</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Budget Max</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Budget Type</label>
          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Node.js, Supabase"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <button
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Project"}
        </button>

        {note && <p className="text-[11px] text-amber-300 mt-1">{note}</p>}
      </form>
    </div>
  );
}
