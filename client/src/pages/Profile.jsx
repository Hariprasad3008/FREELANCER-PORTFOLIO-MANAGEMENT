import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useUserProjects } from "../hooks/useUserProjects";
import { useFreelancerReviews } from "../hooks/useFreelancerReviews";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-xl font-bold text-slate-50 mt-1">{value}</p>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  const queryClient = useQueryClient();

  // Load profile being viewed
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await api.get(`/profiles/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Load portfolio items if freelancer
  const { data: portfolioItems } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: async () => {
      const res = await api.get(`/portfolio/${id}`);
      return res.data.data;
    },
    enabled: !!id && profile?.role === "freelancer",
  });

  const isOwnProfile = user?.id === profile?.id;
  const isFreelancer = profile?.role === "freelancer";
  const isClientProfile = profile?.role === "client";

  // Client's projects
  const { data: userProjects, isLoading: loadingProjects } = useUserProjects(
    isClientProfile ? profile?.id : null
  );

  // Freelancer's reviews
  const { data: reviews, isLoading: loadingReviews } = useFreelancerReviews(
    isFreelancer ? profile?.id : null
  );

  const hasReviewed = useMemo(() => {
    if (!currentProfile || !reviews) return false;
    return reviews.some((r) => r.client?.id === currentProfile.id);
  }, [currentProfile, reviews]);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // Save profile state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSaveProfile() {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (currentProfile?.role !== "client") {
      alert("Only clients can bookmark freelancers.");
      return;
    }

    setSavingProfile(true);
    try {
      await api.post(`/saved/profiles/${profile.id}`);
      setSavedSuccess(true);
      queryClient.invalidateQueries(["savedProfiles"]);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!user || currentProfile?.role !== "client") {
      setReviewNote("Only authenticated clients can leave reviews.");
      return;
    }

    if (hasReviewed) {
      setReviewNote("You have already reviewed this freelancer.");
      return;
    }

    setSavingReview(true);
    setReviewNote("");

    try {
      await api.post("/reviews", {
        freelancer_id: profile.id,
        rating: Number(rating),
        comment: comment.trim() || null,
      });

      setReviewNote("Review submitted successfully!");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries(["profile", profile.id]);
      queryClient.invalidateQueries(["freelancers"]);
      queryClient.invalidateQueries(["freelancer-reviews", profile.id]);
    } catch (err) {
      setReviewNote(err.response?.data?.message || err.message || "Failed to submit review.");
    } finally {
      setSavingReview(false);
    }
  }

  async function handleMessage() {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (user.id === profile.id) {
      alert("You cannot start a conversation with yourself.");
      return;
    }

    try {
      const res = await api.post("/messages/conversations", {
        targetUserId: profile.id,
      });
      if (res.data.success) {
        navigate(`/messages?c=${res.data.conversationId}`);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert(err.response?.data?.message || "Could not start conversation.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-xs text-slate-400">Loading profile details...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-xs text-red-400 text-center">
        Profile not found or error loading: {error?.message}
      </div>
    );
  }

  const totalProjects = userProjects?.length ?? 0;
  const openProjects = userProjects?.filter((p) => p.status === "open").length ?? 0;
  const memberSince = profile.created_at ? new Date(profile.created_at).getFullYear() : "2026";

  const freelancerStats = [
    { label: "Projects Completed", value: profile.projects_completed ?? 0 },
    { label: "Job Success Rate", value: `${profile.success_rate ?? 100}%` },
    { label: "Average Rating", value: profile.rating ? `${profile.rating} ★` : "New" },
    { label: "Availability", value: profile.availability_status || "Available" },
  ];

  const clientStats = [
    { label: "Open Projects", value: openProjects },
    { label: "Total Projects Posted", value: totalProjects },
    { label: "Hiring Category", value: profile.category || "General" },
    { label: "Member Since", value: memberSince },
  ];

  const statsToRender = isFreelancer ? freelancerStats : clientStats;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl backdrop-blur">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-600/30 shrink-0">
            {profile.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-100">{profile.full_name}</h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30">
                {profile.role}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {profile.title || "Marketplace Member"} • {profile.location || "Remote"}
              {profile.category ? ` • ${profile.category}` : ""}
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs">
              {isFreelancer ? (
                <>
                  <span className="font-semibold text-emerald-400">
                    {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : "Rate negotiable"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 capitalize">
                    {profile.experience_level || "Experience not set"}
                  </span>
                </>
              ) : (
                <span className="text-slate-300">{openProjects} open projects</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 text-xs">
          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:border-brand-500 hover:text-white transition shadow-sm"
            >
              Edit Profile
            </Link>
          )}

          {!isOwnProfile && currentProfile?.role === "client" && isFreelancer && (
            <button
              onClick={handleSaveProfile}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 font-medium text-slate-300 hover:border-brand-500 hover:text-brand-300 transition shadow-sm"
            >
              {savedSuccess ? "✓ Bookmarked" : savingProfile ? "Saving..." : "Save Talent"}
            </button>
          )}

          {!isOwnProfile && (
            <button
              onClick={handleMessage}
              className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 transition"
            >
              Direct Message
            </button>
          )}
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsToRender.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      {/* ABOUT & SKILLS */}
      <section className="grid gap-6 md:grid-cols-[1.4fr,1.6fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2.5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100">About</h2>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio || "No biography provided yet."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100">
              {isFreelancer ? "Core Skills & Tech Stack" : "Hiring Focus & Industry"}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {(profile.skills || []).length === 0 && (
                <p className="text-xs text-slate-400">No specific skills listed.</p>
              )}
              {(profile.skills || []).map((s) => (
                <span
                  key={s}
                  className="rounded-xl bg-slate-800 px-3 py-1 text-slate-200 border border-slate-700 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PORTFOLIO (FOR FREELANCERS) */}
        {isFreelancer && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100">Featured Portfolio Items</h2>
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  + Add Project
                </Link>
              )}
            </div>

            {portfolioItems?.length === 0 && (
              <p className="text-xs text-slate-400 py-4">No portfolio items added yet.</p>
            )}

            <div className="space-y-3">
              {portfolioItems?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    {item.project_url && (
                      <a
                        href={item.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-brand-400 hover:underline"
                      >
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CLIENT'S POSTED PROJECTS */}
      {isClientProfile && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-slate-100">Projects Posted by this Client</h2>
          {loadingProjects && <p className="text-xs text-slate-400">Loading projects...</p>}
          {userProjects?.length === 0 && (
            <p className="text-xs text-slate-400">No projects currently posted.</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {userProjects?.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400">
                    {p.budget_min || p.budget_max ? `$${p.budget_min} - $${p.budget_max}` : "Negotiable"}
                  </span>
                  {isOwnProfile && (
                    <Link
                      to={`/projects/${p.id}/edit`}
                      className="text-brand-400 hover:underline text-[11px]"
                    >
                      Edit Project
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FREELANCER CLIENT REVIEWS & REVIEW FORM */}
      {isFreelancer && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">Client Reviews & Testimonials</h2>
            <span className="text-xs text-amber-300 font-semibold">
              {profile.rating ? `${profile.rating} ★ Average Rating` : "No ratings yet"}
            </span>
          </div>

          {loadingReviews && <p className="text-xs text-slate-400">Loading reviews...</p>}

          {reviews?.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
              No client reviews posted yet.
            </div>
          )}

          <div className="space-y-3">
            {reviews?.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {(r.client?.full_name || "C")[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{r.client?.full_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-amber-300 font-bold text-sm">{r.rating} ★</span>
                </div>
                {r.comment && <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>}
              </article>
            ))}
          </div>

          {/* LEAVE REVIEW FORM (Client to Freelancer) */}
          {!isOwnProfile && currentProfile?.role === "client" && !hasReviewed && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-100">
                Leave a Verified Review for {profile.full_name}
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-40 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand-500"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars {r === 5 ? "(Exceptional)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Feedback & Commentary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the freelancer's communication, code quality, and delivery..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  disabled={savingReview}
                  className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-600/20 transition disabled:opacity-50"
                >
                  {savingReview ? "Submitting..." : "Submit Client Review"}
                </button>
              </form>

              {reviewNote && (
                <p className="text-xs font-medium text-emerald-400">{reviewNote}</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
