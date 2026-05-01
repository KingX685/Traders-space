import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

// ============================================================
// AUTH CONTEXT
// ------------------------------------------------------------
// Provides current session + auth methods. Works without Supabase
// configured (returns null user, all methods are no-ops).
// ============================================================
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, name }) => {
    if (!isSupabaseConfigured) return { error: { message: 'Accounts not configured' } };
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
  };

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) return { error: { message: 'Accounts not configured' } };
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithMagicLink = async (email) => {
    if (!isSupabaseConfigured) return { error: { message: 'Accounts not configured' } };
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/app' },
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    return supabase.auth.signOut();
  };

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured) return { error: { message: 'Accounts not configured' } };
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/app',
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      isSupabaseConfigured,
      signUp,
      signIn,
      signInWithMagicLink,
      signOut,
      sendPasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
