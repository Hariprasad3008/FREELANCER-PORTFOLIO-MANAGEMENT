import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useConversations } from '../../hooks/useMessages.js';
import { RoleBadge } from '../common/Badge.jsx';
import {
  Sparkles,
  Users,
  Briefcase,
  Building2,
  Bookmark,
  MessageSquare,
  PlusCircle,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  FolderGit2
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isClient } = useAuth();
  const { data: convData } = useConversations();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate total unread messages
  const totalUnread = convData?.conversations?.reduce(
    (acc, curr) => acc + (curr.unread_count || 0),
    0
  ) || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-600 bg-clip-text text-transparent">
                TalentVerse
              </span>
              <span className="hidden sm:inline-block ml-1 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase">
                Pro
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/talent"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/talent')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={16} /> Find Talent
            </Link>

            <Link
              to="/projects"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/projects')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase size={16} /> Find Gigs
            </Link>

            <Link
              to="/clients"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/clients')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 size={16} /> Clients
            </Link>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Post a Job button (Client only) */}
                {isClient && (
                  <Link
                    to="/post-project"
                    className="btn-primary text-xs py-2 px-3.5 shadow-sm"
                  >
                    <PlusCircle size={15} /> Post a Job
                  </Link>
                )}

                {/* Bookmarks */}
                <Link
                  to="/saved"
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isActive('/saved')
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Saved Items"
                >
                  <Bookmark size={18} />
                </Link>

                {/* Messages with Unread Badge */}
                <Link
                  to="/messages"
                  className={`relative p-2.5 rounded-xl border transition-colors ${
                    isActive('/messages')
                      ? 'bg-brand-50 text-brand-600 border-brand-200'
                      : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Real-Time Messages"
                >
                  <MessageSquare size={18} />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all"
                  >
                    <img
                      src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff`}
                      alt={user?.full_name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="text-left hidden lg:block mr-1">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{user?.full_name}</p>
                      <RoleBadge role={user?.role} />
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl z-50 animate-slide-up">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={`/profile/${user?.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <User size={15} className="text-brand-500" /> View Public Profile
                      </Link>

                      <Link
                        to="/edit-profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        {isClient ? (
                          <>
                            <Building2 size={15} className="text-indigo-600" /> Edit Company Profile
                          </>
                        ) : (
                          <>
                            <Settings size={15} className="text-purple-600" /> Edit Freelancer Profile
                          </>
                        )}
                      </Link>

                      {isClient && (
                        <>
                          <Link
                            to="/projects?filter=mine"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <FolderGit2 size={15} className="text-indigo-600" /> My Jobs & Proposals
                          </Link>
                          <Link
                            to="/post-project"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <PlusCircle size={15} className="text-brand-500" /> Post a Project
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth?mode=login" className="btn-secondary text-xs py-2">
                  Log In
                </Link>
                <Link to="/auth?mode=register" className="btn-primary text-xs py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <Link
                to="/messages"
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <MessageSquare size={20} />
                {totalUnread > 0 && (
                  <span className="absolute 0 top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-slide-up">
          <Link
            to="/talent"
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find Talent
          </Link>
          <Link
            to="/projects"
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find Gigs
          </Link>
          <Link
            to="/clients"
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Clients Directory
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to={`/profile/${user?.id}`}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                My Profile
              </Link>
              <Link
                to="/saved"
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Saved Items
              </Link>
              <Link
                to="/messages"
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Messages
              </Link>
              {isClient && (
                <Link
                  to="/post-project"
                  className="block px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-xl"
                >
                  + Post a New Job
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/auth?mode=login" className="btn-secondary text-center text-sm py-2">
                Log In
              </Link>
              <Link to="/auth?mode=register" className="btn-primary text-center text-sm py-2">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
