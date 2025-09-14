// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Type for the hook return
interface AuthHook {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error('Session error:', error.message);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2️⃣ Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in user
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // 1️⃣ Sign up in Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) return { error: authError.message };
      if (!data.user) return { error: 'Failed to create user' };
  
      // 2️⃣ Insert into project table
      const { error: dbError } = await supabase.from('project').insert([{ name, email }]);
      if (dbError) {
        // Optional: rollback auth user here if needed
        return { error: dbError.message };
      }
  
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };
  
  // Sign out user
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

