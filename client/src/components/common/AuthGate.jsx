import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export const AuthGate = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card rounded-2xl text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-600 mb-6">
          This area requires a <span className="font-semibold text-brand-600 uppercase tracking-wide">{requiredRole}</span> account. 
          You are currently signed in as a <span className="font-semibold text-slate-800 capitalize">{user?.role}</span>.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-secondary">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link to="/auth" className="btn-primary">
            <LogIn size={16} /> Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
