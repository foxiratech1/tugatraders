"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Bookmark, List, Map as MapIcon } from 'lucide-react';
import { authApi } from '@/app/api/authApi';

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return '/logo.png';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const ListingImage = ({ pro }: { pro: any }) => {
  const [error, setError] = useState(false);
  const src = getImageUrl(pro.profileImage || pro.logo || pro.image);

  return (
    <div className={`relative w-full h-full ${error ? 'bg-[#F3F4F6] flex items-center justify-center' : ''}`}>
      <Image
        src={error ? '/logo.png' : src}
        alt={pro.fullName || pro.companyName || pro.name || 'Trader'}
        fill
        className={error ? "object-contain p-8 opacity-60" : "object-cover"}
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const accessToken = data?.accessToken || data?.access_token || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        onSuccess(); // ← fires toggle-save API immediately
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#1C2C1C]/40 hover:bg-gray-100 hover:text-[#1C2C1C] transition-colors cursor-pointer text-lg"
        >
          ✕
        </button>

        {/* Bookmark icon */}
        <div className="w-12 h-12 rounded-full bg-[#F3F8EC] flex items-center justify-center mb-4">
          <Bookmark size={22} className="text-[#6E9625]" fill="#6E9625" />
        </div>

        <h3 className="text-[22px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Login to save
        </h3>
        <p className="text-[13px] text-[#1C2C1C]/55 font-medium mb-6">
          Please log in to save this professional to your list.
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors cursor-pointer"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] hover:bg-[#121E12] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {loading ? 'Logging in…' : 'Log In & Save'}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#1C2C1C]/50 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#6E9625] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};


const DirectoryListings = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // pending trader ID is persisted in localStorage across navigation
  // we keep a state for UI consistency (optional)
  const [pendingTraderId, setPendingTraderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await authApi.searchTraders();
        setProfessionals(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error('Failed to fetch professionals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const handleToggleSave = async (traderId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Store pending ID in state; modal will call handleLoginSuccess
      setPendingTraderId(traderId);
      setShowLoginModal(true);
      return;
    }
    // Optimistically toggle UI
    setProfessionals((prev) =>
      prev.map((pro) => (pro.id === traderId ? { ...pro, isSaved: !pro.isSaved } : pro))
    );
    try {
      await authApi.toggleSaveTrader(traderId);
    } catch (err) {
      console.error('Failed to toggle save', err);
      // Revert UI on error
      setProfessionals((prev) =>
        prev.map((pro) => (pro.id === traderId ? { ...pro, isSaved: !pro.isSaved } : pro))
      );
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    if (pendingTraderId) {
      // Optimistically update
      setProfessionals((prev) =>
        prev.map((pro) =>
          pro.id === pendingTraderId ? { ...pro, isSaved: true } : pro
        )
      );
      try {
        await authApi.toggleSaveTrader(pendingTraderId);
      } catch (err) {
        console.error("Failed to toggle save after login", err);
        setProfessionals((prev) =>
          prev.map((pro) =>
            pro.id === pendingTraderId ? { ...pro, isSaved: false } : pro
          )
        );
      }
      setPendingTraderId(null);
    }
  };

  return (
    <section className="bg-[#F9FAFB] py-10 sm:py-16 px-4 sm:px-6 lg:px-20 relative">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingTraderId(null); }}
        onSuccess={handleLoginSuccess}
      />
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-[24px] font-bold text-[#064E3B] mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
              42 Electricians in London
            </h2>
            <p className="text-[#6B7280] text-[14px]">Verified professionals matching your search.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex bg-[#F3F4F6] rounded-xl p-1">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${activeTab === 'list'
                  ? 'bg-white text-[#064E3B] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#243A24]'
                  }`}
              >
                <List size={18} />
                List
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${activeTab === 'map'
                  ? 'bg-white text-[#064E3B] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#243A24]'
                  }`}
              >
                <MapIcon size={18} />
                Map
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl text-[#064E3B] font-bold text-sm sm:text-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
              Top Rated
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <p>Loading professionals...</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <p>No professionals found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {professionals.map((pro) => (
              <div key={pro.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#F3F4F6] hover:shadow-md transition-shadow">
                {/* Image Section */}
                <div className="relative h-[200px] sm:h-[240px] w-full">
                  <ListingImage pro={pro} />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {(pro.vetted || pro.isVerified) && (
                      <span className="flex items-center gap-1 bg-[#6E9625] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Star size={10} fill="currentColor" />
                        Vetted
                      </span>
                    )}
                    {pro.insured && (
                      <span className="bg-[#243A24] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Insured
                      </span>
                    )}
                  </div>
                  {/* Bookmark */}
                  <button
                    onClick={() => handleToggleSave(pro.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors cursor-pointer"
                  >
                    <Bookmark 
                      size={16} 
                      fill={pro.isSaved ? "currentColor" : "none"} 
                      className={pro.isSaved ? "text-[#6E9625]" : "text-white"} 
                    />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-[#243A24] leading-tight truncate">{pro.fullName || pro.name}</h3>
                      <p className="text-[10px] font-extrabold text-[#6E9625] tracking-widest uppercase mt-0.5 truncate">{pro.companyName || pro.company || 'INDEPENDENT TRADER'}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#F7F9F6] px-2 py-1 rounded-lg flex-shrink-0">
                      <Star size={14} className="text-[#6E9625]" fill="currentColor" />
                      <span className="text-sm font-bold text-[#243A24]">{pro.ratingAvg ?? pro.averageRating ?? pro.rating ?? 'N/A'}</span>
                      <span className="text-[10px] text-[#6B7280]">({pro.reviewCount ?? pro.reviews ?? 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#6B7280] text-sm mb-4">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{pro.location || pro.city || 'Location unavailable'} {pro.distance ? `• ${pro.distance}` : ''}</span>
                  </div>

                  <p className="text-[#4B5563] text-sm leading-relaxed mb-6 line-clamp-2">
                    {pro.bio || pro.description || 'No description provided.'}
                  </p>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 px-4 rounded-xl border border-[#E5E7EB] text-[#243A24] font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer">
                      View Profile
                    </button>
                    <button className="flex-1 py-3 px-4 rounded-xl bg-[#243A24] text-white font-bold text-sm hover:bg-[#1a2b1a] transition-colors cursor-pointer">
                      Get Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Section */}
        <div className="flex justify-center mt-12">
          <button className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 border border-[#D1D5DB] rounded-xl text-[#4B5563] font-bold hover:bg-gray-50 transition-colors text-sm sm:text-base text-center cursor-pointer">
            Load More Professionals
          </button>
        </div>
      </div>
    </section>
  );
};

export default DirectoryListings;
