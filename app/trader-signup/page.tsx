import React from 'react';
import HowItWorksHero from '@/components/Trader-Sign-Up/HowItWorksHero';
import TraderBenefitsSection from '@/components/Trader-Sign-Up/TraderBenefitsSection';
import WhyJoinSection from '@/components/Trader-Sign-Up/WhyJoinSection';
import HowItWorksSteps from '@/components/Trader-Sign-Up/HowItWorksSteps';
import VettingSection from '@/components/Trader-Sign-Up/VettingSection';
import SuccessSteps from '@/components/Trader-Sign-Up/SuccessSteps';
import OrganisedConnected from '@/components/Trader-Sign-Up/OrganisedConnected';
import JoinNetworkSection from '@/components/Trader-Sign-Up/JoinNetworkSection';
import SecureJobsBanner from '@/components/Trader-Sign-Up/SecureJobsBanner';

const TraderSignupPage = () => {
  return (
    <main>
      <HowItWorksHero />
      <TraderBenefitsSection />
      <WhyJoinSection />
      <HowItWorksSteps />
      <VettingSection />
      <JoinNetworkSection />
      <SuccessSteps />
      <OrganisedConnected />

      <SecureJobsBanner />
    </main>
  );
};

export default TraderSignupPage;
