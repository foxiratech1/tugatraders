"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import { 
  Briefcase, MessageSquare, Star, FileText, Zap, 
  MapPin, Clock, MoreVertical, ShieldCheck, CheckCircle2, 
  Headphones, ChevronRight, Eye, Send, Users, BarChart, Loader2, ArrowRight
} from "lucide-react";

export default function TraderDashboard() {
  const [dashboardDetails, setDashboardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await authApi.getTraderDashboard().catch(() => null);
        setDashboardDetails(dashRes?.data || dashRes || {});
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time dashboard update via socket
  useSocket({
    onTraderDashboardUpdate: (data) => {
      if (data) {
        setDashboardDetails(data);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-[#6E9625]" size={40} />
      </div>
    );
  }

  // Exact data mapping based on API response
  const actionRequired = dashboardDetails?.actionRequired || {};
  const status = dashboardDetails?.status || {};
  const stats = dashboardDetails?.performance || dashboardDetails?.stats || {};
  const profileCompleteness = status.profileCompletenessPercentage ?? 0;
  const newJobs = dashboardDetails?.newJobs || [];
  const openJobs = dashboardDetails?.openJobs || [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#F8F9F5] min-h-screen">
      
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">
        
        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[18px] font-extrabold text-[#1C2C1C]">Your TugaTrades Status</h2>
          
          {/* Profile Completeness */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
            <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-4">Profile Completeness</h3>
            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <span className="text-[24px] font-black text-[#1C2C1C] leading-none">{profileCompleteness}% <span className="text-[14px]">Complete</span></span>
              </div>
              <div className="h-[6px] bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#6E9625] rounded-full" style={{ width: `${profileCompleteness}%` }} />
              </div>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Next step: {status.profileCompletenessNextStep || "Complete dashboard requirements"}</p>
            <button 
              onClick={() => router.push('/trader/profile')}
              className="w-full py-2.5 rounded-xl border border-[#E2EED2] text-[#6E9625] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#F2F7EB] transition-colors"
            >
              Complete profile <ArrowRight size={14} />
            </button>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
            <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-4">Subscription</h3>
            <div className="bg-[#FFF4E5] rounded-xl p-3 flex items-center gap-3 mb-4 border border-[#FFE0B2]">
              <ShieldCheck size={20} className="text-[#E65100]" />
              <span className="text-[14px] font-bold text-[#E65100]">{status.subscription?.tierName || "Free Tier"}</span>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Active until {status.subscription?.activeUntil ? new Date(status.subscription.activeUntil).toLocaleDateString() : 'N/A'}</p>
            <button 
              onClick={() => router.push('/trader/billing')}
              className="text-[13px] font-bold text-[#6E9625] hover:underline flex items-center gap-1"
            >
              Manage subscription <ArrowRight size={14} />
            </button>
          </div>

          {/* Need help? */}
          <div className="bg-[#F2F7EB] rounded-[20px] border border-[#E2EED2] p-5">
            <div className="flex items-center gap-3 mb-3">
              <Headphones size={20} className="text-[#6E9625]" />
              <h3 className="text-[14px] font-bold text-[#1C2C1C]">Need help?</h3>
            </div>
            <p className="text-[12px] text-gray-600 mb-4">Our support team is here to help you.</p>
            <button 
              onClick={() => router.push('/contact')}
              className="w-full py-2.5 rounded-xl bg-white border border-[#E2EED2] text-[#6E9625] text-[13px] font-bold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ───────────────────────────── */}
        <div className="flex flex-col gap-6 w-full min-w-0">
          
          {/* Header */}
          <div>
            <h1 className="text-[28px] font-extrabold text-[#1C2C1C] flex items-center gap-2">
              Hello, {dashboardDetails?.welcome?.fullName || "Trader"} <span role="img" aria-label="wave">👋</span>
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">Here's what's happening with your business today.</p>
          </div>

          {/* Action Required Block */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E2EED2] overflow-hidden mt-2">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100/60 bg-[#FAFAFA]">
              <Zap size={18} className="text-[#6E9625]" fill="#6E9625" />
              <h3 className="text-[15px] font-bold text-[#1C2C1C]">Action Required</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-gray-100/60 p-2">
              
              {/* Card 1 */}
              <div 
                onClick={() => router.push('/trader/jobs')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.newJobsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">In progress job</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View jobs <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => router.push('/trader/quote')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-[#E65100]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.quotesAwaitingResponseCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">Quotes awaiting response</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View quotes <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => router.push('/trader/reviews')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#1565C0]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.newReviewsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">Pending Reviews</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View review <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 4 */}
              <div 
                onClick={() => router.push('/trader/profile')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-[#1C2C1C] leading-tight mb-1">
                      {actionRequired.profileCompleteness?.isCompleted ? "Profile complete" : "Complete your profile"}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">{actionRequired.profileCompleteness?.nextStep || "Add insurance certificate"}</p>
                  </div>
                </div>
                {!actionRequired.profileCompleteness?.isCompleted && (
                  <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                    Complete now <ArrowRight size={14} />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Grid Layout below Action Required */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-2">
            
            {/* Left Side: Jobs Lists */}
            <div className="flex flex-col gap-6 min-w-0">
              
              {/* New Jobs For You */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">New Jobs For You</h3>
                  </div>
                  <button className="text-[12px] font-bold text-[#6E9625] hover:underline flex items-center gap-1">
                    View all jobs <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[12px] text-gray-500 mb-4 -mt-3 ml-6">Matched to your services and service area</p>
                
                <div className="divide-y divide-gray-100">
                  {newJobs.length > 0 ? newJobs.map((job: any) => (
                    <div key={job.id || Math.random()} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[14px] font-bold text-[#1C2C1C] mb-2">{job.title || "Untitled Job"}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || "N/A"}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {job.postedAgo || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Just now")}</span>
                          <span className="flex items-center gap-1 text-[#E65100] font-medium"><MessageSquare size={12} /> {job.quotesCount || 0} quotes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}`)}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-[#1C2C1C] text-[12px] font-bold hover:bg-gray-50 transition-colors"
                        >
                          View Job
                        </button>
                        <button 
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}&action=quote`)}
                          className="px-4 py-2 rounded-xl bg-[#5C7E1F] text-white text-[12px] font-bold hover:bg-[#4d691a] transition-colors"
                        >
                          Send Quote
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-gray-500 text-[13px]">
                      No new jobs available at the moment.
                    </div>
                  )}
                </div>
                {newJobs.length > 0 && (
                  <button className="w-full mt-4 text-[12px] font-bold text-[#6E9625] hover:underline flex items-center justify-center gap-1">
                    Show more jobs <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Open Jobs */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">Open Jobs</h3>
                  </div>
                  <button className="text-[12px] font-bold text-[#6E9625] hover:underline flex items-center gap-1">
                    View all jobs <ArrowRight size={14} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[12px] font-bold text-gray-400">
                        <th className="pb-3 font-medium">Job Title</th>
                        <th className="pb-3 font-medium">Location</th>
                        <th className="pb-3 font-medium text-center">Quotes</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {openJobs.length > 0 ? openJobs.map((job: any) => (
                        <tr key={job.id || Math.random()}>
                          <td className="py-4">
                            <p className="text-[13px] font-bold text-[#1C2C1C]">{job.title || "Untitled Job"}</p>
                            <p className="text-[11px] text-gray-400">Ref: {job.id?.substring(0, 8) || "N/A"}</p>
                          </td>
                          <td className="py-4 text-[12px] text-gray-600"><span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400"/> {job.location || "N/A"}</span></td>
                          <td className="py-4 text-[12px] font-bold text-center">{job.quotesCount || 0}</td>
                          <td className="py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded border border-[#6E9625] text-[#6E9625] text-[10px] font-bold bg-[#F2F7EB] uppercase">{job.status || "Live"}</span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16}/></button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 text-[13px]">
                            You have no open jobs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: Performance Metrics */}
            <div className="flex flex-col gap-6">
              
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">Your Performance</h3>
                  </div>
                  <select className="text-[12px] border border-gray-200 rounded-lg px-2 py-1 outline-none text-[#1C2C1C] font-medium bg-white">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>All time</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Eye size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.jobsViewed === 'object' ? stats.jobsViewed?.value : (stats.jobsViewed ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Jobs viewed</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.jobsViewed === 'object' ? stats.jobsViewed?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Send size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.quotesSent === 'object' ? stats.quotesSent?.value : (stats.quotesSent ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Quotes sent</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.quotesSent === 'object' ? stats.quotesSent?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.quoteAcceptanceRate === 'object' ? stats.quoteAcceptanceRate?.value : (stats.quoteAcceptanceRate ?? 0)}%
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Quote acceptance rate</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.quoteAcceptanceRate === 'object' ? stats.quoteAcceptanceRate?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Users size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.profileViews === 'object' ? stats.profileViews?.value : (stats.profileViews ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Profile views</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.profileViews === 'object' ? stats.profileViews?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 5 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Star size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.averageRating === 'object' ? stats.averageRating?.value : (stats.averageRating ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Average rating</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.averageRating === 'object' ? (stats.averageRating?.trendPercentage ?? stats.averageRating?.trendChange ?? 0) : 0} <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 6 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <MessageSquare size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.responseRate === 'object' ? stats.responseRate?.value : (stats.responseRate ?? 0)}%
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Response rate</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.responseRate === 'object' ? stats.responseRate?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
