import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { supabase } from "../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: loadingProfile } = useCurrentProfile();

  const [loadingProject, setLoadingProject] = useState(true);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    budget_type: "fixed",
    deadline: "",
    skills: "",
  });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      setLoadingProject(true);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setNote(error.message);
      } else {
        setProject(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          budget_min: data.budget_min ?? "",
          budget_max: data.budget_max ?? "",
          budget_type: data.budget_type || "fixed",
          deadline: data.deadline || "",
          skills: (data.required_skills || []).join(", "),
        });
      }

      setLoadingProject(false);
    }

    fetchProject();
  }, [id]);

  const isOwner = profile && project && profile.id === project.client_id;

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!profile || !isOwner) return;

    setSaving(true);
    setNote("");

    try {
      const skillsArray = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("projects")
        .update({
          title: form.title,
          description: form.description,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          budget_type: form.budget_type,
          deadline: form.deadline || null,
          required_skills: skillsArray,
        })
        .eq("id", id)
        .eq("client_id", profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({
        queryKey: ["user-projects", profile.id],
      });

      setNote("Project updated.");
    } catch (err) {
      setNote(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!profile || !isOwner) return;
    const confirmed = window.confirm(
      "Delete this project? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setNote("");

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("client_id", profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({
        queryKey: ["user-projects", profile.id],
      });

      navigate(`/profile/${profile.id}`);
    } catch (err) {
      setNote(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loadingProfile || loadingProject) {
    return <p className="text-xs text-slate-400">Loading project...</p>;
  }

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Edit Project</h1>
        <p className="text-xs text-slate-400">
          You must be logged in as a client to edit projects.
        </p>
      </div>
    );
  }

  if (!project || !isOwner) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Edit Project</h1>
        <p className="text-xs text-slate-400">
          Project not found or you do not have permission to edit it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Project</h1>
          <p className="text-xs text-slate-400">
            Update details or delete the project if it is no longer needed.
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl border border-red-600/60 px-3 py-1.5 text-xs text-red-400 hover:bg-red-600/10 transition disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-3"
      >
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Description</label>
          <textarea
            rows={4}
            required
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Budget Min</label>
            <input
              type="number"
              value={form.budget_min}
              onChange={(e) => updateForm("budget_min", e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Budget Max</label>
            <input
              type="number"
              value={form.budget_max}
              onChange={(e) => updateForm("budget_max", e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Budget Type</label>
          <select
            value={form.budget_type}
            onChange={(e) => updateForm("budget_type", e.target.value)}
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
            value={form.deadline}
            onChange={(e) => updateForm("deadline", e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => updateForm("skills", e.target.value)}
            placeholder="React, Supabase, Tailwind..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <button
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {note && <p className="text-[11px] text-amber-300 mt-1">{note}</p>}
      </form>
    </div>
  );
}

