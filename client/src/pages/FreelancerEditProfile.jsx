import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProfileMutations } from '../hooks/useProfile.js';
import {
  User,
  DollarSign,
  Clock,
  MapPin,
  Image,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Plus,
  X,
  Sparkles,
  Award,
  Star,
  Check,
  Zap,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const FreelancerEditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfileMutations();

  // Personal Information
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA, USA');
  const [gender, setGender] = useState(user?.gender || '');
  const [age, setAge] = useState(user?.age || '');

  // Rates & Experience
  const [hourlyRate, setHourlyRate] = useState(user?.hourly_rate || 75);
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'SENIOR');
  const [experienceYears, setExperienceYears] = useState(user?.experience_years || 5);
  const [availabilityStatus, setAvailabilityStatus] = useState(
    user?.availability_status ? user.availability_status.toUpperCase() : 'AVAILABLE'
  );
  const [responseTimeMinutes, setResponseTimeMinutes] = useState(user?.response_time_minutes || 30);

  // Skills
  const [skills, setSkills] = useState(user?.skills || ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS']);
  const [skillInput, setSkillInput] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(true);

  const trendingSkills = [
    'React',
    'Node.js',
    'TypeScript',
    'Next.js',
    'Python',
    'PostgreSQL',
    'Docker',
    'AWS',
    'GraphQL',
    'TailwindCSS',
    'Figma',
    'MongoDB',
    'Redis',
    'DevOps',
    'AI / LLMs'
  ];

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  ];

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || skillInput).trim();
    if (val && !skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setSkills([...skills, val]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Professional Title / Headline is required.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: fullName.trim(),
        full_name: fullName.trim(),
        title: title.trim(),
        bio: bio.trim(),
        hourly_rate: hourlyRate,
        experience_level: experienceLevel,
        experience_years: experienceYears,
        response_time_minutes: responseTimeMinutes,
        location: location.trim(),
        gender: gender || null,
        age: age || null,
        availability_status: availabilityStatus,
        avatar_url: avatarUrl.trim(),
        skills
      });

      setSuccessMsg('Freelancer profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${user?.id || ''}`);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update freelancer profile.');
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
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Edit Freelancer Profile
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Freelancer Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your professional headline, rates, skills cloud, and availability.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors self-start sm:self-auto"
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
              {/* 1. Profile Identity & Avatar */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <User size={16} className="text-purple-600" />
                  1. Profile Identity & Avatar
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-5">
                  <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Freelancer')}&background=8b5cf6&color=fff`}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Avatar URL (Unsplash or CDN)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        className="input-field pl-9 text-xs"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <Image size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>

                    {/* Quick Preset Pickers */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Sample Avatars:</span>
                      {presetAvatars.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className="w-6 h-6 rounded-full overflow-hidden border border-slate-300 hover:border-purple-500 transition-all hover:scale-110"
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Professional Headline / Title *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Senior Full-Stack Architect & React Specialist"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Professional Bio & Value Proposition *
                  </label>
                  <textarea
                    className="input-field min-h-[120px] resize-y leading-relaxed text-sm"
                    placeholder="Detail your background, technical specialty, past achievements, and why clients should hire you..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 2. Rates, Experience & Availability */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-purple-600" />
                  2. Rates, Seniority & Availability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hourly Rate ($/hr) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className="input-field pl-8"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        required
                      />
                      <DollarSign size={14} className="absolute left-2.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Experience Level
                    </label>
                    <select
                      className="input-field text-xs"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      <option value="JUNIOR">Junior (1-2 yrs)</option>
                      <option value="MID">Mid Level (3-5 yrs)</option>
                      <option value="SENIOR">Senior (5-8 yrs)</option>
                      <option value="EXPERT">Expert (8+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Years in Field
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="input-field"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Avg Response Time
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        step="5"
                        className="input-field pl-8"
                        value={responseTimeMinutes}
                        onChange={(e) => setResponseTimeMinutes(e.target.value)}
                      />
                      <Clock size={14} className="absolute left-2.5 top-3 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">In minutes</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Availability Status
                    </label>
                    <select
                      className="input-field text-xs font-bold text-slate-800"
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value)}
                    >
                      <option value="AVAILABLE">🟢 Available for Work</option>
                      <option value="BUSY">🟡 Currently Busy (Limited)</option>
                      <option value="NOT_LOOKING">🔴 Not Looking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Location / Timezone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field pl-9"
                        placeholder="e.g. Austin, TX / Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Gender
                      </label>
                      <select
                        className="input-field text-xs"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Age
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        className="input-field text-xs"
                        placeholder="e.g. 28"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Skills & Technologies Ecosystem */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Zap size={16} className="text-purple-600" />
                    3. Skills & Technologies Cloud
                  </h3>
                  <span className="text-xs font-bold text-purple-600">
                    {skills.length} skills active
                  </span>
                </div>

                {/* Custom Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input-field text-xs"
                    placeholder="Type a skill and press Enter (e.g. Next.js, Rust, Kubernetes)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="btn-secondary text-xs px-4 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shrink-0"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>

                {/* Active Skills Pills */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 min-h-[50px] mb-3">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No skills added yet. Add from trending below or type above.</span>
                  ) : (
                    skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-purple-400 hover:text-purple-800 hover:bg-purple-100 p-0.5 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Trending Skills Suggestions */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Popular Tech Suggestions (Click to Add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingSkills.map((ts) => {
                      const isSelected = skills.some((s) => s.toLowerCase() === ts.toLowerCase());
                      return (
                        <button
                          key={ts}
                          type="button"
                          onClick={() => (!isSelected ? handleAddSkill(ts) : handleRemoveSkill(ts))}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {ts}
                        </button>
                      );
                    })}
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
                  className="btn-primary text-xs py-2.5 px-7 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Profile...
                    </>
                  ) : (
                    'Save Freelancer Profile'
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
                <Sparkles size={14} className="text-purple-600" /> Live Talent Directory Preview
              </span>
              <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Public Card
              </span>
            </div>

            {/* Mock Freelancer Card */}
            <div className="glass-card rounded-3xl p-6 border border-purple-100 shadow-xl relative overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Freelancer')}&background=8b5cf6&color=fff`}
                    alt={fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow bg-white shrink-0"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      availabilityStatus === 'AVAILABLE'
                        ? 'bg-emerald-500'
                        : availabilityStatus === 'BUSY'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 truncate">
                      {fullName || 'Alex Morgan'}
                    </h4>
                    <ShieldCheck size={16} className="text-purple-600 shrink-0" title="Verified Freelancer" />
                  </div>
                  <p className="text-xs font-semibold text-purple-600 mt-0.5 truncate">
                    {title || 'Senior Full-Stack Architect'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{location || 'San Francisco, CA'}</span>
                  </div>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed bg-white/70 p-3 rounded-2xl border border-slate-100">
                {bio || 'Your professional bio will appear here for prospective clients to evaluate.'}
              </p>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center mb-4">
                <div className="p-2 rounded-xl bg-slate-50/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rate</span>
                  <span className="text-xs font-extrabold text-slate-900">${hourlyRate}/hr</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Level</span>
                  <span className="text-xs font-extrabold text-purple-600">{experienceLevel}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Response</span>
                  <span className="text-xs font-extrabold text-emerald-600">&lt; {responseTimeMinutes}m</span>
                </div>
              </div>

              {/* Skills preview tags */}
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 5).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {s}
                  </span>
                ))}
                {skills.length > 5 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                    +{skills.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Earnings Potential Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-purple-300">Estimated Monthly Earnings</span>
                <span className="text-xs font-black text-emerald-400">${(hourlyRate * 30 * 4).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-purple-200 leading-relaxed">
                Based on 30 billable client hours per week at your current rate of ${hourlyRate}/hr.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
