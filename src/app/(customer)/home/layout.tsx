'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Layout for customer home page
 * Handles Google OAuth callback if token is present in URL
 */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if this is a Google OAuth callback (has token in URL)
    const token = searchParams.get('token') || searchParams.get('access_token');
    const user = searchParams.get('user');

    if (token) {
      console.log('[HomeLayout] Google OAuth callback detected, redirecting to /google-callback');
      
      // Redirect to google-callback page with params
      const callbackUrl = `/google-callback?token=${encodeURIComponent(token)}${
        user ? `&user=${encodeURIComponent(user)}` : ''
      }`;
      
      router.replace(callbackUrl);
    }
  }, [searchParams, router]);

  return <>{children}</>;
}
