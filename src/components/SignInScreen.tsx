import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, BrainCircuit, Sparkles, Lock, AlertCircle } from 'lucide-react';
import {
  renderGoogleSignInButton,
  isAuthConfigured,
} from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const { setUser } = useAuth();
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [demoSubmitting, setDemoSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!buttonRef.current) return;
    if (!isAuthConfigured()) {
      setError(
        'Google SSO not configured — add GOOGLE_CLIENT_ID to .env.local. You can use the demo sign-in below to explore the app.'
      );
      return;
    }
    renderGoogleSignInButton(
      buttonRef.current,
      (user) => setUser(user),
      (err) => setError(err.message)
    );
  }, [setUser]);

  const handleDemoSignIn = () => {
    setDemoSubmitting(true);
    setTimeout(() => {
      setUser({
        sub: 'demo-george',
        name: 'George Rest',
        email: 'george@gjh-inc.com',
        picture: '',
        provider: 'demo',
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand mark */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <div className="w-5 h-5 bg-white rounded-md" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">AXIOM</h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Executive</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Authenticated Access Required
              </span>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in to AXIOM Executive</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Strategic intelligence extracted from your meetings — secured behind enterprise SSO.
              </p>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-medium">Transcript-only processing — no recording storage</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="font-medium">Gemini-powered action extraction</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="font-medium">Role-validated to C-suite hierarchy</span>
              </div>
            </div>

            {/* Google sign-in button container — GIS renders into this div */}
            <div className="flex justify-center pt-2">
              <div ref={buttonRef} className="min-h-[44px]" />
            </div>

            {error && (
              <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            <button
              onClick={handleDemoSignIn}
              disabled={demoSubmitting}
              className="w-full px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {demoSubmitting ? 'Signing in...' : 'Continue in Demo Mode'}
            </button>
            <p className="text-[10px] text-slate-400 text-center font-medium tracking-wide">
              Demo mode signs you in as <span className="font-mono">george@gjh-inc.com</span> without contacting Google.
            </p>
          </div>

          <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              AXIOM-LLM-v4
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-tighter">
              METRIC_CONFIDENCE: 0.9841
            </span>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium tracking-wide">
          By signing in you agree to transcript-only processing under your organization's data policy.
        </p>
      </motion.div>
    </div>
  );
}
