"use client";

import React, { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { Calendar, Search, MoreVertical, Paperclip, X, Eye, FileText } from "lucide-react";

export default function CustomerContact() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await authApi.getContactSubmissions();
        // The API returns { data: [...], meta: {...} }
        setSubmissions(response?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load contact submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const formatSubject = (subject: string) => {
    if (!subject) return "Unknown";
    return subject.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-[#FFF8E6] text-[#B7791F] border-[#FEFCBF]";
      case "RESOLVED":
        return "bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]";
      case "IN_PROGRESS":
        return "bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredSubmissions = submissions.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query) || item.user?.fullName?.toLowerCase().includes(query);
    const emailMatch = item.email?.toLowerCase().includes(query);
    const subjectMatch = item.subject?.toLowerCase().includes(query);
    return nameMatch || emailMatch || subjectMatch;
  });

  const handleView = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6E9625]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1C2C1C]" style={{ fontFamily: "var(--font-bricolage)" }}>
            Contact Submissions
          </h1>
          <p className="text-[#555555] text-sm mt-1.5 font-medium">
            Manage and view your reported issues and inquiries.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[12px] border border-[#E5E5E5] text-[14px] outline-none focus:border-[#6E9625] transition-colors bg-white shadow-sm"
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-visible shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 text-[13px] font-bold text-[#555555] uppercase tracking-wider whitespace-nowrap">User Details</th>
                <th className="py-4 px-6 text-[13px] font-bold text-[#555555] uppercase tracking-wider whitespace-nowrap">Subject</th>
                <th className="py-4 px-6 text-[13px] font-bold text-[#555555] uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="py-4 px-6 text-[13px] font-bold text-[#555555] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-[13px] font-bold text-[#555555] uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1C2C1C] text-[15px]">{item.name || item.user?.fullName}</span>
                        <span className="text-[13px] text-[#555555] font-medium mt-0.5">{item.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-[#1C2C1C] text-[14px] whitespace-nowrap">{formatSubject(item.subject)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[13px] text-[#555555] font-medium whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <div className="flex items-center justify-end relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openDropdownId === item.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                              <button
                                onClick={() => handleView(item)}
                                className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#6E9625] flex items-center gap-2 transition-colors"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-[15px] font-bold text-[#1C2C1C]">No records found</p>
                      <p className="text-[13px] text-[#555555] mt-1">
                        {searchQuery ? "We couldn't find any submissions matching your search." : "You haven't submitted any forms yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-[20px] font-bold text-[#1C2C1C] flex items-center gap-3" style={{ fontFamily: "var(--font-bricolage)" }}>
                  Submission Details
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status}
                  </span>
                </h2>
                <p className="text-[13px] text-[#555555] mt-1.5 font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-[#6E9625]" />
                  Submitted on {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8]">
                  <p className="text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">Sender Name</p>
                  <p className="text-[15px] font-bold text-[#1C2C1C]">{selectedItem.name || selectedItem.user?.fullName}</p>
                </div>
                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8]">
                  <p className="text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-[15px] font-bold text-[#1C2C1C]">{selectedItem.email}</p>
                </div>
                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8] md:col-span-2">
                  <p className="text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-[15px] font-bold text-[#1C2C1C]">{formatSubject(selectedItem.subject)}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[16px] font-bold text-[#1C2C1C] mb-3 border-b border-gray-100 pb-2">Message</h3>
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 text-[14px] text-[#333333] leading-relaxed shadow-sm min-h-[120px]">
                  {selectedItem.message}
                </div>
              </div>

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div>
                  <h3 className="text-[16px] font-bold text-[#1C2C1C] mb-3 border-b border-gray-100 pb-2">Attachments</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedItem.attachments.map((att: any, idx: number) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl text-[13px] font-bold text-[#555555] hover:text-white hover:bg-[#6E9625] hover:border-[#6E9625] transition-all"
                      >
                        <Paperclip size={16} />
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#E5E5E5] bg-gray-50/50 rounded-b-[20px] flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-[#243A24] text-white rounded-[12px] font-bold text-[14px] hover:bg-[#1a2a1a] transition-all hover:scale-[1.02] shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
