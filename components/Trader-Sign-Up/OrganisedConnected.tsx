import React from 'react';
import Image from 'next/image';
import { ListTodo, MessageSquare, TrendingUp, Target, Zap, Users } from 'lucide-react';

const OrganisedConnected = () => {
  const leftFeatures = [
    {
      Icon: ListTodo,
      title: "Manage leads with ease",
      description: "Add job details, track tasks, and get instant notifications for new enquiries."
    },
    {
      Icon: MessageSquare,
      title: "Communicate seamlessly",
      description: "Connect directly with clients to discuss requirements and keep projects moving smoothly."
    },
    {
      Icon: TrendingUp,
      title: "Track your progress",
      description: "Keep a record of completed work and collect feedback to strengthen your reputation."
    }
  ];

  const floatingCards = [
    {
      Icon: Target,
      title: "Flexible Location",
      description: "Set your service areas - get matched with jobs that suit your location.",
      position: "top-[-40px] left-[-60px]",
      iconBg: "bg-[#F3F7F2]",
      iconColor: "text-[#6E9625]"
    },
    {
      Icon: Zap,
      title: "Endless Opportunities",
      description: "Access to a wide range of jobs, secure the right job for your business.",
      position: "bottom-[-20px] left-[-80px]",
      iconBg: "bg-[#FFF9F2]",
      iconColor: "text-[#F59E0B]"
    },
    {
      Icon: Users,
      title: "Reliable Connections",
      description: "Connect with genuine clients and build your reputation through trusted reviews.",
      position: "bottom-[40px] right-[-60px]",
      iconBg: "bg-[#F2F6FF]",
      iconColor: "text-[#3B82F6]"
    }
  ];

  return (
    <section className="bg-[#F9FAFB] pt-20 sm:pt-24 lg:pt-28 pb-20 lg:pb-28 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-16 items-center">

          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-7 sm:gap-8">
            <h2 className="text-[30px] sm:text-[38px] xl:text-[48px] font-bold text-[#243A24] leading-[1.08] tracking-tight" style={{ fontFamily: "var(--font-bricolage)" }}>
              Stay organised and <br className="hidden sm:block" />
              connected.
            </h2>

            <div className="flex flex-col gap-6 sm:gap-7">
              {leftFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 sm:gap-5 xl:gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-[#6FAE7C33] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#6E9625]/10">
                    <feature.Icon size={22} className="text-[#6E9625]" />
                  </div>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <h3 className="text-[17px] sm:text-[18.5px] font-bold text-[#1F3D2B]">
                      {feature.title}
                    </h3>
                    <p className="text-[13.5px] sm:text-[14.5px] text-[#4B5563] font-medium leading-relaxed max-w-[440px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image with Floating Cards (sized in line with text) */}
          <div className="relative flex justify-center mt-10 xl:mt-0 w-full">
            {/* Main Image Container - scaled to match text height */}
            <div className="relative w-full max-w-[280px] sm:max-w-[330px] xl:max-w-[360px] aspect-[1/1.22] rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-xl">
              <Image
                src="/image.png"
                alt="Organised and Connected"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating Cards */}
            {/* Flexible Location - Top Left */}
            <div className="flex absolute top-[6%] xl:top-[8%] left-[-10px] sm:left-[-25px] xl:left-[-40px] flex-col justify-center bg-white/95 xl:bg-white p-3 xl:p-4 rounded-[16px] xl:rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-[170px] sm:w-[195px] xl:w-[220px] h-auto z-20 border border-[#E5E5E5] backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-[8px] bg-[#F3F7F2] flex items-center justify-center flex-shrink-0">
                  <Target size={13} className="text-[#6E9625]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] font-bold text-[#243A24]">Flexible Location</h4>
              </div>
              <p className="text-[9.5px] sm:text-[10.5px] text-[#6B7280] font-medium leading-[1.35]">
                Set your service areas - get matched with jobs that suit your location.
              </p>
            </div>

            {/* Endless Opportunities - Bottom Left */}
            <div className="flex absolute bottom-[10%] xl:bottom-[12%] left-[-12px] sm:left-[-35px] xl:left-[-55px] flex-col justify-center bg-white/95 xl:bg-white p-3 xl:p-4 rounded-[16px] xl:rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-[170px] sm:w-[195px] xl:w-[220px] h-auto z-20 border border-white/60 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-[8px] bg-[#FFF9F2] flex items-center justify-center flex-shrink-0">
                  <Zap size={13} className="text-[#F59E0B]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] font-bold text-[#243A24]">Endless Opportunities</h4>
              </div>
              <p className="text-[9.5px] sm:text-[10.5px] text-[#6B7280] font-medium leading-[1.35]">
                Access to a wide range of jobs, secure the right job for your business.
              </p>
            </div>

            {/* Reliable Connections - Bottom Right */}
            <div className="flex absolute bottom-[28%] xl:bottom-[24%] right-[-10px] sm:right-[-25px] xl:right-[-40px] flex-col justify-center bg-white/95 xl:bg-white p-3 xl:p-4 rounded-[16px] xl:rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-[165px] sm:w-[195px] xl:w-[220px] h-auto z-20 border border-white/60 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-[8px] bg-[#F2F6FF] flex items-center justify-center flex-shrink-0">
                  <Users size={13} className="text-[#3B82F6]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] font-bold text-[#243A24]">Reliable Connections</h4>
              </div>
              <p className="text-[9.5px] sm:text-[10.5px] text-[#6B7280] font-medium leading-[1.35]">
                Connect with genuine clients and build your reputation through trusted reviews.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OrganisedConnected;
