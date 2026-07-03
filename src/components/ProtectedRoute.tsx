import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'OPERATOR' }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (requiredRole && profile && profile.role !== requiredRole && profile.role !== 'ADMIN') {
        // ADMIN can access OPERATOR routes, but OPERATOR cannot access ADMIN routes
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate, requiredRole, profile]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  }

  if (!user) return null;
  if (requiredRole && profile?.role !== 'ADMIN' && profile?.role !== requiredRole) return null;

  return <>{children}</>;
};
