"use client";

import React, { useState } from "react";
import { Shield, Bell } from "lucide-react";

export default function AccountSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [jobQuote, setJobQuote] = useState(true);
  const [messageNotif, setMessageNotif] = useState(false);
  const [sms, setSms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1C2C1C]"></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1320px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C] leading-tight">Account Settings</h1>
          <p className="text-gray-500 mt-2 text-[15px]">Manage your security and account preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Security Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#1C2C1C] flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-[#1C2C1C]">Security</h2>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Email Address</h3>
                  <p className="text-gray-400 text-[14px] mt-1">ricardo.santos@tuga.pt</p>
                </div>
                <button className="text-[#1C2C1C] font-bold text-[14px] underline hover:text-opacity-70 transition-colors">Change</button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Password</h3>
                  <p className="text-gray-400 text-[14px] mt-1">Last changed 3 months ago</p>
                </div>
                <button className="text-[#1C2C1C] font-bold text-[14px] underline hover:text-opacity-70 transition-colors">Update</button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-[14px] mt-1">Enabled via SMS</p>
                </div>
                <Toggle checked={twoFactor} onChange={setTwoFactor} />
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#1C2C1C] flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-[#1C2C1C]">Preferences</h2>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Email Notifications</h3>
                  <p className="text-gray-400 text-[14px] mt-1">Job alerts and news</p>
                </div>
                <Toggle checked={emailNotif} onChange={setEmailNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Job quote</h3>
                </div>
                <Toggle checked={jobQuote} onChange={setJobQuote} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Message notification from Tradespeople</h3>
                </div>
                <Toggle checked={messageNotif} onChange={setMessageNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">SMS</h3>
                </div>
                <Toggle checked={sms} onChange={setSms} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Marketing & Promotions</h3>
                </div>
                <Toggle checked={marketing} onChange={setMarketing} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
