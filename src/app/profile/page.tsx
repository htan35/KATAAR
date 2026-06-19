'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import { User, Mail, Phone, Image, Save, Check, Loader2 } from 'lucide-react';
import { updateProfile } from '@/lib/actions';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with user session on load
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = session.user as any;
      setFirstName(u.firstName || u.name?.split(' ')[0] || '');
      setLastName(u.lastName || u.name?.split(' ').slice(1).join(' ') || '');
      setEmail(u.email || '');
      setMobileNumber(u.mobileNumber || '');
      setAvatarUrl(u.image || '');
    }
  }, [session, status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const result = await updateProfile({
        firstName,
        lastName,
        mobileNumber,
        image: avatarUrl,
      });

      if (result.error) {
        setError(result.error);
        setSaving(false);
      } else {
        // Trigger a session update to refresh client state
        await update();
        setSuccess(true);
        setSaving(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details.');
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display mb-1">Profile</h1>
          <p className="text-sm text-text-secondary">Change your profile details here.</p>
        </header>

        <form onSubmit={handleSave} className="flex-1 flex justify-center items-start overflow-y-auto pr-1">
          <div className="w-full max-w-[600px] p-8 bg-white/[0.02] border border-border-glass rounded-2xl flex flex-col gap-6 shadow-md max-sm:p-5">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-5 pb-5 border-b border-white/5">
              <img 
                src={avatarUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60"} 
                alt="Profile Avatar" 
                className="w-20 h-20 rounded-full object-cover border-3 border-accent-purple/20 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Helium";
                }}
              />
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-text-primary">
                  {firstName} {lastName}
                </h3>
                <span className="text-xs text-text-secondary">{email}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary">First name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-primary focus:bg-white/[0.06] focus:border-accent-purple outline-none transition"
                    required
                  />
                  <User className="absolute right-4 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary">Last name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-primary focus:bg-white/[0.06] focus:border-accent-purple outline-none transition"
                    required
                  />
                  <User className="absolute right-4 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-2 max-sm:col-span-1">
                <label className="text-xs font-semibold text-text-secondary">Email address</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/[0.01] border border-border-glass/40 rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-muted outline-none cursor-not-allowed"
                  />
                  <Mail className="absolute right-4 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-2 max-sm:col-span-1">
                <label className="text-xs font-semibold text-text-secondary">Mobile number</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-primary focus:bg-white/[0.06] focus:border-accent-purple outline-none transition"
                    required
                  />
                  <Phone className="absolute right-4 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-2 max-sm:col-span-1">
                <label className="text-xs font-semibold text-text-secondary">Avatar image URL</label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-white/[0.03] border border-border-glass rounded-lg py-2.5 pl-4 pr-10 text-sm text-text-primary focus:bg-white/[0.06] focus:border-accent-purple outline-none transition"
                  />
                  <Image className="absolute right-4 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Notification Alerts */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3 rounded-lg text-sm transition animate-[fadeIn_0.2s_ease-out]">
                <Check size={16} />
                <span>Profile updated successfully!</span>
              </div>
            )}
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red-hover p-3 rounded-lg text-sm text-center transition animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={saving} 
                className="flex items-center justify-center gap-2 bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover font-bold text-sm px-6 py-3 rounded-lg transition duration-200 disabled:opacity-75 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Saving...</span>
                  </>
                ) : success ? (
                  <>
                    <Check size={16} />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
