"use client";

import React, { useState, useRef } from 'react';
import { useSearchParams } from "next/navigation";
import { FileText, Shield, Cookie, MessageSquareWarning, AlertTriangle } from 'lucide-react';
import CookieSettingsContent from './CookieSettingsContent';
import TermsContent from './TermsContent';
import CookiesContent from './CookiesContent';
import TrustSafetyContent from './TrustSafetyContent';
import DisputeContent from './DisputeContent';
import ContentModerationContent from './ContentModerationContent';
import ReviewPolicyContent from './ReviewPolicyContent';
import TraderAgreementContent from './TraderAgreementContent';

export default function TermsLayout() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as string) ?? 'terms';
  const [activeTab, setActiveTab] = useState(initialTab);
  const contentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Map of tab keys to their display titles
  const titles: Record<string, string> = {
    terms: 'Terms & Conditions',
    cookies: 'Privacy & Cookie policy',
    trust: 'Trust & Safety',
    review: 'Review Policy',
    moderation: 'Content Moderation',
    cookieSettings: 'Cookie Settings',
    disputes: 'Disputes',
    traderAgreement: 'Trader Agreement',
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF]">

      {/* Hero Section */}
      <div className="relative w-full h-[320px] md:h-[433px] flex flex-col justify-center px-6 lg:px-20 overflow-hidden">
        {/* Background Image */}
        <img
          src="/legalimage.jfif"
          alt="Terms & Conditions"
          className="object-cover w-full h-full absolute inset-0"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: '#243A24CF',
            // backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)'
          }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto w-full">
          <h1 className="text-white text-[42px] md:text-[56px] font-bold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {titles[activeTab]}
          </h1>
          <p className="text-white/80 text-[15px] md:text-[18px]">
            Need help or have a question? Get in touch with our team.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div ref={contentRef} className="max-w-[1297px] mx-auto px-6 lg:px-20 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar */}
          <div className="lg:w-[260px] shrink-0 lg:sticky lg:top-10 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <h3 className="text-[18px] font-[800] text-[#243A24] mb-4">Legal Information</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTabChange('terms')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'terms' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'terms' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}>
                  <FileText size={activeTab === 'terms' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Terms & Conditions</span>
              </button>

              <button
                onClick={() => handleTabChange('cookies')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'cookies' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'cookies' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}>
                  <Cookie size={activeTab === 'cookies' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Privacy & Cookie policy</span>
              </button>

              {/* Disputes Tab */}
              <button
                onClick={() => handleTabChange('disputes')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'disputes' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'disputes' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}
                >
                  <AlertTriangle size={activeTab === 'disputes' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Disputes</span>
              </button>

              {/* Cookie Settings Tab */}
              <button
                onClick={() => handleTabChange('cookieSettings')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'cookieSettings' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'cookieSettings' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}>
                  <Cookie size={activeTab === 'cookieSettings' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Cookie Settings</span>
              </button>

              <button
                onClick={() => handleTabChange('trust')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'trust' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'trust' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}>
                  <Shield size={activeTab === 'trust' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Trust & Safety</span>
              </button>

              <button
                onClick={() => handleTabChange('review')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'review' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center ${activeTab === 'review' ? '' : 'w-6 h-6 rounded-full bg-[#111111]'}`}>
                  <MessageSquareWarning size={activeTab === 'review' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Review Policy</span>
              </button>

              <button
                onClick={() => handleTabChange('moderation')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'moderation' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${activeTab === 'moderation' ? '' : 'bg-[#111111]'}`}>
                  <AlertTriangle size={activeTab === 'moderation' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Content Moderation</span>
              </button>

              <button
                onClick={() => handleTabChange('traderAgreement')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-left transition-all ${activeTab === 'traderAgreement' ? 'bg-[#243A24] text-white font-medium' : 'bg-transparent text-[#555555] hover:bg-black/5 font-medium'}`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${activeTab === 'traderAgreement' ? '' : 'bg-[#111111]'}`}>
                  <FileText size={activeTab === 'traderAgreement' ? 18 : 12} className="text-white" />
                </div>
                <span className="text-[14px]">Trader Agreement</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'terms' && <TermsContent />}
            {activeTab === 'cookies' && <CookiesContent />}
            {activeTab === 'trust' && <TrustSafetyContent />}
            {activeTab === 'review' && <ReviewPolicyContent />}
            {activeTab === 'moderation' && <ContentModerationContent />}
            {activeTab === 'disputes' && <DisputeContent />}
            {activeTab === 'cookieSettings' && <CookieSettingsContent onNavigateTab={handleTabChange} />}
            {activeTab === 'traderAgreement' && <TraderAgreementContent />}
          </div>

        </div>
      </div>
    </main>
  );
}
