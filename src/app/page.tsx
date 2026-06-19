'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen w-screen justify-between p-8 md:px-16 md:py-10 relative overflow-hidden bg-bg-primary animate-[fadeIn_0.5s_ease-out]">
      {/* Navigation Header */}
      <header className="flex justify-between items-center h-16 z-10 shrink-0">
        <div className="font-display text-2xl font-extrabold tracking-widest text-text-primary">
          <Link href="/">KATAAR</Link>
        </div>
        <nav className="flex gap-10 max-md:hidden">
          <a href="#about" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">About Us</a>
          <a href="#contact" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">Contact</a>
          <a href="#resources" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">Resources</a>
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

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-20 px-5 max-w-[900px] mx-auto text-center">
        {/* Hand-drawn Squiggle top-left */}
        <div className="absolute select-none pointer-events-none top-[60px] left-[10px] animate-[float_4s_ease-in-out_infinite_alternate] max-md:top-[20px]">
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10C25 15 20 40 45 42C65 44 60 20 75 18C90 16 85 45 92 48" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-7 z-5">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-b from-white to-text-secondary bg-clip-text text-transparent font-display">
            Get your E-tickets <br />
            faster with our chatbot.
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[620px]">
            Experience the <span className="text-accent-purple font-semibold">convenience</span> of booking e-tickets <span className="text-accent-purple font-semibold">seamlessly</span> through our <span className="text-accent-purple font-semibold">AI</span> chatbot interface. Say goodbye to long queues and complicated processes.
          </p>

          <div className="flex items-center gap-5 mt-2">
            <Link 
              href="/chat"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-50 text-slate-900 px-7 py-3.5 rounded-xl font-bold text-sm shadow-[0_4px_14px_rgba(255,255,255,0.08)] transition duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Book your ticket now</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>

            <Link 
              href="/help"
              className="flex items-center gap-2 text-text-primary hover:text-accent-purple px-6 py-3.5 font-semibold text-sm transition duration-200 cursor-pointer"
            >
              <span>Learn more</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Hand-drawn Arrow pointing to primary button */}
        <div className="absolute select-none pointer-events-none bottom-5 left-[-40px] rotate-[5deg] max-md:hidden">
          <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 75C60 70 120 40 145 15" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M130 14C140 14 145 15 145 15L144 28" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </main>

      {/* Footer Socials */}
      <footer className="flex justify-end items-center h-10 z-10 shrink-0">
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
