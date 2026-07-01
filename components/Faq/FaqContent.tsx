"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { Search, Plus, Minus } from 'lucide-react';
import TraderPeopleCTA from "./TraderPeopleCTA";
import WorkmanCTA from "./WorkmanCTA";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/app/api/authApi";

const clientFaqs = [
  {
    question: "How does TugaTrades work?",
    answer: "TugaTrades makes it simple to find the right professional for your job. You can either browse our directory of trusted local traders or post your job and receive tailored quotes. Compare profiles, read verified reviews, and connect directly with the professional that best fits your needs."
  },
  {
    question: "How do I post a job and receive quotes?",
    answer: "Submit your job details, including your requirements and location, and we’ll notify relevant traders in your area. Interested professionals will respond with quotes, giving you the flexibility to compare options and choose with confidence."
  },
  {
    question: "Can I search for traders instead of posting a job?",
    answer: "Yes. If you prefer, you can explore our directory to find and contact traders directly. Review their profiles, past work, and client feedback before reaching out."
  },
  {
    question: "How are traders vetted?",
    answer: "We carefully review every trader application, including their experience and business information, before they are approved. Ongoing client reviews also help us maintain a high standard across the platform. A vetted trader is based on submitted documents and does not guarantee quality or reliability."
  },
  {
    question: "How do I choose the right trader?",
    answer: "We recommend comparing profiles, reviewing client feedback, and exploring previous work. Look for professionals with relevant experience, strong ratings, and clear communication to ensure the best fit for your project."
  },
  {
    question: "How many traders will contact me and how quickly?",
    answer: "You’ll typically hear from up to three relevant traders, ensuring high-quality responses without being overwhelmed. Most customers begin receiving replies within a short time, depending on the job type and availability in their area."
  },
  {
    question: "Are quotes free and without obligation?",
    answer: "Yes, posting a job and receiving quotes is completely free, with no obligation to hire."
  },
  {
    question: "Is there a fee to use TugaTrades?",
    answer: "No, searching for traders, posting jobs, and connecting with professionals is entirely free for customers."
  },
  {
    question: "Is my contact information shared publicly?",
    answer: "No, your details remain private and are only shared with traders when you choose to engage with them."
  },
  {
    question: "Do I need an account to leave a review?",
    answer: "Yes, creating an account ensures all reviews are genuine and based on real experiences, helping maintain trust and transparency across the platform."
  },
  {
    question: "What happens if I'm not satisfied with the work?",
    answer: "We recommend discussing any concerns directly with your trader first, as most issues can be resolved quickly. You can also leave a review to share your experience and help others make informed decisions."
  },
  {
    question: "Is TugaTrades involved in the work itself?",
    answer: "TugaTrades connects you with trusted professionals, but all agreements, pricing, and work are handled directly between you and the trader."
  },
  {
    question: "How can I get the best results?",
    answer: "Provide clear, detailed information when posting your job, including photos, timelines, and specific requirements. This helps traders give accurate quotes and improves your chances of finding the right match quickly."
  }
];

const traderFaqs = [
  {
    question: "How does TugaTrades work?",
    answer: "TugaTrades helps you connect with clients actively looking for your services. Create a professional profile, showcase your experience, and get discovered through our directory. You’ll also receive relevant job enquiries, allowing you to connect directly with clients and secure more work."
  },
  {
    question: "How do I join TugaTrades?",
    answer: "Getting started is simple. Sign up, build your profile, and submit your details for approval. Once approved, your profile goes live and you can start receiving enquiries from local clients."
  },
  {
    question: "Is there a fee to use TugaTrades?",
    answer: "Yes, TugaTrades operates on a subscription basis, giving you access to client enquiries, directory visibility, and growth tools. Plans start from €14.99/month VAT included (where applicable), with higher tiers offering increased exposure and additional features. Enjoy your first 3 months free to get started. For more info click here."
  },
  {
    question: "How is my business promoted?",
    answer: "Your profile is showcased to clients searching for your services in your area. With your experience, services, and client reviews on display, you’re positioned to stand out and win more work."
  },
  {
    question: "How do I get more enquiries?",
    answer: "Maximise your chances by keeping your profile complete and up to date, adding high-quality photos of your work, responding quickly to enquiries, and consistently building positive client reviews."
  },
  {
    question: "What happens if I receive a negative review?",
    answer: "You’ll have the opportunity to respond and share your perspective. We also monitor reviews to ensure they remain fair, genuine, and reflective of real experiences."
  },
  {
    question: "Can I update my profile?",
    answer: "Yes, you can edit your profile at any time to reflect your latest work, services, and business details—helping you stay competitive and relevant. Changes to your trade category or subcategory must be requested through our support team."
  },
  {
    question: "How can I stand out from other traders?",
    answer: "A detailed profile, strong client reviews, and a proven track record of quality work will help you build trust and attract more clients."
  },
  {
    question: "Can I deactivate my account?",
    answer: "Yes. If you no longer wish to use the platform, you can deactivate your account at any time. If you decide to return in the future, you can contact support for assistance with reactivating your account."
  },
  {
    question: "How do I update my profile or service area?",
    answer: "You can update all of your profile details, including your trade, bio, photos, and service area, directly from your trader dashboard at any time."
  }
];

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

  const finalClientFaqs = apiClientFaqs.length > 0 ? apiClientFaqs : clientFaqs;
  const finalTraderFaqs = apiTraderFaqs.length > 0 ? apiTraderFaqs : traderFaqs;

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

        {/* FAQs Grid Layout */}
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

            {/* Support Card */}
            <div className="bg-[#6E96250D] border border-[#6E962533] rounded-[16px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-2">
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
          </div>

        </div>

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
