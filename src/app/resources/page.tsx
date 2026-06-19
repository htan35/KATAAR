'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, BookOpen, Download, HelpCircle, FileText } from 'lucide-react';

export default function ResourcesPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen w-screen justify-between p-8 md:px-16 md:py-10 relative overflow-hidden bg-bg-primary animate-[fadeIn_0.5s_ease-out]">
      {/* Navigation Header */}
      <header className="flex justify-between items-center h-16 z-10 shrink-0">
        <div className="font-display text-2xl font-extrabold tracking-widest text-text-primary">
          <Link href="/">KATAAR</Link>
        </div>
        <nav className="flex gap-10 max-md:hidden">
          <Link href="/about" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">About Us</Link>
          <Link href="/contact" className="text-text-secondary hover:text-text-primary text-sm font-semibold transition">Contact</Link>
          <Link href="/resources" className="text-text-primary text-sm font-semibold transition">Resources</Link>
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
      <main className="flex-1 flex flex-col items-center justify-center relative py-20 px-5 max-w-[900px] mx-auto text-center z-10">
        <Link href="/" className="absolute top-0 left-0 md:-left-10 flex items-center gap-2 text-text-secondary hover:text-accent-purple transition group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>
        
        <div className="flex flex-col items-center gap-6 animate-[slideUp_0.6s_ease-out] w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-text-primary font-display">
            Guides & <span className="text-accent-purple">Resources</span>
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[620px]">
            Everything you need to master KATAAR. From integration guides to visitor FAQs, explore our comprehensive resource center.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full text-left">
            
            <a href="#" className="bg-white/[0.03] border border-border-glass p-6 rounded-2xl flex gap-4 items-start hover:bg-white/[0.06] hover:border-accent-purple/30 transition duration-300 group cursor-pointer">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center text-accent-purple shrink-0 group-hover:scale-110 transition">
                <BookOpen size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary text-base">User Guide</h3>
                <p className="text-xs text-text-secondary">Learn how to book tickets, manage your QR codes, and use the AI chatbot effectively.</p>
              </div>
            </a>

            <a href="#" className="bg-white/[0.03] border border-border-glass p-6 rounded-2xl flex gap-4 items-start hover:bg-white/[0.06] hover:border-accent-green/30 transition duration-300 group cursor-pointer">
              <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center text-accent-green shrink-0 group-hover:scale-110 transition">
                <HelpCircle size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary text-base">FAQs</h3>
                <p className="text-xs text-text-secondary">Find quick answers to the most commonly asked questions about payments and entry.</p>
              </div>
            </a>

            <a href="#" className="bg-white/[0.03] border border-border-glass p-6 rounded-2xl flex gap-4 items-start hover:bg-white/[0.06] hover:border-yellow-500/30 transition duration-300 group cursor-pointer">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 shrink-0 group-hover:scale-110 transition">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary text-base">API Documentation</h3>
                <p className="text-xs text-text-secondary">Integrate our ticketing engine into your own monumental heritage websites.</p>
              </div>
            </a>

            <a href="#" className="bg-white/[0.03] border border-border-glass p-6 rounded-2xl flex gap-4 items-start hover:bg-white/[0.06] hover:border-blue-500/30 transition duration-300 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition">
                <Download size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary text-base">Media Kit</h3>
                <p className="text-xs text-text-secondary">Download our official logos, brand guidelines, and high-resolution assets.</p>
              </div>
            </a>

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
