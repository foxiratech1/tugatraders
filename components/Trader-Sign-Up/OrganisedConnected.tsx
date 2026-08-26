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
    <section className="bg-[#F9FAFB] pt-12 lg:pt-16 pb-20 lg:pb-24 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-18 items-start">

          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-8">
            <h2 className="text-[32px] sm:text-[40px] xl:text-[54px] font-bold text-[#243A24] leading-[1.05] tracking-tight -mt-6" style={{ fontFamily: "var(--font-bricolage)" }}>
              Stay organised and <br className="hidden sm:block" />
              connected.
            </h2>

            <div className="flex flex-col gap-8">
              {leftFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 sm:gap-6 xl:gap-8 group">
                  <div className="w-14 h-14 rounded-full bg-[#6FAE7C33] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#6E9625]/10">
                    <feature.Icon size={24} className="text-[#6E9625]" />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1F3D2B]">
                      {feature.title}
                    </h3>
                    <p className="text-[14px] sm:text-[16px] text-[#4B5563] font-medium leading-relaxed max-w-[460px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image with Floating Cards */}
          <div className="relative flex justify-center mt-10 xl:mt-0 w-full">
            {/* Main Image Container */}
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] xl:max-w-[500px] aspect-[3/4] sm:aspect-[1/1.3] rounded-[32px] xl:rounded-[40px] overflow-hidden shadow-2xl">
              <Image
                src="/image.png"
                alt="Organised and Connected"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Cards */}
            {/* Flexible Location - Top Left */}
            <div className="flex absolute top-[5%] xl:top-[10%] left-[-10px] xl:left-[-40px] flex-col justify-center bg-white/90 xl:bg-white p-3 xl:p-6 rounded-[16px] xl:rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] xl:shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[180px] sm:w-[220px] xl:w-[256px] h-auto xl:h-[112px] z-20 border border-[#E5E5E5] backdrop-blur-md xl:backdrop-blur-sm">
              <div className="flex items-center gap-2 xl:gap-3 mb-1.5 xl:mb-2">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-[8px] xl:rounded-[12px] bg-[#F3F7F2] flex items-center justify-center flex-shrink-0">
                  <Target size={14} className="text-[#6E9625]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] xl:text-[13px] font-bold text-[#243A24]">Flexible Location</h4>
              </div>
              <p className="text-[10px] sm:text-[11px] xl:text-[12px] text-[#6B7280] font-medium leading-[1.3] xl:leading-[1.4]">
                Set your service areas - get matched with jobs that suit your location.
              </p>
            </div>

            {/* Endless Opportunities - Bottom Left */}
            <div className="flex absolute bottom-[12%] xl:bottom-[15%] left-[-15px] xl:left-[-80px] flex-col justify-center bg-white/90 xl:bg-white p-3 xl:p-6 rounded-[16px] xl:rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] xl:shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[180px] sm:w-[220px] xl:w-[256px] h-auto xl:h-[112px] z-20 border border-white/50 backdrop-blur-md xl:backdrop-blur-sm">
              <div className="flex items-center gap-2 xl:gap-3 mb-1.5 xl:mb-2">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-[8px] xl:rounded-[12px] bg-[#FFF9F2] flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-[#F59E0B]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] xl:text-[13px] font-bold text-[#243A24]">Endless Opportunities</h4>
              </div>
              <p className="text-[10px] sm:text-[11px] xl:text-[12px] text-[#6B7280] font-medium leading-[1.3] xl:leading-[1.4]">
                Access to a wide range of jobs, secure the right job for your business.
              </p>
            </div>

            {/* Reliable Connections - Bottom Right */}
            <div className="flex absolute bottom-[35%] xl:bottom-[25%] right-[-10px] xl:right-[-60px] flex-col justify-center bg-white/90 xl:bg-white p-3 xl:p-6 rounded-[16px] xl:rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] xl:shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[170px] sm:w-[220px] xl:w-[256px] h-auto xl:h-[112px] z-20 border border-white/50 backdrop-blur-md xl:backdrop-blur-sm">
              <div className="flex items-center gap-2 xl:gap-3 mb-1.5 xl:mb-2">
                <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-[8px] xl:rounded-[12px] bg-[#F2F6FF] flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-[#3B82F6]" />
                </div>
                <h4 className="text-[11px] sm:text-[12px] xl:text-[13px] font-bold text-[#243A24]">Reliable Connections</h4>
              </div>
              <p className="text-[10px] sm:text-[11px] xl:text-[12px] text-[#6B7280] font-medium leading-[1.3] xl:leading-[1.4]">
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
