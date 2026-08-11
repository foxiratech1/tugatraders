import React, { useState } from "react";

export default function CookieSettingsContent({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="space-y-8 text-[#000000] text-[16px] font-normal leading-relaxed animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-bold text-[#111111] mb-4">
          Cookie Settings
        </h2>

        <p className="text-gray-700">
          Your privacy matters. You’re in control of how your data is used.
        </p>
      </div>

      {/* Cookie Preferences */}
      <div>
        <h3 className="text-[20px] font-semibold text-[#111111] mb-3">
          Cookie Preferences
        </h3>

        <p className="text-gray-700">
          We use cookies to enhance your experience, improve performance, and
          personalise content. You can choose which types of cookies you allow
          below.
        </p>
      </div>

      {/* Essential Cookies */}
      <div className="border rounded-2xl p-5 bg-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-[18px] font-semibold text-[#111111]">
              Essential Cookies
            </h4>

            <p className="text-sm text-gray-500 mt-1">
              Always Active
            </p>

            <p className="mt-3 text-gray-700">
              These cookies are required for the website to function properly.
              They enable core features such as security, account access, and
              navigation.
            </p>

            <p className="mt-3 text-sm font-medium text-gray-600">
              🔒 These cannot be disabled.
            </p>
          </div>

          <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold whitespace-nowrap">
            Always Enabled
          </div>
        </div>
      </div>

      {/* Analytics Cookies */}
      <div className="border border-[#052E16] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-[18px] font-semibold text-[#111111]">
              Analytics Cookies
            </h4>

            <p className="mt-3 text-gray-700">
              These help us understand how visitors use our website, so we can
              improve performance and user experience.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={analytics}
              onChange={() => setAnalytics(!analytics)}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#243A24] transition-colors"></div>

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Functional Cookies */}
      <div className="border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-[18px] font-semibold text-[#111111]">
              Functional Cookies
            </h4>

            <p className="mt-3 text-gray-700">
              These enable enhanced features such as remembering your
              preferences and settings.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={functional}
              onChange={() => setFunctional(!functional)}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#243A24] transition-colors"></div>

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Marketing Cookies */}
      <div className="border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-[18px] font-semibold text-[#111111]">
              Marketing Cookies
            </h4>

            <p className="mt-3 text-gray-700">
              These are used to deliver relevant ads and track the effectiveness
              of our campaigns.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={marketing}
              onChange={() => setMarketing(!marketing)}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#243A24] transition-colors"></div>

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <p className="text-gray-700">
          Learn more in our{" "}
          <button
            type="button"
            onClick={() => onNavigateTab?.("cookies")}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Cookie Policy
          </button>
        </p>
      </div>
    </div>
  );
}