import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function AuthGate({ children, fallback }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return fallback ?? <div>Loading...</div>;
  }

  if (!session) {
    return fallback ?? (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">Axiom Intelligence</h1>
          <p className="text-slate-600">Sign in to access your meeting intelligence</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const email = formData.get('email') as string;
              await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="block w-full rounded-md border-slate-300 px-3 py-2 text-slate-900 ring ring-slate-300 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Send magic link
            </button>
          </form>
          <p className="text-slate-500 text-xs">
            Check your email for a sign-in link. Links expire in 60 minutes.
          </p>
        </div>
      </div>
    );
  }

  // User is signed in
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" id="app-container">
      {children}
    </div>
  );
}