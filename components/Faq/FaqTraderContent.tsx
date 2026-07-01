"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { authApi } from "@/app/api/authApi";

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
  }
];

const FaqTraderContent = () => {
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
    setExpandedIndices([0]);
  }, [faqs]);

  const toggleAccordion = (index: number) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter(i => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  // Filter and fallback
  const activeFaqsList = faqs.filter(faq => faq.isActive !== false);
  const apiTraderFaqs = activeFaqsList.filter(faq => faq.audience === "TRADER" || faq.audience === "BOTH");
  const finalTraderFaqs = apiTraderFaqs.length > 0 ? apiTraderFaqs : traderFaqs;

  // Divide FAQs into two columns
  const half = Math.ceil(finalTraderFaqs.length / 2);
  const leftColumn = finalTraderFaqs.slice(0, half);
  const rightColumn = finalTraderFaqs.slice(half);

  return (
    <section className="bg-[#FAFAF9] pb-24 px-6 lg:px-20 relative">
      <div className="max-w-[1200px] mx-auto w-full">

        {/* Section Heading */}
        <div className="mb-10 max-w-[747px]">
          <h2
            className="text-[28px] md:text-[36px] font-bold text-[#243A24] mb-3"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            For Traders
          </h2>
          <p className="text-[#555555] text-[14px] md:text-[15px] leading-relaxed font-medium">
            Grow your business and win more work.<br />
            Learn how to get discovered, build your reputation, and manage your quotes efficiently.
          </p>
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

            {/* Trader Support Card */}
            <div className="bg-[#E5FFB433] border border-[#6E9625] rounded-[16px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-2">
              <div>
                <h4 className="text-[16px] font-bold text-[#6E9625] mb-1" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  Get in touch with our team for any assistance.
                </h4>
                <p className="text-[14px] text-[#6E9625] font-medium">
                  Speak to our Trader Support team.
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
    </section>
  );
};

export default FaqTraderContent;
