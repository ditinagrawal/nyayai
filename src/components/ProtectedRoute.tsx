import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    // Show loading indicator while Clerk is loading
    return <div className="flex h-screen items-center justify-center">Loading authentication...</div>;
  }

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={`/dashboard${location.search}`} />
      </SignedOut>
    </>
  );
} 