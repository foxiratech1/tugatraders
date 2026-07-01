import React, { Suspense } from 'react';
import FaqHero from '@/components/Faq/FaqHero';
import FaqContent from '@/components/Faq/FaqContent';
import FaqTraderContent from '@/components/Faq/FaqTraderContent';
import TraderPeopleCTA from '@/components/Faq/TraderPeopleCTA';
import WorkmanCTA from '@/components/Faq/WorkmanCTA';

export const metadata = {
  title: 'Frequently Asked Questions | TugaTrades',
  description: 'Find answers to all your questions about TugaTrades. Whether you are looking to hire a professional or find work as a tradesperson, find help here.',
};

export default function FaqPage() {
  return (
    <main className="bg-[#FAFAF9]">
      <FaqHero />
      <Suspense fallback={<div>Loading...</div>}>
        <FaqContent />
      </Suspense>
    </main>
  );
}
