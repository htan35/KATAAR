'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/lib/actions';
import { Lock, Mail, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !mobileNumber || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('mobileNumber', mobileNumber);
      formData.append('email', email);
      formData.append('password', password);

      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Automatic login after sign up
        const loginResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl: '/chat',
        });

        if (loginResult?.error) {
          setError('Account created, but sign-in failed. Please login manually.');
          setLoading(false);
        } else {
          router.refresh();
          router.push('/chat');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setLoading(false);
    }
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

      {/* Main Signup Card */}
      <div className="w-full max-w-[480px] p-8 md:p-10 flex flex-col gap-6 z-10 bg-bg-glass backdrop-blur-xl border border-border-glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-[fadeIn_0.5s_ease-out] relative">
        <Link href="/" className="absolute top-6 left-8 flex items-center gap-1.5 text-text-muted hover:text-accent-purple transition group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold">Back</span>
        </Link>
        <div className="text-center flex flex-col gap-2 mt-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary font-display">Create Account</h2>
          <p className="text-sm text-text-secondary">
            Already a member? <Link href="/login" className="text-accent-purple font-semibold hover:underline">Log In</Link>
          </p>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red-hover p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-primary">First name</label>
              <input
                type="text"
                placeholder="Nick"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-primary">Last name</label>
              <input
                type="text"
                placeholder="Gur"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-primary">Mobile number</label>
            <div className="relative flex items-center">
              <input
                type="tel"
                placeholder="+91**********"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
              <Phone className="absolute right-4 text-text-secondary pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-primary">Email address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-4 text-text-secondary pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-primary">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="*****************"
                className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 outline-none transition duration-200"
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

          <button
            type="submit"
            disabled={loading}
            className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover py-3 rounded-lg font-bold text-sm text-center shadow-lg transition duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Registering...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}
