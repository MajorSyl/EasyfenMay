import React, { useState, useEffect, useRef } from 'react';
import { Settings, ShieldCheck, Crown, ExternalLink, Activity, LogOut, CircleCheck as CheckCircle2, TrendingUp, Loader as Loader2, Camera, CreditCard as Edit2, X, Save, Trash2, Phone, User, FileText, TriangleAlert as AlertTriangle, ChevronRight, Eye, BadgeCheck } from 'lucide-react';
import { Profile, Listing } from '../types';
import { useAppContext } from '../App';
import { ListingCard } from './FeedView';
import { supabase } from '../lib/supabase';

type ModalState = 'none' | 'edit' | 'settings' | 'delete_confirm';

export default function ProfileView() {
  const { setShowUpgrade, setSelectedListing, savedListingIds, toggleSaved, setIsAuthenticated } = useAppContext();
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>('none');

  useEffect(() => {
    fetchProfileAndListings();
  }, []);

  const fetchProfileAndListings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('listings').select(`*, profiles!listings_user_id_fkey(full_name, is_verified, phone_number, avatar_url)`)
          .eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setUserProfile(profileRes.data as unknown as Profile);
      if (listingsRes.data) setUserListings(listingsRes.data as any as Listing[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayListings = userListings.filter(l =>
    activeTab === 'active' ? l.status === 'active' : l.status !== 'active'
  );

  const totalViews = userListings.reduce((sum, l) => sum + (l.views_count || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading profile...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
        <p className="text-slate-500 mb-4 font-medium">Could not load profile.</p>
        <button onClick={() => supabase.auth.signOut()}
          className="bg-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold text-sm">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto no-scrollbar">
      <div className="max-w-3xl mx-auto w-full">

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-12 pb-0 md:pt-8 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 px-5 pb-6">
            {/* Top Actions */}
            <div className="flex justify-end gap-2 mb-6">
              <button onClick={() => setModal('settings')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                title="Settings">
                <Settings size={16} />
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                title="Log Out">
                <LogOut size={16} />
              </button>
            </div>

            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-6">
              <AvatarUpload profile={userProfile} onUpdate={(url) => setUserProfile(p => p ? { ...p, avatar_url: url } : p)} />

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white tracking-tight">{userProfile.full_name || 'Your Name'}</h1>
                  {userProfile.is_verified && (
                    <BadgeCheck size={22} className="text-sky-400 fill-sky-400/20 shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                    {userProfile.role?.replace('_', ' ') || 'User'}
                  </span>
                  {userProfile.phone_number && (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Phone size={12} /> {userProfile.phone_number}
                    </span>
                  )}
                </div>
                {userProfile.bio ? (
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 max-w-xs sm:max-w-none">{userProfile.bio}</p>
                ) : (
                  <p className="text-slate-600 text-sm italic">No bio yet — add one below</p>
                )}
              </div>

              <button onClick={() => setModal('edit')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/10 backdrop-blur-sm shrink-0">
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm mb-6">
              <StatPill label="Listings" value={userListings.length} />
              <StatPill label="Total Views" value={totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews} highlight />
              <StatPill label="Active" value={userListings.filter(l => l.status === 'active').length} />
            </div>
          </div>

          {/* Wave Separator */}
          <div className="h-6 bg-slate-50 rounded-t-3xl" />
        </div>

        {/* Main Content */}
        <div className="px-4 pb-10">

          {/* Upgrade Banner */}
          <div
            onClick={() => setShowUpgrade(true)}
            className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98] transition-transform mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Crown size={22} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-amber-100 font-bold text-[10px] uppercase tracking-widest mb-0.5">Agent Pro</p>
                <p className="text-white font-bold text-sm leading-tight">Upgrade for premium placement</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-amber-100" />
          </div>

          {/* My Listings */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-slate-400" /> My Listings
            </h2>
            <div className="flex p-1 bg-slate-200/60 rounded-xl shadow-inner">
              <TabBtn label="Active" active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
              <TabBtn label="Closed" active={activeTab === 'closed'} onClick={() => setActiveTab('closed')} />
            </div>
          </div>

          {displayListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Eye size={36} className="mb-3 opacity-30" />
              <p className="font-semibold text-sm">No {activeTab} listings yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => setSelectedListing(listing)}
                  isSaved={savedListingIds.has(listing.id)}
                  onSave={(e) => { e.stopPropagation(); toggleSaved(listing.id); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {modal === 'edit' && (
        <EditProfileModal
          profile={userProfile}
          onClose={() => setModal('none')}
          onSave={(updated) => { setUserProfile(updated); setModal('none'); }}
        />
      )}

      {/* Settings Sheet */}
      {modal === 'settings' && (
        <SettingsSheet
          onClose={() => setModal('none')}
          onDeleteRequest={() => setModal('delete_confirm')}
          onSignOut={async () => { await supabase.auth.signOut(); }}
        />
      )}

      {/* Delete Account Confirm */}
      {modal === 'delete_confirm' && (
        <DeleteAccountModal
          onClose={() => setModal('settings')}
          onDeleted={() => setIsAuthenticated(false)}
        />
      )}
    </div>
  );
}

// ── Avatar Upload ──────────────────────────────────────────────────────────
function AvatarUpload({ profile, onUpdate }: { profile: Profile; onUpdate: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('profile-avatars')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(path);

      const cacheBusted = `${publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: cacheBusted }).eq('id', profile.id);
      onUpdate(cacheBusted);
    } catch (err) {
      console.error('Avatar upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative shrink-0 group cursor-pointer" onClick={() => inputRef.current?.click()}>
      <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-slate-700 flex items-center justify-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-black text-white select-none">
            {profile.full_name?.charAt(0) || <User size={32} />}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <Loader2 size={22} className="text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 group-hover:bg-sky-400 transition-colors">
        <Camera size={14} className="text-white" />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ── Stat Pill ──────────────────────────────────────────────────────────────
function StatPill({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center py-4 px-2">
      <p className={`text-2xl font-black leading-none mb-1 ${highlight ? 'text-sky-400' : 'text-white'}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ── Tab Button ─────────────────────────────────────────────────────────────
function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
      {label}
    </button>
  );
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave }: {
  profile: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
}) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone_number: profile.phone_number || '',
    bio: profile.bio || '',
    role: profile.role || 'buyer',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    setError('');
    const { error: dbErr } = await supabase.from('profiles').update({
      full_name: form.full_name.trim(),
      phone_number: form.phone_number.trim(),
      bio: form.bio.trim(),
      role: form.role as any,
    }).eq('id', profile.id);
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onSave({ ...profile, ...form, role: form.role as any });
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <FormField label="Full Name" required>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 font-medium text-sm"
            />
          </FormField>

          <FormField label="Phone Number">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm pointer-events-none">+232</span>
              <input
                type="tel"
                value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                placeholder="76 000 000"
                className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 font-medium text-sm"
              />
            </div>
          </FormField>

          <FormField label="Role">
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 font-medium text-sm bg-white appearance-none"
            >
              <option value="buyer">Buyer / Renter</option>
              <option value="agent">Agent</option>
              <option value="service_provider">Service Provider</option>
            </select>
          </FormField>

          <FormField label="Bio">
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell people a bit about yourself..."
              rows={3}
              maxLength={280}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 text-sm resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 text-right mt-1">{form.bio.length}/280</p>
          </FormField>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 px-4 py-3 rounded-xl">
              <AlertTriangle size={15} /> {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Settings Sheet ─────────────────────────────────────────────────────────
function SettingsSheet({ onClose, onDeleteRequest, onSignOut }: {
  onClose: () => void;
  onDeleteRequest: () => void;
  onSignOut: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <SettingsRow icon={<ShieldCheck size={18} className="text-sky-500" />} label="Privacy & Security"
            description="Manage your data preferences" onClick={() => {}} />
          <SettingsRow icon={<FileText size={18} className="text-slate-400" />} label="Terms of Service"
            description="Read our terms" onClick={() => {}} />
          <SettingsRow icon={<User size={18} className="text-slate-400" />} label="Help & Support"
            description="Get help with your account" onClick={() => {}} />

          <div className="h-px bg-slate-100 my-2" />

          <SettingsRow icon={<LogOut size={18} className="text-amber-500" />} label="Sign Out"
            description="Log out of your account" onClick={onSignOut}
            labelClass="text-amber-600" />

          <SettingsRow icon={<Trash2 size={18} className="text-rose-500" />} label="Delete Account"
            description="Permanently remove your account" onClick={onDeleteRequest}
            labelClass="text-rose-600" />
        </div>
        <div className="h-4" />
      </div>
    </Overlay>
  );
}

function SettingsRow({ icon, label, description, onClick, labelClass }: {
  icon: React.ReactNode; label: string; description: string;
  onClick: () => void; labelClass?: string;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${labelClass ?? 'text-slate-800'}`}>{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}

// ── Delete Account Modal ───────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { setError('Please type DELETE to confirm.'); return; }
    setDeleting(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete profile data — cascade deletes listings & saved_listings
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out (account deletion from auth requires server-side admin call;
      // signing out prevents further access)
      await supabase.auth.signOut();
      onDeleted();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setDeleting(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Delete Account?</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            This will permanently delete your profile, all listings, and saved data. This action cannot be undone.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Type <span className="text-rose-500 font-black">DELETE</span> to confirm
            </p>
            <input
              type="text"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 font-mono text-sm text-center tracking-widest"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs text-center font-medium">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting || confirm !== 'DELETE'}
              className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ── Shared Helpers ─────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full flex items-end sm:items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}
