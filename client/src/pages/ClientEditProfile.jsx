import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProfileMutations } from '../hooks/useProfile.js';
import {
  Building2,
  Globe,
  MapPin,
  Image,
  User,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Briefcase,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye
} from 'lucide-react';

export const ClientEditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfileMutations();

  // Company Information
  const [companyName, setCompanyName] = useState(user?.company_name || user?.title || '');
  const [companyLocation, setCompanyLocation] = useState(user?.location || 'San Francisco, CA, USA');
  const [website, setWebsite] = useState(user?.website || 'https://');
  const [companyDescription, setCompanyDescription] = useState(
    user?.bio || user?.company_description || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Representative / Contact Information
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [age, setAge] = useState(user?.age || '');

  // Extra Company Branding & Culture
  const [industry, setIndustry] = useState('Technology & Software');
  const [companySize, setCompanySize] = useState('11-50 employees');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(true);

  const presetLogos = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!companyName.trim()) {
      setErrorMsg('Company Name is required.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Representative Full Name is required.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: fullName.trim(),
        full_name: fullName.trim(),
        company_name: companyName.trim(),
        title: companyName.trim(),
        bio: companyDescription.trim(),
        company_description: companyDescription.trim(),
        company_location: companyLocation.trim(),
        location: companyLocation.trim(),
        website: website.trim(),
        avatar_url: avatarUrl.trim(),
        gender: gender || null,
        age: age || null,
      });

      setSuccessMsg('Company profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${user?.id || ''}`);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company profile.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Edit Client & Company Profile
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Client Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure your organization identity, hiring mission, and representative contact information.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors self-start sm:self-auto"
        >
          <Eye size={15} />
          {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Column */}
        <div className={showLivePreview ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            {successMsg && (
              <div className="p-4 mb-6 text-sm bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-2 animate-fadeIn">
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-6 text-sm bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 animate-fadeIn">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Company Brand & Logo */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-600" />
                  1. Company Branding & Identity
                </h3>

                {/* Logo Preview & Input */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-5">
                  <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=4f46e5&color=fff`}
                    alt="Company Logo Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Company Logo URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        className="input-field pl-9 text-xs"
                        placeholder="https://images.unsplash.com/... or https://yourdomain.com/logo.png"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <Image size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                    {/* Quick Preset Pickers */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Sample Logos:</span>
                      {presetLogos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className="w-6 h-6 rounded-lg overflow-hidden border border-slate-300 hover:border-indigo-500 transition-all hover:scale-110"
                        >
                          <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Acme Innovations, Apex Ventures"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Website URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        className="input-field pl-9"
                        placeholder="https://acme.io"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                      <Globe size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Headquarters / Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field pl-9"
                        placeholder="e.g. San Francisco, CA / Remote"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                      />
                      <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Industry Domain
                    </label>
                    <select
                      className="input-field text-xs"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="Technology & Software">Technology & Software</option>
                      <option value="Fintech & Banking">Fintech & Banking</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Healthcare & Bio">Healthcare & Bio</option>
                      <option value="Design & Creative Agency">Design & Creative Agency</option>
                      <option value="Media & Entertainment">Media & Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Company Size
                    </label>
                    <select
                      className="input-field text-xs"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    >
                      <option value="1-10 employees (Startup)">1-10 employees (Startup)</option>
                      <option value="11-50 employees (Growth)">11-50 employees (Growth)</option>
                      <option value="51-200 employees (Scaleup)">51-200 employees (Scaleup)</option>
                      <option value="200+ employees (Enterprise)">200+ employees (Enterprise)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Company Overview & Hiring Vision */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-indigo-600" />
                  2. About Company & Hiring Vision
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Description & Why Freelancers Love Us *
                  </label>
                  <textarea
                    className="input-field min-h-[140px] resize-y leading-relaxed text-sm"
                    placeholder="Describe your organization's mission, standard tech stack, and what makes working with your team a great experience for freelancers (e.g. prompt milestone approvals, clear specifications, modern workflows)..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This description will appear on your public client profile and on all job listings you create.
                  </p>
                </div>
              </div>

              {/* 3. Primary Contact / Hiring Representative */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <User size={16} className="text-indigo-600" />
                  3. Primary Contact Representative
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Contact Full Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Marcus Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      className="input-field"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      className="input-field"
                      placeholder="e.g. 34"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary text-xs py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="btn-primary text-xs py-2.5 px-7 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Company Profile...
                    </>
                  ) : (
                    'Save Company Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview Column */}
        {showLivePreview && (
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" /> Live Company Directory Preview
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Public Card
              </span>
            </div>

            {/* Mock Client Card */}
            <div className="glass-card rounded-3xl p-6 border border-indigo-100 shadow-xl relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/20 to-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

              <div className="flex items-start gap-4 mb-4">
                <img
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=4f46e5&color=fff`}
                  alt={companyName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 truncate">
                      {companyName || 'Your Company Name'}
                    </h4>
                    <ShieldCheck size={16} className="text-indigo-600 shrink-0" title="Verified Client" />
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {industry} &bull; {companySize}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{companyLocation || 'San Francisco, CA'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 mb-5 leading-relaxed bg-white/70 p-3 rounded-2xl border border-slate-100">
                {companyDescription || 'Your company description and hiring vision will appear here for freelancers to read.'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center mb-4">
                <div className="p-2 rounded-xl bg-slate-50/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Representative</span>
                  <span className="text-xs font-extrabold text-slate-800 truncate block">
                    {fullName || 'Marcus Vance'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Status</span>
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                </div>
              </div>

              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                >
                  <Globe size={13} /> Visit Official Website <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Client Portal Tip Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 size={16} className="text-indigo-400" />
                <h5 className="text-xs font-extrabold text-white">Client Hiring Pro Tip</h5>
              </div>
              <p className="text-[11px] text-indigo-200 leading-relaxed">
                Clear company details and verified official websites attract 4.2x more top-tier Senior & Expert freelancer bids on your posted projects.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
