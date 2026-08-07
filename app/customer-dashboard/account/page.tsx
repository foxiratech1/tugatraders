"use client";

import React, { useState, useEffect } from "react";
import { Shield, Bell } from "lucide-react";
import { authApi } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import toast from "react-hot-toast";

export default function AccountSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [jobQuote, setJobQuote] = useState(true);
  const [messageNotif, setMessageNotif] = useState(false);
  const [sms, setSms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Email state
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        const profile = res?.data || res;
        if (profile?.email) {
          setEmail(profile.email);
          setNewEmail(profile.email);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === email) {
      setIsEditingEmail(false);
      return;
    }
    try {
      setIsUpdating(true);
      await authApi.updateProfile({ email: newEmail });
      setEmail(newEmail);
      setIsEditingEmail(false);
      toast.success("Email updated successfully.");
    } catch (error: any) {
      console.error("Update email failed", error);
      toast.error(error?.response?.data?.message || "Failed to update email.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await authApi.changePassword({ oldPassword, newPassword, confirmPassword });
      setIsEditingPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error: any) {
      console.error("Update password failed", error);
      toast.error(error?.response?.data?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
              <div className="flex flex-col border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1C2C1C] font-bold text-[15px]">Email Address</h3>
                    {!isEditingEmail && <p className="text-gray-400 text-[14px] mt-1">{email || "Loading..."}</p>}
                  </div>
                  {!isEditingEmail && (
                    <button onClick={() => setIsEditingEmail(true)} className="text-[#1C2C1C] font-bold text-[14px] underline hover:text-opacity-70 transition-colors cursor-pointer">
                      Change
                    </button>
                  )}
                </div>
                {isEditingEmail && (
                  <div className="mt-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="max-w-md">
                      <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-1.5">New Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                        placeholder="Enter new email"
                      />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleUpdateEmail}
                        disabled={isUpdating}
                        className="bg-[#6E9625] text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#5a7a1e] transition-colors cursor-pointer disabled:opacity-70"
                      >
                        {isUpdating ? "Saving..." : "Save Email"}
                      </button>
                      <button
                        onClick={() => { setIsEditingEmail(false); setNewEmail(email); }}
                        className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1C2C1C] font-bold text-[15px]">Password</h3>
                    {!isEditingPassword && <p className="text-gray-400 text-[14px] mt-1">Last changed 3 months ago</p>}
                  </div>
                  {!isEditingPassword && (
                    <button onClick={() => setIsEditingPassword(true)} className="text-[#1C2C1C] font-bold text-[14px] underline hover:text-opacity-70 transition-colors cursor-pointer">
                      Update
                    </button>
                  )}
                </div>

                {isEditingPassword && (
                  <div className="mt-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      <div>
                        <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 pr-10 text-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <AnimatedEye show={showOldPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 pr-10 text-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <AnimatedEye show={showNewPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 pr-10 text-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <AnimatedEye show={showConfirmPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword}
                        className="bg-[#6E9625] text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#5a7a1e] transition-colors cursor-pointer disabled:opacity-70"
                      >
                        {isUpdatingPassword ? "Saving..." : "Save Password"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPassword(false);
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
