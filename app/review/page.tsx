import React from 'react';
import FeedbackSection from '@/components/LeaveReview/FeedbackSection';
import HowToLeaveReview from '@/components/LeaveReview/HowToLeaveReview';
import PublicReviewsSection from '@/components/LeaveReview/PublicReviewsSection';
import FairReviewsSection from '@/components/LeaveReview/FairReviewsSection';

const ReviewPage = () => {
  return (
    <main>
      <FeedbackSection />
      {/* <TrustStatsSection /> */}
      <HowToLeaveReview />
      <PublicReviewsSection />
      <FairReviewsSection />
    </main>
  );
};

export default ReviewPage;
