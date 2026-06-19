'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Combined name
  email: string;
  mobileNumber: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (firstName: string, lastName: string, email: string, mobileNumber: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Load extra user details from public profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
              email: session.user.email || '',
              mobileNumber: profile?.mobile_number || '',
              avatarUrl: profile?.avatar_url || '/mockups/Profile page.png', // Default avatar
            });
          }
        } else {
          // LocalStorage fallback
          const currentUser = localStorage.getItem('kataar_current_user');
          if (currentUser) {
            setUser(JSON.parse(currentUser));
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // Sign up
  const signUp = async (firstName: string, lastName: string, email: string, mobileNumber: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;

        if (data.user) {
          // Write to a public profiles table
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            mobile_number: mobileNumber,
            avatar_url: '',
          });
          if (profileErr) throw profileErr;
          
          setError('Sign up successful! Please check your email for confirmation.');
          return true;
        }
        return false;
      } else {
        // LocalStorage mock signup
        const usersJSON = localStorage.getItem('kataar_users') || '[]';
        const users = JSON.parse(usersJSON) as any[];

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('User already exists with this email address.');
        }

        const newUser: UserProfile = {
          id: Math.random().toString(36).substr(2, 9),
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          mobileNumber,
          avatarUrl: '', // Will default to a placeholder in UI if empty
        };

        users.push({ ...newUser, password }); // Store password for simple verification
        localStorage.setItem('kataar_users', JSON.stringify(users));
        localStorage.setItem('kataar_current_user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      return false;
    }
  };

  // Sign in
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const loggedInUser: UserProfile = {
            id: data.user.id,
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
            email: data.user.email || '',
            mobileNumber: profile?.mobile_number || '',
            avatarUrl: profile?.avatar_url || '',
          };
          setUser(loggedInUser);
          return true;
        }
        return false;
      } else {
        // LocalStorage mock login
        const usersJSON = localStorage.getItem('kataar_users') || '[]';
        const users = JSON.parse(usersJSON) as any[];

        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!foundUser) {
          throw new Error('Invalid email or password');
        }

        const loggedInUser: UserProfile = {
          id: foundUser.id,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          name: foundUser.name,
          email: foundUser.email,
          mobileNumber: foundUser.mobileNumber,
          avatarUrl: foundUser.avatarUrl,
        };

        localStorage.setItem('kataar_current_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      return false;
    }
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('kataar_current_user');
    }
    setUser(null);
  };

  // Update profile details
  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    setError(null);
    try {
      if (!user) throw new Error('No active user session');

      const updatedProfile = { ...user, ...updates };

      if (isSupabaseConfigured && supabase) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            first_name: updates.firstName !== undefined ? updates.firstName : user.firstName,
            last_name: updates.lastName !== undefined ? updates.lastName : user.lastName,
            mobile_number: updates.mobileNumber !== undefined ? updates.mobileNumber : user.mobileNumber,
            avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl,
          })
          .eq('id', user.id);
        if (profileErr) throw profileErr;
      } else {
        // LocalStorage update
        const usersJSON = localStorage.getItem('kataar_users') || '[]';
        let users = JSON.parse(usersJSON) as any[];

        users = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              ...updates,
              name: `${updates.firstName || u.firstName} ${updates.lastName || u.lastName}`.trim()
            };
          }
          return u;
        });

        localStorage.setItem('kataar_users', JSON.stringify(users));
        localStorage.setItem('kataar_current_user', JSON.stringify(updatedProfile));
      }
      
      setUser(updatedProfile);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
