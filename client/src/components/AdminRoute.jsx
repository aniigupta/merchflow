import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-gray-100 gap-4">
        <Loader2 className="animate-spin text-primary-500" size={36} />
        <p className="text-sm text-gray-400">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Show Access Denied message or redirect to dashboard
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20 animate-pulse">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Access Restriced</h1>
        <p className="text-gray-400 text-sm mb-8">
          This workspace is configured exclusively for authorized administrator accounts. Your account does not possess the required permissions.
        </p>
        <a
          href="/"
          className="btn-primary w-full text-center"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
