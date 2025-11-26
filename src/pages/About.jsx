// src/pages/About.jsx
export default function About() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-semibold">About FreelanceHub</h1>
      <p className="text-sm text-slate-300">
        FreelanceHub is a focused marketplace that connects skilled freelancers
        with serious clients. Our goal is to make it easy to showcase your work,
        find projects that match your skills, and communicate in real-time.
      </p>
      <p className="text-sm text-slate-300">
        Under the hood, we use React, Vite, Tailwind CSS, Supabase, and React
        Query. This gives you realtime messaging, smooth navigation, and a clean
        modern design.
      </p>
      <p className="text-sm text-slate-300">
        Features include rich profiles, project management, direct messaging,
        and powerful discovery with filters and search.
      </p>
    </div>
  );
}
