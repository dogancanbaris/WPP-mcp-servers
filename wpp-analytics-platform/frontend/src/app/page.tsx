'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Root Page - Smart Auth-Aware Redirect
 *
 * Automatically redirects users based on authentication status:
 * - If authenticated → /dashboard (practitioner home page)
 * - If not authenticated → /login (authentication page)
 *
 * This replaces the default Next.js welcome page with intelligent routing.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const supabase = createClient();

        // Check current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth check error:', error);
          router.push('/login');
          return;
        }

        // Redirect based on auth status
        if (session?.user) {
          // User is authenticated → go to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated → go to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        router.push('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
