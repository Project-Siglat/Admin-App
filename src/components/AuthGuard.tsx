import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires authentication, false = public page
  requireAdmin?: boolean; // true = requires admin role (roleId = 1)
  redirectTo?: string; // where to redirect if auth requirement not met
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = true, // Admin app requires admin by default
  redirectTo 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication status
  if (loading) {
    return (
      <LoadingScreen 
        message="Verifying authentication..." 
        variant="fullscreen"
        showLogo={true}
      />
    );
  }

  // If page requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || '/unauthorized'} state={{ from: location }} replace />;
  }

  // If page requires admin role and user is not admin
  if (requireAdmin && isAuthenticated && !isAdmin) {
    return <Navigate to={redirectTo || '/unauthorized'} state={{ from: location }} replace />;
  }

  // If page is public (like login) and user is already authenticated as admin, redirect to dashboard
  if (!requireAuth && isAuthenticated && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If page is public but user is authenticated as non-admin, show unauthorized
  if (!requireAuth && isAuthenticated && !isAdmin && requireAdmin !== false) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the page
  return <>{children}</>;
};

export default AuthGuard;