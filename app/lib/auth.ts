// lib/auth.ts
import { supabase } from "./supabase";

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  role?: 'customer' | 'admin';
}

export async function signUp(userData: UserData) {
  try {
    // Create user account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('User creation failed');

    // Wait a bit for the auth session
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add user to users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        birth_date: userData.birthDate,
        gender: userData.gender,
        address_line1: userData.addressLine1,
        address_line2: userData.addressLine2,
        city: userData.city,
        province: userData.province,
        postal_code: userData.postalCode,
        country: userData.country,
        role: userData.role || 'customer'
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      // Don't throw - auth account exists
    }

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Redirect to home page after sign out
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { 
        ...user, 
        profile: { 
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || ''
        }, 
        role: 'customer' 
      };
    }

    return { 
      ...user, 
      profile: userData, 
      role: userData?.role || 'customer' 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role || 'customer';
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}

// ADD THIS FUNCTION - Local avatar upload (no Supabase Storage)
export async function uploadAvatarLocally(userId: string, file: File) {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Store base64 directly in the users table (simplest approach)
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: base64 })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Notify client UI that profile data changed so components can refresh
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('user-profile-updated'));
      }
    } catch (e) {
      // ignore
    }

    return { success: true, url: base64 };
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return { success: false, error: error.message };
  }
}

// Alternative: If you prefer file system storage (requires API endpoint)
export async function uploadAvatarToFilesystem(userId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    // Store the URL in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: data.url })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, url: data.url };
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return { success: false, error: error.message };
  }
}