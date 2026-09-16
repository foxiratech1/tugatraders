"use client";

import React, { useState, useEffect } from "react";
import { Shield, Bell } from "lucide-react";
import { authApi } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [jobQuote, setJobQuote] = useState(true);
  const [messageNotif, setMessageNotif] = useState(false);
  const [sms, setSms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const router = useRouter();

  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

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
        const userEmail = profile?.email || profile?.user?.email || profile?.traderProfile?.email || "";
        if (userEmail) {
          setEmail(userEmail);
          setNewEmail(userEmail);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail.trim() === email) {
      setIsEditingEmail(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      setIsUpdating(true);
      await authApi.updateProfile({ email: newEmail.trim() });
      setEmail(newEmail.trim());
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

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 sm:w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1C2C1C]"></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-8">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[#1C2C1C] leading-tight">Account Settings</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-[13px] sm:text-[14px] lg:text-[15px]">Manage your security and account preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-8 items-start">
          {/* Security Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-5 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5 md:mb-6 lg:mb-8">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#1C2C1C] flex items-center justify-center flex-shrink-0">
                <Shield className="text-white" size={18} />
              </div>
              <h2 className="text-[16px] md:text-[17px] lg:text-[18px] font-bold text-[#1C2C1C]">Security</h2>
            </div>

            <div className="space-y-4 md:space-y-5 lg:space-y-7">
              {/* Email Address */}
              <div className="flex flex-col border-b border-gray-100 pb-4 md:pb-4 lg:pb-6 last:border-0 last:pb-0">
                <div className="flex items-start sm:items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[14px] lg:text-[15px]">Email Address</h3>
                    {!isEditingEmail && (
                      <p className="text-gray-400 text-[12px] md:text-[13px] lg:text-[14px] mt-0.5 truncate">
                        {email || "Loading..."}
                      </p>
                    )}
                  </div>
                  {!isEditingEmail && (
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[#1C2C1C] font-bold text-[12px] md:text-[13px] lg:text-[14px] underline hover:text-opacity-70 transition-colors cursor-pointer flex-shrink-0 pt-0.5 sm:pt-0"
                    >
                      Change
                    </button>
                  )}
                </div>
                {isEditingEmail && (
                  <div className="mt-3 md:mt-4 bg-gray-50 p-3.5 md:p-4 rounded-xl border border-gray-100">
                    <div className="w-full max-w-md">
                      <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1">New Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border border-gray-200 bg-white rounded-xl px-3.5 py-2 text-[13px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                        placeholder="Enter new email"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      <button
                        onClick={handleUpdateEmail}
                        disabled={isUpdating}
                        className="bg-[#6E9625] text-white px-4 sm:px-5 py-2 rounded-xl font-bold text-[12px] md:text-[13px] hover:bg-[#5a7a1e] transition-colors cursor-pointer disabled:opacity-70 text-center shadow-sm"
                      >
                        {isUpdating ? "Saving..." : "Save Email"}
                      </button>
                      <button
                        onClick={() => { setIsEditingEmail(false); setNewEmail(email); }}
                        className="bg-white border border-gray-200 text-gray-700 px-4 sm:px-5 py-2 rounded-xl font-bold text-[12px] md:text-[13px] hover:bg-gray-50 transition-colors cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col border-b border-gray-100 pb-4 md:pb-4 lg:pb-6 last:border-0 last:pb-0">
                <div className="flex items-start sm:items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[14px] lg:text-[15px]">Password</h3>
                    {!isEditingPassword && (
                      <p className="text-gray-400 text-[12px] md:text-[13px] lg:text-[14px] mt-0.5">Last changed 3 months ago</p>
                    )}
                  </div>
                  {!isEditingPassword && (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="text-[#1C2C1C] font-bold text-[12px] md:text-[13px] lg:text-[14px] underline hover:text-opacity-70 transition-colors cursor-pointer flex-shrink-0 pt-0.5 sm:pt-0"
                    >
                      Update
                    </button>
                  )}
                </div>

                {isEditingPassword && (
                  <div className="mt-3 md:mt-4 bg-gray-50 p-3.5 md:p-4 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-3.5 py-2 pr-10 text-[13px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <AnimatedEye show={showOldPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-3.5 py-2 pr-10 text-[13px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <AnimatedEye show={showNewPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border border-gray-200 bg-white rounded-xl px-3.5 py-2 pr-10 text-[13px] w-full focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <AnimatedEye show={showConfirmPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword}
                        className="bg-[#6E9625] text-white px-4 sm:px-5 py-2 rounded-xl font-bold text-[12px] md:text-[13px] hover:bg-[#5a7a1e] transition-colors cursor-pointer disabled:opacity-70 text-center shadow-sm"
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
                        className="bg-white border border-gray-200 text-gray-700 px-4 sm:px-5 py-2 rounded-xl font-bold text-[12px] md:text-[13px] hover:bg-gray-50 transition-colors cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex flex-col border-b border-gray-100 pb-4 md:pb-4 lg:pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1 pr-1">
                    <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[14px] lg:text-[15px]">Two-Factor Authentication</h3>
                    <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Enabled via SMS</p>
                  </div>
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </div>
              </div>

              {/* Deactivate Account */}
              <div className="flex flex-col pt-1">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1 pr-1">
                    <h3 className="text-red-600 font-bold text-[13px] md:text-[14px] lg:text-[15px]">Deactivate Account</h3>
                    <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Temporarily disable your account</p>
                  </div>
                  <div className="relative inline-block w-11 sm:w-12 h-6 align-middle select-none transition duration-200 ease-in flex-shrink-0">
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
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-5 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5 md:mb-6 lg:mb-8">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#1C2C1C] flex items-center justify-center flex-shrink-0">
                <Bell className="text-white" size={18} />
              </div>
              <h2 className="text-[16px] md:text-[17px] lg:text-[18px] font-bold text-[#1C2C1C]">Preferences</h2>
            </div>

            <div className="space-y-4 md:space-y-4 lg:space-y-6">
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[13px] lg:text-[15px] leading-snug">Email Notifications</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Job alerts and news</p>
                </div>
                <Toggle checked={emailNotif} onChange={setEmailNotif} />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[13px] lg:text-[15px] leading-snug">Job quote</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Alerts when quotes are received</p>
                </div>
                <Toggle checked={jobQuote} onChange={setJobQuote} />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[13px] lg:text-[15px] leading-snug">Message notification from Tradespeople</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Direct chat message alerts</p>
                </div>
                <Toggle checked={messageNotif} onChange={setMessageNotif} />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[13px] lg:text-[15px] leading-snug">SMS</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Text message alerts for urgent updates</p>
                </div>
                <Toggle checked={sms} onChange={setSms} />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-[#1C2C1C] font-bold text-[13px] md:text-[13px] lg:text-[15px] leading-snug">Marketing & Promotions</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] lg:text-[13px] mt-0.5">Discounts and platform news</p>
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
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1C2C1C] mb-2">Deactivate Account</h3>
            <p className="text-gray-500 text-[13px] sm:text-[14px] mb-5 sm:mb-6 leading-relaxed">
              Are you sure you want to deactivate your account? This action will temporarily disable your account and log you out.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-[13px] sm:text-[14px] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  handleDeactivate();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-[13px] sm:text-[14px] text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer text-center"
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
