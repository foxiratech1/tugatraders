import TermsLayout from "@/components/Terms/TermsLayout";
import React from "react";
export const metadata = {
  title: 'Terms & Conditions - TugaTrades',
  description: 'Terms and conditions for TugaTrades',
}

export default function TermsPage() {
  return (
    <React.Suspense fallback={null}>
      <TermsLayout />
    </React.Suspense>
  );
}
