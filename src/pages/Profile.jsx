// src/pages/Profile.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useUserProjects } from "../hooks/useUserProjects";
import { useFreelancerReviews } from "../hooks/useFreelancerReviews";
import { ensureConversation } from "../lib/conversationHelpers";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-lg font-semibold text-slate-50">{value}</p>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams(); // profile being viewed
  const navigate = useNavigate();
  const { user } = useAuth(); // auth user
  const { data: currentProfile } = useCurrentProfile(); // logged-in profile row
  const queryClient = useQueryClient();

  // ---------- Load profile being viewed ----------
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isOwnProfile = user?.id === profile?.id;
  const isFreelancer = profile?.role === "freelancer";
  const isClientProfile = profile?.role === "client";

  // ---------- Projects for client profiles ----------
  const {
    data: userProjects,
    isLoading: loadingProjects,
  } = useUserProjects(profile?.id);

  // ---------- Reviews for freelancer profiles ----------
  const {
    data: reviews,
    isLoading: loadingReviews,
  } = useFreelancerReviews(profile?.id);

  const hasReviewed = useMemo(() => {
    if (!currentProfile || !reviews) return false;
    return reviews.some((r) => r.client?.id === currentProfile.id);
  }, [currentProfile, reviews]);

  // ---------- Review form state ----------
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // ---------- Save freelancer (client → freelancer) ----------
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleSaveProfile() {
    if (!currentProfile) {
      alert("Please log in as a client to save freelancers.");
      return;
    }
    if (currentProfile.role !== "client") {
      alert("Only clients can save freelancers.");
      return;
    }

    setSavingProfile(true);

    try {
      const { error } = await supabase.from("saved_profiles").insert({
        client_id: currentProfile.id,
        freelancer_id: profile.id,
      });

      // Ignore duplicate unique constraint error
      if (error && error.code !== "23505") {
        console.error(error);
      } else {
        queryClient.invalidateQueries(["savedProfiles"]);
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function updateFreelancerRatingAverage(freelancerId) {
    const { data: ratingRows, error: ratingsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("freelancer_id", freelancerId);

    if (ratingsError) {
      console.error("Failed to load ratings for average:", ratingsError);
      return;
    }

    const avgRating =
      ratingRows.length > 0
        ? Number(
            (
              ratingRows.reduce((sum, r) => sum + (r.rating || 0), 0) /
              ratingRows.length
            ).toFixed(1)
          )
        : null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ rating: avgRating })
      .eq("id", freelancerId);

    if (updateError) {
      console.error("Failed to update profile rating:", updateError);
    }
  }

  // ---------- Submit review (client reviews freelancer ONCE) ----------
  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!currentProfile || currentProfile.role !== "client") {
      setReviewNote("Only clients can leave reviews.");
      return;
    }

    if (hasReviewed) {
      setReviewNote("You have already reviewed this freelancer.");
      return;
    }

    setSavingReview(true);
    setReviewNote("");

    try {
      const { error } = await supabase.from("reviews").insert({
        client_id: currentProfile.id,
        freelancer_id: profile.id,
        project_id: null,
        rating: Number(rating),
        comment: comment.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          setReviewNote("You have already reviewed this freelancer.");
        } else {
          throw error;
        }
      } else {
        setReviewNote("Review submitted!");
        setComment("");
        setRating(5);
        if (profile?.id) {
          await updateFreelancerRatingAverage(profile.id);
          queryClient.invalidateQueries(["profile", profile.id]);
        }
        queryClient.invalidateQueries(["freelancers"]);
        queryClient.invalidateQueries(["featured-freelancers"]);
        queryClient.invalidateQueries(["freelancer-reviews", profile.id]);
      }
    } catch (err) {
      setReviewNote(err.message || "Something went wrong.");
    } finally {
      setSavingReview(false);
    }
  }

  // ---------- Start conversation (single conversation per user pair) ----------
  async function handleMessage() {
    if (!user || !profile) {
      navigate("/auth");
      return;
    }

    try {
      const conversationId = await ensureConversation(user.id, profile.id, {
        full_name: profile.full_name,
      });
      navigate(`/messages?c=${conversationId}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert(err.message || "Could not start conversation. Please try again.");
    }
  }

  // ---------- Loading / error states ----------
  if (isLoading) {
    return <p className="text-xs text-slate-400">Loading profile...</p>;
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Error loading profile: {error.message}
      </p>
    );
  }

  if (!profile) {
    return <p className="text-xs text-slate-400">Profile not found.</p>;
  }

  const totalProjects = userProjects?.length ?? 0;
  const openProjects =
    userProjects?.filter((p) => p.status === "open").length ?? 0;
  const closedProjects = Math.max(totalProjects - openProjects, 0);
  const memberSince = profile.created_at
    ? new Date(profile.created_at)
    : null;

  const freelancerStats = [
    {
      label: "Projects Completed",
      value: profile.projects_completed ?? 0,
    },
    {
      label: "Job Success",
      value: profile.success_rate ? `${profile.success_rate}%` : "Not set",
    },
    {
      label: "Rating",
      value: profile.rating ? `${profile.rating} ★` : "No rating",
    },
    {
      label: "Availability",
      value: profile.availability_status || "Not set",
    },
  ];

  const clientStats = [
    { label: "Open Projects", value: openProjects },
    { label: "Projects Posted", value: totalProjects },
    { label: "Closed Projects", value: closedProjects },
    {
      label: "Member Since",
      value: memberSince ? memberSince.getFullYear() : "Unknown",
    },
  ];

  const statsToRender = isFreelancer ? freelancerStats : clientStats;

  const genderLabel = (() => {
    if (!profile.gender) return null;
    const map = {
      male: "Male",
      female: "Female",
      "non-binary": "Non-binary",
      other: "Other",
    };
    return map[profile.gender] || profile.gender;
  })();

  // ---------- MAIN RENDER ----------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl border border-slate-700 bg-slate-800 flex items-center justify-center text-lg font-semibold">
            {profile.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              {profile.full_name || "Unnamed"}
            </h1>
            <p className="text-xs text-slate-400">
              {profile.title || "No title"} •{" "}
              {profile.location || "Location not set"}
              {profile.category ? ` • ${profile.category}` : ""}
              {genderLabel ? ` • ${genderLabel}` : ""}
            </p>
            <p className="mt-1 text-xs text-emerald-300">
              {isFreelancer ? (
                <>
                  {profile.experience_level || "Experience not set"} •{" "}
                  {profile.availability_status || "Availability unknown"} •{" "}
                  {profile.hourly_rate
                    ? `$${profile.hourly_rate}/hr`
                    : "Rate not set"}
                </>
              ) : (
                <>
                  {openProjects} open projects • {totalProjects} total •{" "}
                  {memberSince
                    ? `Member since ${memberSince.getFullYear()}`
                    : "New to the platform"}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="rounded-xl border border-slate-700 px-3 py-1.5 hover:border-brand-500 hover:text-brand-100 transition"
            >
              Edit Profile
            </Link>
          )}

          {!isOwnProfile &&
            currentProfile?.role === "client" &&
            isFreelancer && (
              <button
                onClick={handleSaveProfile}
                className="rounded-xl border border-slate-700 px-3 py-1.5 hover:border-brand-500 hover:text-brand-100 transition"
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            )}

          {!isOwnProfile && (
            <button
              onClick={handleMessage}
              className="rounded-xl bg-brand-600 px-3 py-1.5 font-medium hover:bg-brand-700 transition"
            >
              Message
            </button>
          )}
        </div>
      </header>

      {/* ABOUT + SKILLS + STATS */}
      <section className="grid gap-6 md:grid-cols-[1.4fr,1.6fr]">
        <div className="space-y-4">
          {/* About */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs space-y-2">
            <h2 className="text-sm font-semibold">About</h2>
            <p className="text-slate-300">
              {profile.bio || "No bio provided yet."}
            </p>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs space-y-2">
            <h2 className="text-sm font-semibold">
              {isFreelancer ? "Skills" : "Hiring focus"}
            </h2>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {(profile.skills || []).length === 0 && (
                <p className="text-[11px] text-slate-400">
                  {isFreelancer
                    ? "No skills listed yet."
                    : "No hiring focus listed yet."}
                </p>
              )}
              {(profile.skills || []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-800 px-2 py-0.5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 text-xs">
          <div className="grid gap-4 md:grid-cols-2">
            {statsToRender.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT PROJECTS */}
      {isClientProfile && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Projects by this client</h2>
          {loadingProjects && (
            <p className="text-xs text-slate-400">Loading projects...</p>
          )}
          {!loadingProjects && userProjects && userProjects.length === 0 && (
            <p className="text-xs text-slate-400">
              This client hasn’t posted any projects yet.
            </p>
          )}
          <div className="space-y-3">
            {userProjects?.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {p.status}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    {p.budget_min || p.budget_max ? (
                      <p>
                        {p.budget_min || ""}{" "}
                        {p.budget_min && p.budget_max ? " - " : ""}
                        {p.budget_max || ""}{" "}
                        {p.budget_type && `(${p.budget_type})`}
                      </p>
                    ) : (
                      <p>Budget not set</p>
                    )}
                    {p.deadline && <p>Deadline: {p.deadline}</p>}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {p.description}
                </p>
                <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                  {(p.required_skills || []).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-800 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2 pt-2">
                    <Link
                      to={`/projects/${p.id}/edit`}
                      className="text-[11px] text-brand-300 hover:text-brand-100"
                    >
                      Edit project
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FREELANCER REVIEWS */}
      {isFreelancer && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Client Reviews</h2>

          {loadingReviews && (
            <p className="text-xs text-slate-400">Loading reviews...</p>
          )}

          {!loadingReviews && reviews && reviews.length === 0 && (
            <p className="text-xs text-slate-400">
              No reviews yet. Clients can leave a review after working with this
              freelancer.
            </p>
          )}

          <div className="space-y-3">
            {reviews?.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">
                      {r.client?.full_name || "Client"}
                    </p>
                    {r.project && (
                      <p className="text-[11px] text-slate-400">
                        Project: {r.project.title}
                      </p>
                    )}
                  </div>
                  <p className="text-amber-300 text-sm font-semibold">
                    {r.rating} ★
                  </p>
                </div>
                {r.comment && (
                  <p className="text-[11px] text-slate-300 mt-1">
                    {r.comment}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </article>
            ))}
          </div>

          {/* REVIEW FORM: shown only if client & hasn’t reviewed yet */}
          {!isOwnProfile &&
            currentProfile?.role === "client" &&
            profile.role === "freelancer" &&
            !hasReviewed && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs space-y-3">
                <h3 className="text-sm font-semibold">
                  Leave a review for {profile.full_name || "this freelancer"}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">
                      Rating (1–5)
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">
                      Comment (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500"
                      placeholder="Share your experience working with this freelancer."
                    />
                  </div>
                  <button
                    disabled={savingReview}
                    className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
                  >
                    {savingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
                {reviewNote && (
                  <p className="text-[11px] text-amber-300">{reviewNote}</p>
                )}
              </div>
            )}

          {!isOwnProfile &&
            currentProfile?.role === "client" &&
            profile.role === "freelancer" &&
            hasReviewed && (
              <p className="text-[11px] text-slate-400">
                You have already reviewed this freelancer.
              </p>
            )}
        </section>
      )}
    </div>
  );
}
