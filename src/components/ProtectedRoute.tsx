// ProtectedRoute — redirects unauthenticated users to /admin/login

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
