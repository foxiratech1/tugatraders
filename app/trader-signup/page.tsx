import React from 'react';
import HowItWorksHero from '@/components/Trader-Sign-Up/HowItWorksHero';
import WhyJoinSection from '@/components/Trader-Sign-Up/WhyJoinSection';
import VettingSection from '@/components/Trader-Sign-Up/VettingSection';
import SuccessSteps from '@/components/Trader-Sign-Up/SuccessSteps';
import OrganisedConnected from '@/components/Trader-Sign-Up/OrganisedConnected';
import JoinNetworkSection from '@/components/Trader-Sign-Up/JoinNetworkSection';
import SecureJobsBanner from '@/components/Trader-Sign-Up/SecureJobsBanner';

const TraderSignupPage = () => {
  return (
    <main>
      <HowItWorksHero />
      <WhyJoinSection />
      <VettingSection />
      <JoinNetworkSection />
      <SuccessSteps />
      <OrganisedConnected />

      <SecureJobsBanner />
    </main>
  );
};

export default TraderSignupPage;
