// src/components/NavBar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

export default function NavBar() {
  const { user, signOut } = useAuth();
  const { data: profile } = useCurrentProfile();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null); // for outside-click detection

  const role = profile?.role;

  const navLinkClass = ({ isActive }) =>
    `text-sm hover:text-brand-400 transition ${
      isActive ? "text-brand-400" : "text-slate-300"
    }`;

  async function handleLogout() {
    await signOut();
    navigate("/auth");
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  // ROLE-BASED NAV ITEMS
  let navItems = [];

  if (!user) {
    navItems = [
      { to: "/projects", label: "Browse Projects" },
      { to: "/clients", label: "Browse Clients" },
      { to: "/talent", label: "Browse Talent" },
      { to: "/about", label: "About" },
    ];
  } else if (role === "client") {
    navItems = [
      { to: "/talent", label: "Browse Talent" },
      { to: "/projects/new", label: "Post Project" },
      { to: "/about", label: "About" },
    ];
  } else if (role === "freelancer") {
    navItems = [
      { to: "/projects", label: "Browse Projects" },
      { to: "/clients", label: "Browse Clients" },
      { to: "/about", label: "About" },
    ];
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-brand-600 flex items-center justify-center font-bold text-white">
            F
          </div>
          <div className="text-lg font-semibold tracking-tight text-slate-50">
            FreelanceHub
          </div>
        </Link>

        {/* CENTER NAV */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.to} className={navLinkClass} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* RIGHT: USER MENU */}
        <div className="relative" ref={menuRef}>
          {!user ? (
            <Link
              to="/auth"
              className="px-3 py-1.5 text-sm rounded-xl bg-brand-600 hover:bg-brand-700 transition"
            >
              Login / Signup
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {/* NAME BADGE BUTTON (always visible) */}
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="rounded-xl px-3 py-1.5 bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 hover:border-brand-500 transition"
              >
                {profile?.full_name || user.email}
              </button>

              {/* DROPDOWN (positioned BELOW button, not on top) */}
              {openMenu && (
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-52 rounded-xl border border-slate-700 
                    bg-slate-900 shadow-xl shadow-black/50 
                    p-2 text-sm z-50
                  "
                >
                  <p className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">
                    {user.email}
                  </p>

                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setOpenMenu(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/profile/edit"
                    onClick={() => setOpenMenu(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    Edit Profile
                  </Link>

                  <Link
                    to="/saved"
                    onClick={() => setOpenMenu(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    Saved
                  </Link>

                  <Link
                    to="/messages"
                    onClick={() => setOpenMenu(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    Messages
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40 text-red-400 mt-1 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
