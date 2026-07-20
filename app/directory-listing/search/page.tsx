import React, { Suspense } from 'react';
import DirectorySearchResults from '@/components/DirectoryListing/DirectorySearchResults';

const SearchResultsPage = () => {
  return (
    <main className="bg-[#F9FAFB] min-h-screen pt-28">
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading search results...</div>}>
        <DirectorySearchResults />
      </Suspense>
    </main>
  );
};

export default SearchResultsPage;
