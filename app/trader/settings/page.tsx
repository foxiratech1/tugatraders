"use client";

import React, { useState } from "react";
import { Shield, Bell } from "lucide-react";
import { authApi } from "@/app/api/authApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function TraderSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [jobsLeads, setJobsLeads] = useState(true);
  const [billing, setBilling] = useState(true);
  const [messageNotif, setMessageNotif] = useState(false);
  const [sms, setSms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const router = useRouter();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      await authApi.deactivateAccount();
      toast.success("Account deactivated.");
      if (typeof authApi.handleLogout === "function") {
        await authApi.handleLogout(router);
      } else {
        await authApi.logout();
        router.push("/");
      }
    } catch (error: any) {
      console.error("Deactivate failed", error);
      toast.error(error?.response?.data?.message || "Failed to deactivate account.");
      setIsDeactivating(false);
    }
  };

  const Toggle = ({ checked, onChange, colorClass = "peer-checked:bg-[#1C2C1C]" }: { checked: boolean, onChange: (c: boolean) => void, colorClass?: string }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colorClass}`}></div>
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
                  <p className="text-[#6E9625] text-[14px] mt-1">Enabled via SMS</p>
                </div>
                <Toggle checked={twoFactor} onChange={setTwoFactor} colorClass="peer-checked:bg-[#6E9625]" />
              </div>

              <div className="flex flex-col pt-2 border-t border-gray-100 mt-6">
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <h3 className="text-red-600 font-bold text-[15px]">Deactivate Account</h3>
                    <p className="text-gray-400 text-[14px] mt-1">Temporarily disable your account</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="deactivateToggle"
                      checked={isDeactivating}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowDeactivateModal(true);
                        }
                      }}
                      disabled={isDeactivating}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="deactivateToggle"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${isDeactivating ? "bg-red-500" : "bg-gray-300"
                        }`}
                    ></label>
                    <span
                      className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 w-5 h-5 rounded-full transition-transform pointer-events-none ${isDeactivating ? "translate-x-full border-white" : ""
                        }`}
                    ></span>
                  </div>
                </div>
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
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">SMS Notifications</h3>
                </div>
                <Toggle checked={smsNotif} onChange={setSmsNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Jobs & Leads</h3>
                </div>
                <Toggle checked={jobsLeads} onChange={setJobsLeads} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Billing & Payments</h3>
                </div>
                <Toggle checked={billing} onChange={setBilling} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C2C1C] font-bold text-[15px]">Message notification from clients</h3>
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

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-[20px] font-bold text-[#1C2C1C] mb-2">Deactivate Account</h3>
            <p className="text-gray-500 text-[14px] mb-6">
              Are you sure you want to deactivate your account? This action will temporarily disable your account and log you out.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  handleDeactivate();
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
