// src/pages/EditProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { supabase } from "../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export default function EditProfile() {
  const { data: profile, isLoading, isError, error } = useCurrentProfile();
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [skillsInput, setSkillsInput] = useState("");
  const [projectsCompleted, setProjectsCompleted] = useState("");
  const [successRate, setSuccessRate] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Populate form when profile loads
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setTitle(profile.title || "");
    setLocation(profile.location || "");
    setBio(profile.bio || "");
    setHourlyRate(profile.hourly_rate ?? "");
    setExperienceLevel(profile.experience_level || "mid");
    setAvailabilityStatus(profile.availability_status || "available");
    setSkillsInput((profile.skills || []).join(", "));
    setGender(profile.gender || "");
    setCategory(profile.category || "");
    setProjectsCompleted(
      typeof profile.projects_completed === "number"
        ? String(profile.projects_completed)
        : ""
    );
    setSuccessRate(
      typeof profile.success_rate === "number"
        ? String(profile.success_rate)
        : ""
    );
  }, [profile]);

  const isFreelancer = profile?.role === "freelancer";
  const isClient = profile?.role === "client";

  if (isLoading) {
    return (
      <p className="text-xs text-slate-400">Loading your profile...</p>
    );
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Error loading profile: {error.message}
      </p>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Edit Profile</h1>
        <p className="text-xs text-slate-400">
          You need to be logged in with a profile to edit it.
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setNote("");

    try {
      const parsedProjects =
        projectsCompleted === "" ? null : Number(projectsCompleted);
      const parsedSuccess =
        successRate === "" ? null : Number(successRate);

      if (
        (parsedProjects !== null &&
          (Number.isNaN(parsedProjects) || parsedProjects < 0)) ||
        (parsedSuccess !== null &&
          (Number.isNaN(parsedSuccess) ||
            parsedSuccess < 0 ||
            parsedSuccess > 100))
      ) {
        setNote(
          "Projects completed must be 0+ and job success between 0 and 100."
        );
        setSaving(false);
        return;
      }

      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          title,
          location,
          bio,
          hourly_rate: hourlyRate ? Number(hourlyRate) : null,
          experience_level: experienceLevel || null,
          availability_status: isFreelancer ? availabilityStatus || null : null,
          gender: gender || null,
          category: category || null,
          skills: skillsArray,
          projects_completed: parsedProjects,
          success_rate:
            parsedSuccess === null
              ? null
              : Number(parsedSuccess.toFixed(1)),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Refresh profile caches
      queryClient.invalidateQueries(["current-profile"]);
      queryClient.invalidateQueries(["profile", profile.id]);
      queryClient.invalidateQueries(["freelancers"]);

      setNote("Profile updated!");
      navigate(`/profile/${profile.id}`);
    } catch (err) {
      setNote(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Edit Profile</h1>
      <p className="text-xs text-slate-400">
        Keep your profile up to date so clients and freelancers can understand
        who you are and what you do.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-3"
      >
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            {isClient ? "Role / Company" : "Title"}
          </label>
          <input
            type="text"
            placeholder={
              isClient
                ? "e.g. Product Lead, Agency owner..."
                : "Full Stack Developer, Product Designer..."
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Location</label>
          <input
            type="text"
            placeholder="Bangalore, Remote..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Bio</label>
          <textarea
            rows={4}
            placeholder="Tell clients and collaborators about your skills, experience, and what you like working on."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            {isClient ? "Industry / Category" : "Primary Category"}
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={
              isClient
                ? "Healthcare, Fintech, Agency..."
                : "Frontend, Data, Product..."
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        {isFreelancer && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  Hourly rate (USD)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  Experience level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  Projects completed
                </label>
                <input
                  type="number"
                  min="0"
                  value={projectsCompleted}
                  onChange={(e) => setProjectsCompleted(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  Job success (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={successRate}
                  onChange={(e) => setSuccessRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">
                Availability status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="not-looking">Not looking</option>
              </select>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            {isClient
              ? "Roles or skills you hire for (comma separated)"
              : "Skills (comma separated)"}
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, Node.js, Tailwind, Supabase"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
          />
        </div>

        <button
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {note && <p className="text-[11px] text-amber-300 mt-1">{note}</p>}
      </form>
    </div>
  );
}
