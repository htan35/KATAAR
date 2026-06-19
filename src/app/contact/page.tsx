'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen w-screen justify-between p-8 md:px-16 md:py-10 relative overflow-hidden bg-bg-primary animate-[fadeIn_0.5s_ease-out]">
      {/* Navigation Header */}
      <header className="flex justify-between items-center h-16 z-10 shrink-0">
        <div className="font-display text-2xl font-extrabold tracking-widest text-text-primary">
          <Link href="/">KATAAR</Link>
        </div>
        <nav className="flex gap-10 max-md:hidden">
          <Link href="/about" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">About Us</Link>
          <Link href="/contact" className="text-text-primary text-sm font-semibold transition">Contact</Link>
          <Link href="/resources" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">Resources</Link>
        </nav>
        <div className="flex gap-3">
          {session?.user ? (
            <Link 
              href="/chat" 
              className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-text-primary px-6 py-2.5 rounded-full text-sm font-semibold transition duration-200"
            >
              Go to App &rarr;
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-text-secondary hover:text-text-primary px-4 py-2.5 text-sm font-semibold transition duration-200"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-text-primary px-6 py-2.5 rounded-full text-sm font-semibold transition duration-200"
              >
                Sign up &rarr;
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-20 px-5 max-w-[900px] mx-auto text-center z-10 w-full">
        <Link href="/" className="absolute top-0 left-0 md:-left-10 flex items-center gap-2 text-text-secondary hover:text-accent-purple transition group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>
        
        <div className="w-full flex flex-col md:flex-row gap-12 items-center md:items-start animate-[slideUp_0.6s_ease-out]">
          
          <div className="flex-1 text-left flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-text-primary font-display">
              Get in <span className="text-accent-purple">Touch</span>
            </h1>
            <p className="text-base text-text-secondary leading-relaxed">
              Have questions about booking tickets, integrating with our platform, or just want to say hi? We're here to help.
            </p>

            <div className="flex flex-col gap-5 mt-4">
              <div className="flex items-center gap-4 text-text-primary">
                <div className="bg-white/[0.05] p-3 rounded-full border border-white/10">
                  <Mail size={20} className="text-accent-purple" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-secondary font-semibold">Email Us</span>
                  <span>support@kataar.com</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-text-primary">
                <div className="bg-white/[0.05] p-3 rounded-full border border-white/10">
                  <Phone size={20} className="text-accent-green" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-secondary font-semibold">Call Us</span>
                  <span>+91 98765 43210</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-text-primary">
                <div className="bg-white/[0.05] p-3 rounded-full border border-white/10">
                  <MapPin size={20} className="text-yellow-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-secondary font-semibold">Visit Us</span>
                  <span>New Delhi, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full bg-white/[0.02] border border-border-glass rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
            {success ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-glass backdrop-blur-xl rounded-2xl p-6 z-20 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center text-accent-green mb-4">
                  <Send size={28} />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Message Sent!</h3>
                <p className="text-sm text-text-secondary mt-2">We'll get back to you within 24 hours.</p>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Full Name</label>
                <input type="text" required placeholder="John Doe" className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple outline-none transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Email Address</label>
                <input type="email" required placeholder="john@example.com" className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple outline-none transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Message</label>
                <textarea required rows={4} placeholder="How can we help?" className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:bg-white/[0.06] focus:border-accent-purple outline-none transition resize-none" />
              </div>
              <button disabled={loading} type="submit" className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover py-3 rounded-lg font-bold text-sm text-center shadow-lg transition duration-200 mt-2 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer Socials */}
      <footer className="flex justify-between items-center h-10 z-10 shrink-0 mt-10">
        <div className="text-text-secondary text-sm font-medium">
          created ❤️ Harsh Tanwar and Krish Jain
        </div>
        <div className="flex gap-6">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition hover:scale-105" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition hover:scale-105" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
