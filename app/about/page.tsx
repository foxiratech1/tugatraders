import React from 'react';
import MissionSection from '@/components/About/MissionSection';
import QuoteBanner from '@/components/About/QuoteBanner';
import OurValues from '@/components/About/OurValues';
import DashboardSection from '@/components/About/DashboardSection';
import FeaturesGrid from '@/components/About/FeaturesGrid';
import CTASection from '@/components/About/CTASection';

export const metadata = {
  title: 'About Us - Our Mission & Vision | TugaTrades',
  description: 'Learn about TugaTrades, Portugal\'s premier network of vetted trade professionals. Discover our mission to connect quality Portuguese professionals with homeowners.',
};

const AboutPage = () => {
  return (
    <main className="bg-[#FAFAF9]">
      <MissionSection />

      <OurValues />
      <QuoteBanner />
      <DashboardSection />
      <FeaturesGrid />
      <CTASection />
    </main>
  );
};

export default AboutPage;
