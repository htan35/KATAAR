'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import { Globe, Sun, Moon, Bell, Check, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);
  const [notifyPromo, setNotifyPromo] = useState(true);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('kataar_language');
    if (savedLang) setLanguage(savedLang);
    
    const savedTheme = localStorage.getItem('kataar_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kataar_language', language);
    localStorage.setItem('kataar_theme', theme);
    
    // Apply theme changes to document
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-purple" size={36} />
          <span className="text-sm text-text-secondary">Syncing session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 w-screen h-screen p-6 overflow-hidden max-md:p-3">
      {/* Left Column (Sidebar) */}
      <ChatSidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col rounded-2xl overflow-hidden bg-bg-glass backdrop-blur-xl border border-border-glass p-8 max-md:p-4">
        <header className="mb-8 shrink-0">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display mb-1">Settings</h1>
          <p className="text-sm text-text-secondary">Customize theme, language, and notifications.</p>
        </header>

        <form onSubmit={handleSave} className="flex-1 flex justify-center items-start overflow-y-auto pr-1">
          <div className="w-full max-w-[650px] p-8 bg-white/[0.02] border border-border-glass rounded-2xl flex flex-col gap-6 shadow-md max-sm:p-5">
            
            {/* 1. Language Section */}
            <div className="pb-6 border-b border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-accent-purple">
                <Globe size={18} />
                <h3 className="text-sm font-semibold text-text-primary">Language Selection</h3>
              </div>
              <p className="text-xs text-text-secondary">Select your preferred language for chatbot booking.</p>
              <div className="mt-2">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 px-4 text-sm text-text-primary focus:bg-white/[0.06] focus:border-accent-purple outline-none cursor-pointer"
                >
                  <option value="English" className="bg-[#111019] text-text-primary">English (United States)</option>
                  <option value="Hindi" className="bg-[#111019] text-text-primary">हिन्दी (Hindi)</option>
                  <option value="Marathi" className="bg-[#111019] text-text-primary">मराठी (Marathi)</option>
                  <option value="Spanish" className="bg-[#111019] text-text-primary">Español (Spanish)</option>
                </select>
              </div>
            </div>

            {/* 2. Theme Section */}
            <div className="pb-6 border-b border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-accent-purple">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <h3 className="text-sm font-semibold text-text-primary">Appearance Theme</h3>
              </div>
              <p className="text-xs text-text-secondary">Choose how KATAAR dashboard appears on your screen.</p>
              <div className="flex gap-4 mt-2 max-sm:flex-col">
                <button 
                  type="button" 
                  onClick={() => setTheme('dark')} 
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition ${
                    theme === 'dark' 
                      ? 'bg-accent-purple/10 border-accent-purple text-accent-purple' 
                      : 'bg-white/[0.02] border-white/5 text-text-secondary'
                  }`}
                >
                  <Moon size={16} />
                  <span>Dark Glass</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setTheme('light')} 
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition ${
                    theme === 'light' 
                      ? 'bg-accent-purple/10 border-accent-purple text-accent-purple' 
                      : 'bg-white/[0.02] border-white/5 text-text-secondary'
                  }`}
                >
                  <Sun size={16} />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>

            {/* 3. Notifications Section */}
            <div className="pb-2 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-accent-purple">
                <Bell size={18} />
                <h3 className="text-sm font-semibold text-text-primary">Notification Settings</h3>
              </div>
              <p className="text-xs text-text-secondary mb-2">Choose what alerts you would like to receive.</p>
              
              <div className="flex flex-col gap-4">
                <label className="flex justify-between items-center cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-sm font-semibold text-text-primary">Booking Confirmations</span>
                    <span className="text-[11px] text-text-secondary">Get notified when E-tickets are successfully issued.</span>
                  </div>
                  <div className="relative w-11 h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={notifyBookings}
                      onChange={(e) => setNotifyBookings(e.target.checked)}
                      className="peer opacity-0 w-0 h-0"
                    />
                    <div className="absolute inset-0 cursor-pointer bg-white/10 border border-white/10 rounded-full transition peer-checked:bg-accent-purple/20 peer-checked:border-accent-purple" />
                    <div className="absolute left-[3px] bottom-[3px] h-4.5 w-4.5 rounded-full bg-slate-300 transition duration-300 peer-checked:translate-x-5 peer-checked:bg-accent-purple" />
                  </div>
                </label>

                <label className="flex justify-between items-center cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-sm font-semibold text-text-primary">System Updates</span>
                    <span className="text-[11px] text-text-secondary">Receive news about new city coverage and feature updates.</span>
                  </div>
                  <div className="relative w-11 h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={notifySystem}
                      onChange={(e) => setNotifySystem(e.target.checked)}
                      className="peer opacity-0 w-0 h-0"
                    />
                    <div className="absolute inset-0 cursor-pointer bg-white/10 border border-white/10 rounded-full transition peer-checked:bg-accent-purple/20 peer-checked:border-accent-purple" />
                    <div className="absolute left-[3px] bottom-[3px] h-4.5 w-4.5 rounded-full bg-slate-300 transition duration-300 peer-checked:translate-x-5 peer-checked:bg-accent-purple" />
                  </div>
                </label>

                <label className="flex justify-between items-center cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-sm font-semibold text-text-primary">Promotion Alerts</span>
                    <span className="text-[11px] text-text-secondary">Receive notifications about discounts and tourist events.</span>
                  </div>
                  <div className="relative w-11 h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={notifyPromo}
                      onChange={(e) => setNotifyPromo(e.target.checked)}
                      className="peer opacity-0 w-0 h-0"
                    />
                    <div className="absolute inset-0 cursor-pointer bg-white/10 border border-white/10 rounded-full transition peer-checked:bg-accent-purple/20 peer-checked:border-accent-purple" />
                    <div className="absolute left-[3px] bottom-[3px] h-4.5 w-4.5 rounded-full bg-slate-300 transition duration-300 peer-checked:translate-x-5 peer-checked:bg-accent-purple" />
                  </div>
                </label>
              </div>
            </div>

            {/* Notification Toast */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3 rounded-lg text-sm transition animate-[fadeIn_0.2s_ease-out]">
                <Check size={16} />
                <span>Settings saved successfully!</span>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover font-bold text-sm px-6 py-3 rounded-lg transition duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                Save Preferences
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
