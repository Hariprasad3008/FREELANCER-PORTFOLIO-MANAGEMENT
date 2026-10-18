import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Database, Shield, Zap, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <span className="font-extrabold text-lg text-slate-900">TalentVerse</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              The premier marketplace connecting verified world-class freelancers and modern businesses.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database size={13} className="text-brand-500" />
              <span>Powered by Supabase PostgreSQL</span>
            </div>
          </div>

          {/* Col 2: For Clients */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              For Clients
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/talent" className="hover:text-brand-600 transition-colors">
                  Browse Freelance Talent
                </Link>
              </li>
              <li>
                <Link to="/post-project" className="hover:text-brand-600 transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/clients" className="hover:text-brand-600 transition-colors">
                  Explore Enterprise Hiring
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Freelancers */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              For Freelancers
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/projects" className="hover:text-brand-600 transition-colors">
                  Find Projects & Gigs
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=register" className="hover:text-brand-600 transition-colors">
                  Create Freelancer Profile
                </Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-brand-600 transition-colors">
                  Real-Time Client Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Tech Stack Highlights */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Platform Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                React 19
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                Supabase
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                Socket.IO
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                Express / Node
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                JWT RBAC
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TalentVerse. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for freelancers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
