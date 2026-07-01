import React from "react";

export default function ContentModerationContent() {
  return (
    <div className="space-y-8 text-[#000000] text-[16px] font-normal leading-relaxed animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-[24px] font-bold text-[#111111] mb-4">
          CONTENT MODERATION POLICY
        </h2>

        <h3 className="font-[600] text-[#111111] mb-2">
          1. Purpose
        </h3>

        <p>
          This policy explains how TugaTrades manages, reviews, and moderates
          user-generated content on the platform.
        </p>
      </div>

      {/* 2. Scope */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          2. Scope
        </h3>

        <p>
          This policy applies to all content submitted or shared on
          TugaTrades, including:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Reviews</li>
          <li>Messages</li>
          <li>Job descriptions</li>
          <li>Profile information</li>
          <li>Images and other uploads</li>
        </ul>
      </div>

      {/* 3. Moderation Approach */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          3. Moderation Approach
        </h3>

        <p>
          TugaTrades aims to maintain a platform that is:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Fair</li>
          <li>Respectful</li>
          <li>Transparent</li>
          <li>Free from harmful or misleading content</li>
        </ul>

        <p className="mt-4">
          We do not actively monitor all content but may review, remove, or
          restrict content where necessary.
        </p>
      </div>

      {/* 4. Prohibited Content */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          4. Prohibited Content
        </h3>

        <p>
          The following content is not permitted on the platform:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            False, misleading, or deceptive information
          </li>

          <li>
            Fake, manipulated, or incentivised reviews
          </li>

          <li>
            Defamatory, abusive, or offensive content
          </li>

          <li>
            Discriminatory or hateful language
          </li>

          <li>
            Fraud, impersonation, or identity misrepresentation
          </li>

          <li>
            Spam or unrelated promotional content
          </li>

          <li>
            Content that violates applicable laws
          </li>
        </ul>
      </div>

      {/* 5. Content Standards */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          5. Content Standards
        </h3>

        <p>All users must ensure that content:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            Is based on genuine experience (where applicable)
          </li>

          <li>
            Is accurate to the best of their knowledge
          </li>

          <li>
            Is respectful and non-abusive
          </li>
        </ul>

        <p className="mt-5">Users must not:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>
            Manipulate ratings, reviews, or visibility
          </li>

          <li>
            Pressure or coerce others into submitting content
          </li>

          <li>
            Offer incentives in exchange for reviews or engagement
          </li>
        </ul>
      </div>

      {/* 6. Moderation & Enforcement */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          6. Moderation & Enforcement
        </h3>

        <p>
          We may take action where content breaches this policy, including:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Removing or restricting content</li>

          <li>Issuing warnings</li>

          <li>
            Suspending or terminating accounts
          </li>

          <li>
            Investigating suspicious activity
          </li>

          <li>
            Requesting additional information or evidence
          </li>
        </ul>

        <p className="mt-4">
          We may take action without prior notice where necessary.
        </p>

        <p className="mt-3">
          Enforcement actions may be applied proportionally depending on the
          severity of the breach.
        </p>
      </div>

      {/* 7. Reporting Content */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          7. Reporting Content
        </h3>

        <p>
          Users may report content they believe violates this policy.
        </p>

        <p className="mt-4">Reports may include:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>False or misleading reviews</li>

          <li>
            Offensive or abusive messages
          </li>

          <li>
            Suspicious or fraudulent activity
          </li>
        </ul>

        <p className="mt-4">
          We will review all reports and take action where appropriate.
        </p>
      </div>

      {/* 8. Content Removal */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          8. Content Removal
        </h3>

        <p>
          We do not guarantee that reported content will be removed.
        </p>

        <p className="mt-4">
          Content will only be removed where it:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Breaches this policy</li>

          <li>Violates applicable laws</li>
        </ul>
      </div>

      {/* 9. Responsibility for Content */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          9. Responsibility for Content
        </h3>

        <p>
          TugaTrades does not verify all user-generated content and is not
          responsible for its accuracy, completeness, or reliability.
        </p>

        <p className="mt-3">
          Users interact with and rely on content at their own risk.
        </p>
      </div>

      {/* 10. Changes to This Policy */}
      <div>
        <h3 className="font-[600] text-[#111111] mb-2">
          10. Changes to This Policy
        </h3>

        <p>
          We may update this policy at any time. Continued use of the platform
          constitutes acceptance of any updates.
        </p>
      </div>
    </div>
  );
}