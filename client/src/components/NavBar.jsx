import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

export default function NavBar() {
  const { user, signOut } = useAuth();
  const { data: profile } = useCurrentProfile();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const role = profile?.role || user?.role;

  const navLinkClass = ({ isActive }) =>
    `text-xs font-medium hover:text-brand-400 transition ${
      isActive ? "text-brand-400 font-semibold" : "text-slate-300"
    }`;

  function handleLogout() {
    signOut();
    navigate("/auth");
  }

  // Close menu on outside click
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

  // Role-based navigation items
  let navItems = [];
  if (!user) {
    navItems = [
      { to: "/projects", label: "Browse Projects" },
      { to: "/talent", label: "Browse Talent" },
      { to: "/clients", label: "Browse Clients" },
      { to: "/about", label: "About" },
    ];
  } else if (role === "client") {
    navItems = [
      { to: "/talent", label: "Browse Talent" },
      { to: "/projects/new", label: "Post a Project" },
      { to: "/projects", label: "All Projects" },
      { to: "/messages", label: "Messages" },
      { to: "/about", label: "About" },
    ];
  } else if (role === "freelancer") {
    navItems = [
      { to: "/projects", label: "Browse Projects" },
      { to: "/clients", label: "Browse Clients" },
      { to: "/talent", label: "Browse Freelancers" },
      { to: "/messages", label: "Messages" },
      { to: "/about", label: "About" },
    ];
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/20">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-50">
              FreelanceHub
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              Marketplace
            </span>
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
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
              >
                Sign In / Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-brand-500 transition shadow-sm"
              >
                <div className="h-6 w-6 rounded-lg bg-brand-600/30 text-brand-300 flex items-center justify-center text-[10px] font-bold">
                  {(profile?.full_name || user.full_name || "U")[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">
                  {profile?.full_name || user.full_name || user.email}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-brand-300 border border-slate-700">
                  {role}
                </span>
              </button>

              {/* DROPDOWN MENU */}
              {openMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/80 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 space-y-0.5">
                    <p className="font-semibold text-slate-100 truncate">
                      {profile?.full_name || user.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/profile/edit"
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    >
                      Edit Profile & Portfolio
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    >
                      Saved Items
                    </Link>

                    <Link
                      to="/messages"
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    >
                      Messages
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 font-medium transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
