"use client";

import { useEffect, useRef, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { User, Camera, Upload, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  // publicProfileName: string;
  // address: string;
  profileImage: string | null;
}

export default function CustomerProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    // publicProfileName: "",
    // address: "",
    profileImage: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await authApi.getMyProfile();
        const p = res?.data || res;
        setForm({
          fullName: p?.fullName || "",
          email: p?.email || "",
          phone: p?.phone || p?.phone || "",
          // publicProfileName: p?.publicProfileName || p?.username || "",
          // address: p?.address || p?.addressLine || "",
          profileImage: p?.profileImage || p?.avatar || null,
        });
        if (p?.profileImage || p?.avatar) {
          setPreviewUrl(p.profileImage || p.avatar);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm((prev) => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("phone", form.phone);
      // fd.append("publicProfileName", form.publicProfileName);
      // fd.append("address", form.address);
      if (selectedFile) fd.append("profileImage", selectedFile);
      await authApi.updateProfile(fd);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update profile error", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[1.75rem] font-bold text-[#1C2C1C] leading-tight">
            Profile Management
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage how your professional identity appears to clients.
          </p>
        </div>

        <div className="flex gap-6 items-start">

          {/* Left Sidebar Tab */}
          <div className="w-44 flex-shrink-0">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#1C2C1C] text-white text-[13px] font-semibold shadow-sm"
            >
              <User size={15} />
              Personal Info
            </button>
          </div>

          {/* Right Content */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-5">

            {/* Profile Photo Card */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-5">
              <div className="flex items-center gap-5">

                {/* Avatar with camera icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-[#E8E8E8]">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1C2C1C] flex items-center justify-center border-2 border-white hover:bg-[#2c3e2c] transition-colors"
                  >
                    <Camera size={11} className="text-white" />
                  </button>
                </div>

                {/* Info + Buttons */}
                <div>
                  <p className="text-[14px] font-bold text-[#1C2C1C] mb-0.5">Profile Photo</p>
                  <p className="text-[12px] text-gray-400 mb-3">
                    Upload a professional photo for better visibility.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C2C1C] text-white rounded-lg text-[12px] font-semibold hover:bg-[#2c3e2c] transition-colors"
                    >
                      <Upload size={12} />
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-6">
              <h2 className="text-[14px] font-bold text-[#1C2C1C] mb-5">Personal Details</h2>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                {/* Name */}
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                  />
                </div>

                {/* Phone No. */}
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Phone No.</label>
                  <input
                    id="profile-phone"
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+44 000 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] bg-gray-50 text-[13px] text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Public Profile Name */}
                {/* <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Public Profile Name</label>
                  <input
                    id="profile-public-name"
                    type="text"
                    name="publicProfileName"
                    value={form.publicProfileName}
                    onChange={handleChange}
                    placeholder="Display name"
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                  />
                </div> */}

                {/* Address – full width */}
                {/* <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Address</label>
                  <input
                    id="profile-address"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street, City, Country"
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] text-[13px] text-[#1C2C1C] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6E9625]/40 focus:border-[#6E9625] transition-all"
                  />
                </div> */}
              </div>
            </div>

            {/* Update Profile Button */}
            <button
              id="update-profile-btn"
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#1C2C1C] hover:bg-[#2c3e2c] text-white text-[14px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  Update Profile
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
