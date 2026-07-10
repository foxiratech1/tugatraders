"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { Search, Plus, Minus } from 'lucide-react';
import TraderPeopleCTA from "./TraderPeopleCTA";
import WorkmanCTA from "./WorkmanCTA";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/app/api/authApi";

// Dummy FAQs have been removed. Using API responses exclusively.

const FaqContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'customers' | 'traders'>('customers');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0]); // First one open by default

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await authApi.getPublicFaqs();
        if (res && res.data) {
          setFaqs(res.data);
        } else if (Array.isArray(res)) {
          setFaqs(res);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    setActiveTab(
      searchParams.get("tab") === "traders"
        ? "traders"
        : "customers"
    );
  }, [searchParams]);

  useEffect(() => {
    setExpandedIndices([0]);
  }, [activeTab, faqs]);

  const toggleAccordion = (index: number) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter(i => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  // Filter and fallback
  const activeFaqsList = faqs.filter(faq => faq.isActive !== false);

  const apiClientFaqs = activeFaqsList.filter(faq => faq.audience === "CUSTOMER" || faq.audience === "BOTH");
  const apiTraderFaqs = activeFaqsList.filter(faq => faq.audience === "TRADER" || faq.audience === "BOTH");

  const finalClientFaqs = apiClientFaqs;
  const finalTraderFaqs = apiTraderFaqs;

  const activeFaqs = activeTab === 'customers' ? finalClientFaqs : finalTraderFaqs;

  const filteredFaqs = activeFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Divide filtered FAQs into two columns
  const half = Math.ceil(filteredFaqs.length / 2);
  const leftColumn = filteredFaqs.slice(0, half);
  const rightColumn = filteredFaqs.slice(half);

  return (
    <section className="bg-[#FAFAF9] pb-16 px-6 lg:px-20 relative">
      <div className="max-w-[1200px] mx-auto w-full">

        {/* Floating Search Bar */}
        <div className="max-w-[720px] mx-auto w-full mb-16 -translate-y-8 relative z-20">
          <div className="relative shadow-[0_8px_30px_rgba(36,58,36,0.06)] rounded-[24px] bg-[#FFFFFF] border border-[#243A241F]/10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search size={20} className="text-[#555555]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, topics, or help articles..."
              className="w-full pl-12 pr-5 py-4 rounded-[16px] text-[15px] text-[#55555566] placeholder-[#55555566] outline-none font-medium"
            />
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-white border border-[#243A241F] rounded-full p-1 shadow-sm">
            <button
              onClick={() => { setActiveTab('customers'); setSearchQuery(''); }}
              className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${activeTab === 'customers'
                ? 'bg-[#243A24] text-white shadow-sm'
                : 'text-[#243A24] hover:text-[#243A24]/70'
                }`}
            >
              Customers
            </button>
            <button
              onClick={() => { setActiveTab('traders'); setSearchQuery(''); }}
              className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${activeTab === 'traders'
                ? 'bg-[#243A24] text-white shadow-sm'
                : 'text-[#243A24] hover:text-[#243A24]/70'
                }`}
            >
              Traders
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-8 max-w-[540px]">
          <h2
            className="text-[26px] md:text-[32px] font-bold text-[#243A24] mb-2"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            {activeTab === 'customers' ? 'Customers' : 'Traders'}
          </h2>
          {/* <p className="text-[#243A24] text-[13px] md:text-[14px] leading-relaxed font-medium">
            {activeTab === 'customers'
              ? 'Find the right professional with confidence. Everything you need to know about posting a job, receiving quotes, and working with top-rated traders.'
              : 'Everything you need to know about joining TugaTrades, receiving leads, and growing your business on the platform.'}
          </p> */}
        </div>

        {/* State Handling */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#243A24]">
            <p className="text-[18px] font-bold animate-pulse" style={{ fontFamily: 'var(--font-bricolage)' }}>Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#555555]">
            <p className="text-[18px] font-medium text-center">No FAQs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {leftColumn.map((faq, index) => {
                const actualIndex = index;
                const isOpen = expandedIndices.includes(actualIndex);
                return (
                  <div
                    key={actualIndex}
                    className="bg-white border border-[#243A241F] rounded-[16px] p-6 transition-all duration-200 hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleAccordion(actualIndex)}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-[18px] font-bold text-[#243A24]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                        {faq.question}
                      </span>
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center">
                        {isOpen ? (
                          <Minus size={16} className="text-[#6E9625]" />
                        ) : (
                          <Plus size={16} className="text-[#555555]" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="text-[16px] text-[#555555] mt-4 font-medium leading-relaxed animate-fade-in">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              {rightColumn.map((faq, index) => {
                const actualIndex = half + index;
                const isOpen = expandedIndices.includes(actualIndex);
                return (
                  <div
                    key={actualIndex}
                    className="bg-white border border-[#243A241F] rounded-[16px] p-6 transition-all duration-200 hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleAccordion(actualIndex)}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-[18px] font-bold text-[#243A24]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                        {faq.question}
                      </span>
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center">
                        {isOpen ? (
                          <Minus size={16} className="text-[#6E9625]" />
                        ) : (
                          <Plus size={16} className="text-[#555555]" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="text-[16px] text-[#555555] mt-4 font-medium leading-relaxed animate-fade-in">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Support Card - Displayed Regardless of Loading/Empty State */}
        {!loading && (
          <div className="bg-[#6E96250D] border border-[#6E962533] rounded-[16px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-10">
            <div>
              <h4 className="text-[18px] font-bold text-[#6E9625] mb-1" style={{ fontFamily: 'var(--font-bricolage)' }}>
                Need more help?
              </h4>
              <p className="text-[14px] text-[#6E9625CC] font-medium">
                Can't find what you're looking for?
              </p>
            </div>
            <Link
              href="/contact"
              className="bg-[#243A24] hover:bg-[#1a2b1a] text-white text-[13px] font-bold py-2.5 px-6 rounded-[8px] transition-all whitespace-nowrap text-center w-full sm:w-auto"
            >
              Contact Support
            </Link>
          </div>
        )}

      </div>

      {/* CTA Section */}
      <div className="mt-16">
        {activeTab === "customers" ? (
          <TraderPeopleCTA />
        ) : (
          <WorkmanCTA />
        )}
      </div>
    </section>
  );
};

export default FaqContent;
