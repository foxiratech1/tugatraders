import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, Star, Check } from "lucide-react";

const JoinNetworkSection = () => {
  const benefitsLeft = [
    {
      bold: "Exclusive membership",
      text: " – Join a select network of professionals",
    },
    {
      bold: "Personal company profile",
      text: " – Highlight your skills and experience.",
    },
    {
      bold: "Job portfolio",
      text: " – Display images & videos of your completed work.",
    },
    {
      bold: "Quality leads",
      text: " – Receive high-quality enquiries from clients across Portugal.",
    },
    {
      bold: "Flexible membership options",
      text: " – Monthly/yearly with 3 months free.",
    },
  ];

  const benefitsRight = [
    {
      bold: "No commission fees",
      text: " – Never pay for the leads you receive.",
    },
    {
      bold: "Client reviews",
      text: " – Showcase genuine feedback from past verified clients.",
    },
    {
      bold: "Be found on Google",
      text: " – Boost your visibility and get discovered by more clients online.",
    },
    {
      bold: "Flexible subscription tiers",
      text: " – Choose from Bronze, Silver, or Gold plans.",
    },
  ];

  return (
    <section className="py-20 px-4 font-sans bg-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-[28px] sm:text-[32px] lg:text-[38px] font-bold text-[#0A2619] leading-[1.3]">
            Join a Professional Network Built for
            <br />
            <span className="text-[#6E9625] " style={{ fontFamily: "var(--font-bricolage), Georgia, serif" }}>
              Tradespeople
            </span>{" "}
            in Portugal
          </h2>
        </div>

        {/* Three Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Card 1 — Expand Your Business Locally */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-[16px] p-7 flex flex-col">
            <div className="w-10 h-10 rounded-[12px] bg-[#6FAE7C1A] flex items-center justify-center mb-6">
              <MapPin className="w-[18px] h-[18px] text-[#6E9625]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#243A24] mb-3 leading-snug">
              Expand Your Business Locally
            </h3>
            <p className="text-[16px] text-[#4B5563] leading-[1.7] mb-6 flex-1">
              Connect directly with homeowners looking for vetted local professionals to
              get the job done. We bring the opportunities to you.
            </p>
            <div className="relative w-full h-[160px] rounded-xl overflow-hidden">
              <Image
                src="/location.png"
                alt="Map showing local business locations"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Card 2 — Let Your Jobs Come To You */}
          <div className="bg-[#FFFFFF] border border-[#6FAE7C4D] rounded-[16px] p-7 flex flex-col">
            <div className="w-10 h-10 rounded-[12px]  bg-[#6FAE7C1A] flex items-center justify-center mb-6">
              <Briefcase className="w-[18px] h-[18px] text-[#6E9625]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#243A24] mb-3 leading-snug">
              Let Your Jobs Come To You
            </h3>
            <p className="text-[16px] text-[#4B5563] leading-[1.7] mb-6 flex-1">
              Whilst your profile is listed on our directory for easy discovery you can also
              review job requests posted by clients, from urgent repairs to planned works and
              submit quotes for jobs that match your availability.
            </p>
            <div className="relative w-full h-[160px] rounded-xl overflow-hidden">
              <Image
                src="/image1.png"
                alt="Professional working on a project"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Card 3 — Build Credibility With Verified Reviews */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-7 flex flex-col">
            <div className="w-10 h-10 rounded-[12px] bg-[#6FAE7C1A] flex items-center justify-center mb-6">
              <Star className="w-[18px] h-[18px] text-[#6E9625] fill-[#4A7A1A]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#243A24] mb-3 leading-snug">
              Build Credibility With Verified Reviews
            </h3>
            <p className="text-[16px] text-[#4B5563] leading-[1.7] mb-6 flex-1">
              Showcase your skills on our reputable directory and gain trust through genuine
              verified client feedback.
            </p>

            {/* Mini Review Card */}
            <div className="bg-white  rounded-xl p-5">
              {/* Avatar + Info Row */}
              <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/Contact Support.png"
                    alt="Ricardo Costa"
                    fill
                    className="object-cover"
                    sizes="50px"
                  />
                </div>

                {/* Stars + Name */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-[2px]">
                    <div className="flex gap-[2px]">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-[#6E9625] fill-[#6E9625]"
                        />
                      ))}
                      <Star className="w-3.5 h-3.5 text-[#6E9625]" />
                    </div>
                    {/* Green quote icon */}
                    <span className="text-[#6E9625] text-[22px] font-serif leading-none ml-auto">&ldquo;&rdquo;</span>
                  </div>
                  <p className="text-[10px] text-[#0A2619]/50 tracking-[1.5px] uppercase mb-[2px]">
                    Carpenter · Faro
                  </p>
                  <p className="text-[14px] font-bold text-[#0A2619]">
                    Ricardo Costa
                  </p>
                </div>
              </div>

              {/* Testimonial */}
              <p className="text-[12.5px] text-[#0A2619]/60 leading-[1.6] italic">
                &ldquo;Excellent craftsmanship. Ricardo built a custom bookshelf
                for our office and it looks beautiful. Very tidy work and
                respectful of our space.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-[#F5F7F3] rounded-2xl px-6 py-8 sm:px-10 sm:py-12 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-6">
            {/* Left column */}
            <div className="space-y-6">
              {benefitsLeft.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#4A7A1A] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[16px] text-[#4B5563] leading-[1.6]">
                    <span className="font-bold text-[#243A24]">{item.bold}</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {benefitsRight.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#4A7A1A] flex items-center justify-center flex-shrink-0 mt-[2px]">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[16px] text-[#4B5563] leading-[1.6]">
                    <span className="font-bold text-[#243A24]">{item.bold}</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/auth/trader-signup">
            <button className="bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-[15px] sm:text-[16px] px-8 sm:px-12 py-3.5 sm:py-4 rounded-lg transition-colors shadow-md cursor-pointer w-full sm:w-auto">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JoinNetworkSection;
