import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import api from "../services/api";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { data: profile, isLoading } = useCurrentProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Portfolio items state
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioTags, setPortfolioTags] = useState("");
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setHourlyRate(profile.hourly_rate ?? "");
      setExperienceLevel(profile.experience_level || "mid");
      setLocation(profile.location || "");
      setSkillsText((profile.skills || []).join(", "));
      setCategory(profile.category || "");
      setGender(profile.gender || "");
      setAvailabilityStatus(profile.availability_status || "Available");
    }
  }, [profile]);

  // Load portfolio items
  const { data: portfolioItems } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get(`/portfolio/${user.id}`);
      return res.data.data;
    },
    enabled: !!user && user?.role === "freelancer",
  });

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.put("/profiles/me", {
        full_name: fullName.trim(),
        title: title.trim(),
        bio: bio.trim(),
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        experience_level: experienceLevel,
        location: location.trim(),
        skills: skillsArray,
        category: category.trim(),
        gender: gender || null,
        availability_status: availabilityStatus,
      });

      if (res.data.success) {
        setMessage("Profile updated successfully!");
        updateUser(res.data.data);
        queryClient.invalidateQueries(["current-profile"]);
        queryClient.invalidateQueries(["profile", user?.id]);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPortfolio(e) {
    e.preventDefault();
    if (!portfolioTitle.trim()) return;

    setAddingPortfolio(true);
    try {
      const tags = portfolioTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.post("/portfolio", {
        title: portfolioTitle.trim(),
        description: portfolioDesc.trim(),
        project_url: portfolioUrl.trim() || null,
        tags,
      });

      setPortfolioTitle("");
      setPortfolioDesc("");
      setPortfolioUrl("");
      setPortfolioTags("");
      queryClient.invalidateQueries(["portfolio", user?.id]);
    } catch (err) {
      alert("Failed to add portfolio item.");
    } finally {
      setAddingPortfolio(false);
    }
  }

  async function handleDeletePortfolio(id) {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;
    try {
      await api.delete(`/portfolio/${id}`);
      queryClient.invalidateQueries(["portfolio", user?.id]);
    } catch (err) {
      alert("Failed to delete portfolio item.");
    }
  }

  if (isLoading) {
    return <p className="text-xs text-slate-400 py-10">Loading profile data...</p>;
  }

  const isFreelancer = profile?.role === "freelancer";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Edit Profile & Settings</h1>
          <p className="text-xs text-slate-400">
            Keep your profile up-to-date so clients and collaborators can reach you.
          </p>
        </div>
        <button
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300"
        >
          View Public Profile →
        </button>
      </div>

      {/* MAIN PROFILE FORM */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 space-y-5 text-xs shadow-xl backdrop-blur"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Professional Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Full-Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Bio / Summary</label>
          <textarea
            rows={4}
            placeholder="Share your expertise, achievements, and what sets you apart..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500 leading-relaxed"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {isFreelancer && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">Hourly Rate ($/hr)</label>
              <input
                type="number"
                placeholder="85"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
              />
            </div>
          )}

          {isFreelancer && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
              >
                <option value="junior">Junior (1-2 yrs)</option>
                <option value="mid">Mid-level (3-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, Node.js, PostgreSQL, Tailwind CSS"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Category / Domain</label>
            <input
              type="text"
              placeholder="e.g. Web Development, UI/UX"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {isFreelancer && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Availability Status</label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none focus:border-brand-500"
            >
              <option value="Available Full-Time">Available Full-Time</option>
              <option value="Available Part-Time (20 hrs/week)">
                Available Part-Time (20 hrs/week)
              </option>
              <option value="Limited Availability">Limited Availability</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 transition disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>

          {message && (
            <p className="text-xs font-semibold text-emerald-400">{message}</p>
          )}
        </div>
      </form>

      {/* PORTFOLIO MANAGEMENT SECTION (FREELANCER ONLY) */}
      {isFreelancer && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 space-y-6 shadow-xl backdrop-blur">
          <div>
            <h2 className="text-base font-bold text-slate-100">Portfolio Items</h2>
            <p className="text-xs text-slate-400">
              Add case studies, live demo links, and projects you’ve built.
            </p>
          </div>

          <form onSubmit={handleAddPortfolio} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-200">+ Add New Project to Portfolio</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Project Title (e.g. E-Commerce Dashboard)"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-slate-100 outline-none focus:border-brand-500"
              />
              <input
                type="url"
                placeholder="Live URL / Demo Link (https://...)"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-slate-100 outline-none focus:border-brand-500"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Brief description of the work and impact..."
              value={portfolioDesc}
              onChange={(e) => setPortfolioDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-slate-100 outline-none focus:border-brand-500"
            />

            <input
              type="text"
              placeholder="Tags (comma-separated, e.g. React, Node.js, Tailwind)"
              value={portfolioTags}
              onChange={(e) => setPortfolioTags(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-slate-100 outline-none focus:border-brand-500"
            />

            <button
              disabled={addingPortfolio}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 font-semibold text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              {addingPortfolio ? "Adding..." : "Add to Portfolio"}
            </button>
          </form>

          {/* Current Portfolio Items List */}
          <div className="space-y-3">
            {portfolioItems?.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">{item.description}</p>
                  {item.project_url && (
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-brand-400 hover:underline"
                    >
                      {item.project_url}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDeletePortfolio(item.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
