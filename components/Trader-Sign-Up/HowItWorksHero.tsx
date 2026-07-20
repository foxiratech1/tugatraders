import React from 'react';
import { FiArrowRight, FiCheckCircle, FiChevronDown } from 'react-icons/fi';

const HowItWorksHero = () => {
  const steps = [
    {
      id: 1,
      title: "Sign-Up",
      description: "Basic business information & contact details",
      status: "active"
    },
    {
      id: 2,
      title: "Upload Docs",
      description: "Verify identity and trade certifications",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Get Approved",
      description: "Manual verification by our local team",
      status: "upcoming"
    },
    {
      id: 4,
      title: "Activate Profile",
      description: "Go live and start receiving enquiries",
      status: "upcoming"
    }
  ];

  return (
    <section className="bg-[#F7F9F6] pt-40 pb-20 px-6 lg:px-20 overflow-hidden min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start lg:items-center">

          {/* Left Column - Content & Form */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex items-center gap-2 bg-[#6FAE7C1A] border border-[#6FAE7C33] rounded-full px-4 py-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#6E9625]" />
              <span className="text-[12px] font-bold text-[#6E9625] uppercase tracking-wider">Now in Portugal</span>
            </div>

            <h1 className="text-[64px] lg:text-[60px] font-bold text-[#243A24] leading-[1.05] tracking-tight">
              Built Specifically for <br />
              Tradespeople in <span className="text-[#6E9625]">Portugal</span>
            </h1>

            <p className="text-[20px] text-[#1F3D2B99]/60 font-medium leading-relaxed max-w-[650px]">
              Join the fastest-growing network of professional trades in Portugal.
              Connect with local homeowners and grow your business today.
            </p>

            {/* Form Card */}
            <div className="bg-white rounded-[24px] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-[#E5E5E5] max-w-[448px]">
              <form className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#9CA3AF] font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                    Trade Category
                  </label>
                  <div className="relative">
                    <select className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#243A24] font-semibold focus:outline-none appearance-none cursor-pointer">
                      <option>Electrician</option>
                      <option>Plumber</option>
                      <option>Carpenter</option>
                      <option>Painter</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                      <FiChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                    Location (City)
                  </label>
                  <input
                    type="text"
                    placeholder="Lisbon, Porto, Faro.."
                    className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#9CA3AF] font-semibold placeholder:text-[#9CA3AF] focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#9CA3AF] font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+351 9xx..."
                      className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#9CA3AF] font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1F3D2B66] uppercase tracking-[2px] mb-3 px-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-14 bg-[#F8F9F7] border border-[#E5E5E5] rounded-2xl px-6 text-[#9CA3AF] font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                  />
                </div>

                <button className="w-full h-16 bg-[#6E9625] text-white text-[18px] font-bold rounded-2xl shadow-xl shadow-[#6E9625]/20 hover:bg-[#5a7d1e] transition-all flex items-center justify-center gap-3 mt-4 cursor-pointer">
                  Sign Up Now
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-5 relative pl-12 lg:pl-20 mt-12 lg:mt-0">
            {/* Connecting Line */}
            <div className="absolute left-[47.5px] lg:left-[115.5px] top-4 bottom-4 w-[1px] bg-[#E5E5E5]" />

            <div className="space-y-16 lg:space-y-24 relative">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-10 group">
                  {/* Step Circle */}
                  <div className={`
                    relative z-10 w-14 h-14 rounded-full flex items-center justify-center font-bold text-[20px] transition-all duration-300
                    ${step.status === 'active'
                      ? 'bg-[#243A24] text-white border-[4px] border-[#FFFFFF] shadow-xl scale-110'
                      : 'bg-white border-[4px] border-[#FFFFFF] text-[#D1D5DB]'}
                  `}>
                    {step.id}
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col gap-1 pt-1">
                    <h3 className={`
                      text-[24px] lg:text-[24px] font-bold transition-all duration-300
                      ${step.status === 'active' ? 'text-[#243A24]' : 'text-[#243A2466]/40'}
                    `}>
                      {step.title}
                    </h3>
                    <p className={`
                      text-[16px] lg:text-[16px] font-medium max-w-[320px]
                      ${step.status === 'active' ? 'text-[#1F3D2B80]' : 'text-[#1F3D2B4D]/30'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksHero;
