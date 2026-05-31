import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, MapPin, BadgeCheck, Phone, MessageCircle, Ruler, Bed, Bath, Clock, FileText, ShieldCheck, Star, X, Send, Loader as Loader2, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppContext } from '../App';
import { Listing, Rating } from '../types';
import { supabase } from '../lib/supabase';
import { openConversation } from './MessagesView';

export default function ListingDetailView({ listing }: { listing: Listing }) {
  const { setSelectedListing, setCurrentView } = useAppContext();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const phone = listing.profiles?.phone_number?.replace(/^232-?/, '') ?? '';
  const whatsappUrl = `https://wa.me/232${phone}?text=${encodeURIComponent(`Hi, I'm interested in your Easyfen listing: ${listing.title} (NLE ${price.toLocaleString()}). Is it still available?`)}`;
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) : 0;

  useEffect(() => {
    // Increment views
    supabase.rpc('increment_listing_views', { item_id: listing.id }).catch(() => {});

    // Fetch ratings and current user
    const init = async () => {
      const [{ data: ratingsData }, { data: { user } }] = await Promise.all([
        supabase.from('ratings').select('*, rater:profiles!ratings_rater_id_fkey(id, full_name, avatar_url)')
          .eq('listing_id', listing.id).order('created_at', { ascending: false }),
        supabase.auth.getUser(),
      ]);
      if (ratingsData) setRatings(ratingsData as any as Rating[]);
      if (user) {
        setCurrentUserId(user.id);
        setAlreadyRated(ratingsData?.some(r => r.rater_id === user.id) ?? false);
      }
    };
    init();
  }, [listing.id]);

  const handleStartChat = async () => {
    if (!currentUserId || !listing.user_id) return;
    if (currentUserId === listing.user_id) return;
    setStartingChat(true);
    const convId = await openConversation(listing.id, listing.user_id, currentUserId);
    setStartingChat(false);
    if (convId) {
      setSelectedListing(null);
      setCurrentView('messages');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const isOwnListing = currentUserId === listing.user_id;

  return (
    <div className="flex flex-col h-[100dvh] bg-white absolute inset-0 z-[100]">
      {/* Top Fixed Header */}
      <div className="absolute top-0 w-full z-20 flex justify-between p-4 pt-12 md:pt-6">
        <button onClick={() => setSelectedListing(null)}
          className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <button onClick={handleShare}
          className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-transform">
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        {/* Hero Carousel */}
        <div
          className="relative w-full max-h-[60vh] max-w-2xl mx-auto aspect-square md:aspect-[4/3] bg-slate-200 overflow-x-auto flex no-scrollbar snap-x snap-mandatory md:rounded-b-3xl md:mt-4 shadow-sm"
          onScroll={e => {
            const el = e.currentTarget;
            setActiveImageIndex(Math.round(el.scrollLeft / el.offsetWidth));
          }}
        >
          {(listing.images.length > 0 ? listing.images : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg']).map((img, idx) => (
            <img key={idx} src={img} alt={`${listing.title} ${idx + 1}`}
              className="w-full h-full object-cover shrink-0 snap-center" />
          ))}
          {listing.images.length > 1 && (
            <div className="absolute bottom-4 w-full flex justify-center gap-1.5 z-10 pointer-events-none">
              {listing.images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all bg-white shadow-sm ${idx === activeImageIndex ? 'w-4 opacity-100' : 'w-1.5 opacity-50'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-6 max-w-2xl mx-auto w-full">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-wider">
              {listing.listing_type}
            </span>
            {listing.category && (
              <span className="text-xs font-medium px-2 py-1 bg-sky-50 text-sky-700 rounded capitalize">
                {listing.category === 'rent' ? 'For Rent' : listing.category === 'buy' ? 'For Sale' : listing.category}
              </span>
            )}
            {listing.is_premium && (
              <span className="text-xs font-bold px-2 py-1 bg-amber-400 text-white rounded uppercase tracking-wider">Premium</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{listing.title}</h1>

          <div className="flex items-center text-slate-500 mb-6">
            <MapPin size={16} className="mr-1.5 text-sky-500" />
            <span className="text-sm font-medium">{listing.location_name}</span>
          </div>

          {/* Price + Rating summary */}
          <div className="bg-sky-50 rounded-2xl p-5 mb-8 flex items-end justify-between border border-sky-100/50">
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                {listing.listing_type === 'property' ? 'Asking Price' : 'Service Rate'}
              </p>
              <p className="text-3xl font-black text-sky-600 tracking-tight">
                NLE {price.toLocaleString()}
                {listing.rate_type === 'hourly' && <span className="text-lg font-bold text-sky-400"> / hr</span>}
              </p>
            </div>
            {ratings.length > 0 && (
              <button onClick={() => document.getElementById('ratings-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 text-amber-500">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                <span className="font-black text-slate-800 text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-medium">({ratings.length})</span>
              </button>
            )}
          </div>

          {/* Attributes */}
          <h3 className="text-lg font-bold text-slate-900 mb-4">Details</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {listing.listing_type === 'property' ? (
              <>
                {listing.bedrooms && <AttributeCard icon={<Bed size={18} />} label="Bedrooms" value={listing.bedrooms} />}
                {listing.bathrooms && <AttributeCard icon={<Bath size={18} />} label="Bathrooms" value={listing.bathrooms} />}
                {listing.land_size && <AttributeCard icon={<Ruler size={18} />} label="Land Size" value={listing.land_size} />}
              </>
            ) : (
              <>
                {listing.years_experience != null && <AttributeCard icon={<Clock size={18} />} label="Experience" value={`${listing.years_experience} Years`} />}
                {listing.license_number && <AttributeCard icon={<FileText size={18} />} label="License" value={listing.license_number} />}
              </>
            )}
          </div>

          {/* Description */}
          <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-8 whitespace-pre-wrap">{listing.description}</p>

          {/* Listed By */}
          <h3 className="text-lg font-bold text-slate-900 mb-4">Listed By</h3>
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden mb-8">
            <div className="p-5 flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-sky-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl font-black text-sky-600">
                  {listing.profiles?.avatar_url
                    ? <img src={listing.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    : (listing.profiles?.full_name?.charAt(0) ?? '?')}
                </div>
                {listing.profiles?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <BadgeCheck size={20} className="text-sky-500 fill-sky-100" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">
                  {listing.profiles?.full_name ?? 'Unknown'}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex-wrap">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                    {listing.profiles?.role?.replace('_', ' ') ?? 'Agent'}
                  </span>
                  {listing.profiles?.is_verified
                    ? <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>
                    : <span className="text-slate-400">Not verified</span>}
                </div>
                {(listing.profiles?.bio as string) && (
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{listing.profiles?.bio as string}</p>
                )}
              </div>
            </div>
            {/* Request Verification CTA (own profile only) */}
            {isOwnListing && !listing.profiles?.is_verified && (
              <div className="px-5 py-3 bg-sky-50 border-t border-sky-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-sky-700 flex items-center gap-1.5">
                  <BadgeCheck size={14} /> Get verified to build trust
                </p>
                <button onClick={() => setShowVerifyModal(true)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  Apply <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Ratings Section */}
          <div id="ratings-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Reviews {ratings.length > 0 && <span className="text-slate-400 font-normal text-base">({ratings.length})</span>}
              </h3>
              {!isOwnListing && !alreadyRated && currentUserId && (
                <button onClick={() => setShowRatingModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-sm font-bold hover:bg-amber-100 transition-colors border border-amber-100">
                  <Star size={14} /> Rate
                </button>
              )}
            </div>

            {ratings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl mb-8">
                <Star size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {/* Avg summary */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-800">{avgRating.toFixed(1)}</p>
                    <StarRow stars={avgRating} size={14} />
                    <p className="text-xs text-slate-400 mt-1">{ratings.length} review{ratings.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(s => {
                      const count = ratings.filter(r => r.stars === s).length;
                      const pct = ratings.length ? (count / ratings.length) * 100 : 0;
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3">{s}</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {ratings.map(r => <RatingCard key={r.id} rating={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 pb-8 flex justify-center">
        <div className="flex gap-3 w-full max-w-2xl">
          {isOwnListing ? (
            <div className="flex-1 bg-slate-100 rounded-xl h-14 flex items-center justify-center text-slate-500 font-bold text-sm">
              Your listing
            </div>
          ) : (
            <>
              {/* In-app message */}
              <button onClick={handleStartChat} disabled={startingChat}
                className="flex-1 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xl shadow-sky-500/30 rounded-xl h-14 flex items-center justify-center font-bold text-base transition-colors gap-2 disabled:opacity-60">
                {startingChat ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
                Message
              </button>
              {/* WhatsApp fallback */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold active:scale-95 transition-all"
                title="WhatsApp">
                <Phone size={22} />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && listing.user_id && currentUserId && (
        <RatingModal
          listingId={listing.id}
          ratedUserId={listing.user_id}
          raterId={currentUserId}
          onClose={() => setShowRatingModal(false)}
          onSubmitted={(r) => {
            setRatings(prev => [r, ...prev]);
            setAlreadyRated(true);
            setShowRatingModal(false);
          }}
        />
      )}

      {/* Verification Modal */}
      {showVerifyModal && (
        <VerificationModal onClose={() => setShowVerifyModal(false)} />
      )}
    </div>
  );
}

// ── Star Display ───────────────────────────────────────────────────────────
function StarRow({ stars, size = 16 }: { stars: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(stars) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
}

// ── Rating Card ────────────────────────────────────────────────────────────
function RatingCard({ rating: r }: { rating: Rating }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center shrink-0 text-sky-600 font-black text-sm">
          {(r.rater as any)?.avatar_url
            ? <img src={(r.rater as any).avatar_url} className="w-full h-full object-cover" alt="" />
            : ((r.rater as any)?.full_name?.charAt(0) ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-slate-800 text-sm">{(r.rater as any)?.full_name ?? 'User'}</p>
            <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
          </div>
          <StarRow stars={r.stars} size={13} />
          {r.comment && <p className="text-slate-600 text-sm mt-2 leading-relaxed">{r.comment}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Rating Modal ───────────────────────────────────────────────────────────
function RatingModal({ listingId, ratedUserId, raterId, onClose, onSubmitted }: {
  listingId: string;
  ratedUserId: string;
  raterId: string;
  onClose: () => void;
  onSubmitted: (r: Rating) => void;
}) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (stars === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    const { data, error: dbErr } = await supabase.from('ratings').insert({
      listing_id: listingId,
      rater_id: raterId,
      rated_user_id: ratedUserId,
      stars,
      comment: comment.trim(),
    }).select('*, rater:profiles!ratings_rater_id_fkey(id, full_name, avatar_url)').maybeSingle();
    setSubmitting(false);
    if (dbErr) { setError(dbErr.message); return; }
    if (data) onSubmitted(data as any as Rating);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Leave a Review</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-center gap-3">
            {[1,2,3,4,5].map(n => (
              <button key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStars(n)}
                className="transition-transform active:scale-90">
                <Star size={36}
                  className={`transition-colors ${n <= (hovered || stars) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/30 text-slate-800 text-sm resize-none" />
          {error && <p className="text-rose-500 text-xs font-medium flex items-center gap-1"><AlertTriangle size={13} /> {error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={submit} disabled={submitting || stars === 0}
            className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Verification Modal ─────────────────────────────────────────────────────
function VerificationModal({ onClose }: { onClose: () => void }) {
  const [idType, setIdType] = useState('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!idNumber.trim()) { setError('Please enter your ID number.'); return; }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated.'); setSubmitting(false); return; }
    const { error: dbErr } = await supabase.from('verification_requests').upsert({
      user_id: user.id,
      id_type: idType,
      id_number: idNumber.trim(),
      status: 'pending',
    }, { onConflict: 'user_id' });
    setSubmitting(false);
    if (dbErr) { setError(dbErr.message); return; }
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Request Verification</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Request Submitted</h3>
            <p className="text-slate-500 text-sm">Our team will review your ID and update your badge within 24 hours.</p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-colors">Done</button>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-4">
              <p className="text-slate-500 text-sm leading-relaxed">
                Submit a government-issued ID to get the verified badge on your profile, building trust with buyers.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ID Type</label>
                <select value={idType} onChange={e => setIdType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white">
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ID Number</label>
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/30" />
              </div>
              {error && <p className="text-rose-500 text-xs font-medium flex items-center gap-1"><AlertTriangle size={13} /> {error}</p>}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={submit} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AttributeCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</p>
        <p className="font-semibold text-slate-800 text-sm">{value}</p>
      </div>
    </div>
  );
}
