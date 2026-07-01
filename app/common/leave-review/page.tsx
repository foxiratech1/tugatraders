"use client";

import React, { Suspense } from 'react';
import LeaveReview from '@/components/common/LeaveReview';

export default function LeaveReviewPage() {
  return (
    <div className="min-h-screen bg-[#F8F9F5] py-8 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LeaveReview />
      </Suspense>
    </div>
  );
}
