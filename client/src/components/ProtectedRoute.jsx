import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-gray-100 gap-4">
        <Loader2 className="animate-spin text-primary-500" size={36} />
        <p className="text-sm text-gray-400">Authenticating access privileges...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save location so we can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
