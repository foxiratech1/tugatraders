"use client";

import React, { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { MapPin, Calendar, Tag, Star, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";

function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/');

  return `${baseUrl}${imagePath}`;
}

interface SidebarProps {
  jobId?: string;
  traderId?: string;
}

export default function CustomerChatSidebar({ jobId, traderId }: SidebarProps) {
  const [job, setJob] = useState<any>(null);
  const [trader, setTrader] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      setLoading(true);
      try {
        if (jobId) {
          const jRes = await authApi.getCustomerJobById(jobId);
          if (isMounted) setJob(jRes?.data || jRes);
        }
        if (traderId) {
          const tRes = await authApi.getTraderProfileById(traderId);
          if (isMounted) setTrader(tRes?.data || tRes);
        }
      } catch (err) {
        console.error("Failed to fetch sidebar details", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (jobId || traderId) {
      loadDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [jobId, traderId]);

  if (!jobId && !traderId) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getAvatar = () => {
    const raw = trader?.traderProfile?.logo || trader?.logo || trader?.avatar || trader?.profileImage;
    return getImageUrl(raw) || "/avt.png";
  };

  return (
    <div className="w-[340px] flex-shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto hidden xl:flex flex-col p-6 space-y-8 h-full scrollbar-hide">
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 mt-8" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Job Details Section */}
          {job && (
            <div>
              <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-4 uppercase">Job Details</h3>
              <div className="bg-[#F9FAF9] rounded-2xl p-5 border border-gray-50">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                  JOB-{job?.id?.slice(0, 5)?.toUpperCase() || "N/A"}
                </p>
                <h4 className="text-[16px] font-bold text-[#1C2C1C] mb-5">{job?.title}</h4>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <MapPin size={14} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                      <p className="text-[13px] font-semibold text-[#1C2C1C]">{job?.location || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Calendar size={14} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Date Posted</p>
                      <p className="text-[13px] font-semibold text-[#1C2C1C]">{formatDate(job?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Tag size={14} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Category</p>
                      <p className="text-[13px] font-semibold text-[#1C2C1C]">{job?.categoryDetails?.[0]?.name || job?.category?.name || "Other"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200">
                  <p className="text-[12px] font-bold text-[#1C2C1C]">Status</p>
                  <span className="bg-[#F0F9F1] text-[#6E9625] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    {job?.status || "Contacted"}
                  </span>
                </div>
              </div>
              <div className="text-center mt-4">
                <Link href={`/customer-dashboard/job-history`} className="text-[#6E9625] text-[13px] font-bold hover:underline">
                  View Full Job Post &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Trader Details Section */}
          {trader && (
            <div>
              <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-4 uppercase">Trader Details</h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={getAvatar()} alt={trader?.fullName} width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-[#1C2C1C]">{trader?.fullName || trader?.companyName}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-[13px] font-bold text-[#1C2C1C]">
                        {trader?.traderMetrics?.averageRating || trader?.ratingAvg || "0.0"}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        ({trader?.traderMetrics?.totalReviews || trader?.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jobs Done</p>
                    <p className="text-[16px] font-bold text-[#1C2C1C]">
                      {trader?.traderMetrics?.completedJobs || 0}
                    </p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Member Since</p>
                    <p className="text-[16px] font-bold text-[#1C2C1C]">
                      {new Date(trader?.createdAt || Date.now()).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6E9625]" />
                    <span className="text-[12px] text-[#1C2C1C] font-medium">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#6E9625]" />
                    <span className="text-[12px] text-[#1C2C1C] font-medium">Insurance Uploaded</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Support Section */}
          <div className="bg-[#1C2C1C] rounded-2xl p-6 text-white mt-auto">
            <h4 className="text-[15px] font-bold mb-2">Need help?</h4>
            <p className="text-[12px] text-gray-300 mb-5 leading-relaxed">
              Get support regarding this job or customer directly from our team.
            </p>
            <Link
              href="/contact"
              className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-center text-[12px] font-bold border border-white/10"
            >
              Contact Tuga Support
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
