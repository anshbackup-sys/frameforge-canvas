import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for both auth and admin loading to complete
    if (authLoading || adminLoading) {
      return;
    }

    // Mark that we've done the check
    setHasChecked(true);

    // If no user, redirect to admin login
    if (!user) {
      navigate('/admin/login', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // If user exists but not admin, redirect to home
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate, location.pathname]);

  // Show loading while checking auth/admin status
  if (authLoading || adminLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render children until we confirm admin access
  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;