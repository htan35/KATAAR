'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-screen h-screen bg-bg-primary text-accent-purple">
        <Loader2 className="animate-spin" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/chat';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if auth redirected with an error
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password');
    } else if (errorParam) {
      setError('An error occurred during authentication');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error || 'Invalid credentials');
      } else {
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen relative p-6 overflow-hidden bg-bg-primary">
      {/* Floating background doodles */}
      <div className="absolute select-none pointer-events-none z-1 top-[10%] left-[5%] animate-[spin_20s_linear_infinite]">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5">
          <path d="M50,50 C60,40 55,20 40,25 C20,30 25,60 45,70 C70,80 80,45 70,30 C60,15 30,20 20,45 C10,70 30,85 55,85 C80,85 90,60 85,35" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute select-none pointer-events-none z-1 top-[8%] right-[6%] animate-[bounce_8s_ease-in-out_infinite_alternate]">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5">
          <circle cx="50" cy="50" r="40" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="50" y1="50" x2="22" y2="78" />
          <line x1="50" y1="50" x2="78" y2="78" />
        </svg>
      </div>

      <div className="absolute select-none pointer-events-none z-1 bottom-[12%] right-[8%] animate-[spin_30s_linear_infinite_reverse]">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5">
          <rect x="10" y="20" width="50" height="50" rx="4" transform="rotate(15 35 45)" />
          <rect x="35" y="35" width="50" height="50" rx="4" transform="rotate(-10 60 60)" />
        </svg>
      </div>

      {/* Main Login Panel */}
      <div className="w-full max-w-[460px] p-8 md:p-10 flex flex-col gap-6 z-10 bg-bg-glass backdrop-blur-xl border border-border-glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary font-display">Welcome Back!</h2>
          <p className="text-sm text-text-secondary">The faster you fill up, the faster you get the ticket.</p>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red-hover p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-3 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-4 text-text-secondary pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="************"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-3 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-text-secondary hover:text-text-primary flex items-center justify-center outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-border-glass bg-white/[0.03] text-accent-purple focus:ring-0 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-text-secondary hover:text-text-primary transition duration-150">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover py-3 rounded-lg font-bold text-sm text-center shadow-lg transition duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-center relative my-2">
          <div className="absolute w-full h-[1px] bg-border-glass z-1"></div>
          <span className="bg-[#0e0a1b] px-3 text-text-muted text-xs z-2">or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex items-center justify-center gap-3 bg-white/[0.04] border border-border-glass text-text-primary hover:bg-white/[0.08] hover:border-white/20 py-3 rounded-lg font-semibold text-sm transition duration-200"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <p className="text-center text-xs text-text-secondary mt-2">
          Don’t have an account? <Link href="/signup" className="text-accent-purple font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
