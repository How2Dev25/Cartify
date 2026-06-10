'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        router.push('/login?error=authentication_failed');
        return;
      }

      if (session) {
        // Check if user exists in your users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          // Create user profile with customer role
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.given_name || '',
              last_name: session.user.user_metadata?.family_name || '',
              role: 'customer',
              avatar_url: session.user.user_metadata?.picture || null
            });

          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        }

        // Redirect to home page
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}