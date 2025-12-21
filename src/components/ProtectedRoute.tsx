import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // Check if we're in the middle of an OAuth callback (has code param)
  const searchParams = new URLSearchParams(location.search);
  const hasAuthCallback = searchParams.has('code') || searchParams.has('state');

  useEffect(() => {
    // If we have OAuth callback params, wait for Kinde to process then clear the URL
    if (hasAuthCallback) {
      setIsProcessingCallback(true);
      
      // Give Kinde time to process the callback, then clear URL params
      const timeout = setTimeout(() => {
        // Clear the OAuth params from URL
        navigate(location.pathname, { replace: true });
        setIsProcessingCallback(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [hasAuthCallback, location.pathname, navigate]);

  console.log('[ProtectedRoute] State:', { loading, isSignedIn, hasAuthCallback, isProcessingCallback, path: location.pathname });

  // Show loading while auth is being processed
  if (loading || isProcessingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            {isProcessingCallback ? 'Completing sign in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    console.log('[ProtectedRoute] Not signed in, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
