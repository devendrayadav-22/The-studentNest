import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading, getDashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#E9ECEF]">
        <div className="bg-white/80 p-8 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // If specific roles required and user's role is not among them
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to user's own authorized dashboard
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;

