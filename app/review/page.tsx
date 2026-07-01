import React from 'react';
import FeedbackSection from '@/components/LeaveReview/FeedbackSection';
import HowToLeaveReview from '@/components/LeaveReview/HowToLeaveReview';
import FairReviewsSection from '@/components/LeaveReview/FairReviewsSection';

const ReviewPage = () => {
  return (
    <main>
      <FeedbackSection />
      {/* <TrustStatsSection /> */}
      <HowToLeaveReview />
      <FairReviewsSection />
    </main>
  );
};

export default ReviewPage;
