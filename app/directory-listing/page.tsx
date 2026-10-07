import React from 'react';
import DirectoryHero from '@/components/DirectoryListing/DirectoryHero';
import CategoryBrowse from '@/components/DirectoryListing/CategoryBrowse';
import DirectoryListings from '@/components/DirectoryListing/DirectoryListings';
import ActionCards from '@/components/DirectoryListing/ActionCards';

const DirectoryListingPage = () => {
  return (
    <main className="bg-[#F9FAFB] min-h-screen">
      <DirectoryHero />
      <CategoryBrowse />
      {/* <DirectoryListings /> */}
      <ActionCards />
    </main>
  );
};

export default DirectoryListingPage;

