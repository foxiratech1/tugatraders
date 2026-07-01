import React from 'react';
import Image from 'next/image';
import { FiBell, FiMessageCircle, FiStar } from 'react-icons/fi';

const WhyJoinSection = () => {
  const features = [
    {
      icon: <FiBell className="text-[#6E9625]" size={24} />,
      title: "Manage your enquiries with ease",
      description: "Keep track of job details, organise clients requests, and receive instant notifications when new opportunities arrive."
    },
    {
      icon: <FiMessageCircle className="text-[#6E9625]" size={24} />,
      title: "Communicate directly with clients",
      description: "Connect with clients directly to discuss project details, timelines, and requirements for a smoother experience from start to finish."
    },
    {
      icon: <FiStar className="text-[#6E9625]" size={24} />,
      title: "Build your reputation over time",
      description: "Track completed work, highlight feedback from completed jobs, and strengthen your profile with trusted reviews from real clients."
    }
  ];

  return (
    <section className="bg-white py-16 lg:py-18 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

          {/* Left Column - Content */}
          <div className="flex flex-col gap-10 py-6">
            <div>
              <h2 className="text-[48px] lg:text-[56px] font-bold text-[#243A24] leading-[1.08] mb-5">
                Why <span className="text-[#6E9625]">join</span> <br />
                Tuga Trades?
              </h2>
              <div className="w-20 h-[3.5px] bg-[#6E9625]" />
            </div>

            <div className="flex flex-col gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#F3F4F6] flex items-center justify-center flex-shrink-0 transition-all group-hover:shadow-md">
                    {feature.icon}
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-[20px] font-bold text-[#243A24]">
                      {feature.title}
                    </h3>
                    <p className="text-[16px] text-[#6B7280] font-medium leading-relaxed max-w-[440px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative w-full overflow-hidden shadow-2xl rounded-[28px] min-h-[420px] lg:min-h-[620px] max-w-[540px] lg:ml-auto">
            <Image
              src="/couple.png"
              alt="Tradesperson talking to a homeowner"
              fill
              className="object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection;
