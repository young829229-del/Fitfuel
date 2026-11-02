import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { loginWithGoogle, loginWithPasscode, error, loading } = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [usePasscodeOption, setUsePasscodeOption] = useState(false);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setSubmitting(true);
    await loginWithPasscode(passcode);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative selection:bg-yellow-500 selection:text-black">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black -z-10 pointer-events-none" />

      {/* Return to Store Link */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Store
      </Link>

      <div className="w-full max-w-md bg-neutral-950/90 border border-neutral-800 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl relative">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 mb-4 shadow-lg border border-neutral-700">
            <img 
              src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
              alt="FitFul Nepal Logo" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">FitFul Nepal</h1>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 mt-1 uppercase flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" /> Authorized Admin Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Notice for Authorized Admin */}
        <div className="mb-6 px-4 py-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 text-center">
          Authorized Administrator: <span className="text-neutral-200 font-mono font-medium">young829229@gmail.com</span>
        </div>

        {/* Google Sign-in */}
        <div className="space-y-4">
          <button
            onClick={() => loginWithGoogle()}
            disabled={loading || submitting}
            className="w-full py-3.5 px-6 bg-white hover:bg-neutral-100 text-black font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-neutral-800"></div>
            <span className="px-3 text-xs text-neutral-500 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-neutral-800"></div>
          </div>

          {/* Passcode Option */}
          {!usePasscodeOption ? (
            <button
              onClick={() => setUsePasscodeOption(true)}
              className="w-full py-3 px-4 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-300 font-medium rounded-2xl transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-yellow-500" />
              Sign in with Admin Passcode (Quick Access)
            </button>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Master Passcode (admin123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-4 top-3.5 pointer-events-none" />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Verifying...' : 'Unlock Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setUsePasscodeOption(false)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-[11px] text-neutral-600">
          Protected by Firebase Security Rules & RBAC • FitFul Nepal
        </div>
      </div>
    </div>
  );
}
