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
        // Get user metadata from different possible sources
        const userMetadata = session.user.user_metadata || {};
        
        // Try multiple possible field names for Google OAuth
        let firstName = '';
        let lastName = '';
        
        // Google OAuth typically uses: given_name, family_name
        if (userMetadata.given_name) {
          firstName = userMetadata.given_name;
          lastName = userMetadata.family_name || '';
        }
        // Some providers use: first_name, last_name
        else if (userMetadata.first_name) {
          firstName = userMetadata.first_name;
          lastName = userMetadata.last_name || '';
        }
        // Fallback to full_name
        else if (userMetadata.full_name) {
          const nameParts = userMetadata.full_name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        // Fallback to email username
        else if (session.user.email) {
          const emailParts = session.user.email.split('@');
          firstName = emailParts[0] || '';
          lastName = '';
        }

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
              first_name: firstName,
              last_name: lastName,
              role: 'customer',
              avatar_url: userMetadata.picture || userMetadata.avatar_url || null,
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        } else {
          // Update existing user with latest info from OAuth
          const { error: updateError } = await supabase
            .from('users')
            .update({
              first_name: firstName || existingUser.first_name,
              last_name: lastName || existingUser.last_name,
              avatar_url: userMetadata.picture || existingUser.avatar_url,
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating user:', updateError);
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