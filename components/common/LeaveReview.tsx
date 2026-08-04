"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, ChevronDown, CheckCircle } from 'lucide-react';
import { getUserRole } from '@/utils/auth';
import { authApi } from '@/app/api/authApi';
import { Role } from '@/utils/role';
import toast from 'react-hot-toast';

export default function LeaveReview({ jobId: propJobId, reviewTypeProp }: { jobId?: string; reviewTypeProp?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const traderId = searchParams.get('traderId');
  const jobId = searchParams.get('jobId');
  const editReviewId = searchParams.get('editReviewId');
  const reviewCreatedAt = searchParams.get("createdAt");
  const hideWorkCarriedOut = searchParams.get('hideWorkCarriedOut') === 'true';

  const [workCarriedOut, setWorkCarriedOut] = useState<boolean>(searchParams.has('workCarriedOut') ? searchParams.get('workCarriedOut') === 'true' : true);
  const [rating, setRating] = useState<number>(parseInt(searchParams.get('rating') || '0'));
  const [hoverRating, setHoverRating] = useState<number>(0);

  const recommendParam = searchParams.get('recommend');
  const initialRecommend = recommendParam === 'true' ? true : recommendParam === 'false' ? false : null;
  const [recommend, setRecommend] = useState<boolean | null>(initialRecommend);

  const [selectedReason, setSelectedReason] = useState<string>(searchParams.get('noWorkReason') || '');
  const initialReviewType = searchParams.get('reviewType') || reviewTypeProp || (jobId ? 'JOB' : 'DIRECTORY');
  const [reviewType, setReviewType] = useState<string>(initialReviewType);
  const [interactionSource, setInteractionSource] = useState<string>(searchParams.get('interactionSource') || '');
  const [completionDate, setCompletionDate] = useState<string>(searchParams.get('completionDate') || '');
  const [title, setTitle] = useState<string>(searchParams.get('title') || '');
  const [review, setReview] = useState<string>(searchParams.get('review') || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [selectedTraderId, setSelectedTraderId] = useState<string>(searchParams.get('traderId') || '');
  const [traders, setTraders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('serviceUsed') || '');

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await authApi.searchTraders({ page: 1, limit: 100 });
        let tradersList = [];
        if (Array.isArray(res)) {
          tradersList = res;
        } else if (res?.data && Array.isArray(res.data)) {
          tradersList = res.data;
        } else if (res?.content && Array.isArray(res.content)) {
          tradersList = res.content;
        } else if (res?.data?.content && Array.isArray(res.data.content)) {
          tradersList = res.data.content;
        } else if (res?.traders && Array.isArray(res.traders)) {
          tradersList = res.traders;
        }
        setTraders(tradersList);
      } catch (err) {
        console.error("Failed to fetch traders", err);
      }
    };
    fetchTraders();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApi.getCategories();
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.content && Array.isArray(res.content)) {
          list = res.content;
        } else if (res?.data?.content && Array.isArray(res.data.content)) {
          list = res.data.content;
        }
        setCategories(list);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Pre-fill tradesperson and service from job data
  useEffect(() => {
    if (!jobId) return;
    const fetchJobDetails = async () => {
      try {
        const res = await authApi.getCustomerJobById(jobId);
        const job = res?.data || res;
        if (!job) return;

        // Pre-fill trader if not already set from URL
        if (!selectedTraderId && job.selectedTrader?.id) {
          setSelectedTraderId(job.selectedTrader.id);
        }

        // Pre-fill category from job's category
        if (!selectedCategory && job.category?.id) {
          setSelectedCategory(job.category.id);
        }

        // Pre-fill interaction source to Job Chat if not set
        if (!interactionSource) {
          setInteractionSource("JOB_CHAT");
        }
      } catch (err) {
        console.error("Failed to fetch job details for pre-fill", err);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (searchParams.has('workCarriedOut')) {
      setWorkCarriedOut(searchParams.get('workCarriedOut') === 'true');
    }
    if (searchParams.get('rating')) {
      setRating(parseInt(searchParams.get('rating') || '0', 10));
    }
    const rec = searchParams.get('recommend');
    if (rec !== null) {
      setRecommend(rec === 'true' ? true : rec === 'false' ? false : null);
    }
    if (searchParams.get('reviewType')) {
      setReviewType(searchParams.get('reviewType') || (jobId ? 'JOB' : 'DIRECTORY'));
    }
    if (searchParams.get('interactionSource')) {
      setInteractionSource(searchParams.get('interactionSource') || '');
    }
    if (searchParams.get('completionDate')) {
      setCompletionDate(searchParams.get('completionDate') || '');
    }
    if (searchParams.get('title')) {
      setTitle(searchParams.get('title') || '');
    }
    if (searchParams.get('review')) {
      setReview(searchParams.get('review') || '');
    }
    if (searchParams.get('noWorkReason')) {
      setSelectedReason(searchParams.get('noWorkReason') || '');
    }
    if (searchParams.get('traderId')) {
      setSelectedTraderId(searchParams.get('traderId') || '');
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const reasons = [
    { id: 'TRADER_DIDNT_RESPOND', label: "Trader didn't respond", desc: "I reached out but never heard back from them." },
    { id: 'TRADER_DECLINED_JOB', label: "Trader declined the job", desc: "They responded but were unavailable." },
    { id: 'TRADER_MISSED_APPOINTMENT', label: "Missed appointment", desc: "Professional failed to show up for the visit." },
    { id: 'QUOTE_OVER_BUDGET', label: "Quote over budget", desc: "The pricing was higher than anticipated." },
    { id: 'WANTED_QUOTE_ONLY', label: "Wanted a quote", desc: "Just getting rough prices." },
    { id: 'JOB_NO_LONGER_NEEDED', label: "No longer needed/changed my mind", desc: "Plans have changed." },
    { id: 'BETTER_PRICE_ELSEWHERE', label: "Hired elsewhere", desc: "Found another professional for the work." },
    { id: 'OTHER', label: "Other reason", desc: "None of the above apply." }
  ];

  const canEditReview = React.useMemo(() => {
    if (!editReviewId || !reviewCreatedAt) return true;

    const created = new Date(reviewCreatedAt).getTime();
    const now = Date.now();

    const diffHours = (now - created) / (1000 * 60 * 60);

    return diffHours <= 48;
  }, [editReviewId, reviewCreatedAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (workCarriedOut && rating === 0) {
      setError('Please provide a rating.');
      return;
    }

    if (workCarriedOut && reviewType === 'DIRECTORY' && files.length === 0) {
      toast.error('Proof of work (upload files) is required for directory reviews.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();

      if (!editReviewId) {
        const finalTraderId = selectedTraderId && selectedTraderId !== '00000000-0000-0000-0000-000000000000' ? selectedTraderId : '00000000-0000-0000-0000-000000000000';
        payload.append("traderId", finalTraderId);
        const finalJobId = jobId || propJobId;
        if (finalJobId && finalJobId !== '00000000-0000-0000-0000-000000000000') {
          payload.append("jobId", finalJobId);
        }
        if (reviewType) payload.append("reviewType", reviewType);
        if (interactionSource) payload.append("interactionSource", interactionSource);
      }

      payload.append("wasWorkCompleted", String(workCarriedOut));

      if (workCarriedOut) {
        payload.append("rating", String(rating));
        if (completionDate) {
          payload.append("workCompletedDate", new Date(completionDate).toISOString());
        }
        if (recommend !== null) payload.append("wouldRecommendTrader", String(recommend));
        if (title) payload.append("title", title);
        if (review) payload.append("review", review);

        if (files.length > 0) {
          files.forEach(f => payload.append("proofs", f));
        }
      } else {
        if (selectedReason) payload.append("noWorkReason", selectedReason);
        if (rating > 0) payload.append("rating", String(rating));
      }

      if (editReviewId) {
        await authApi.updateReview(editReviewId, payload);
      } else {
        await authApi.postReview(payload);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      const msg: string = err?.message || '';
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setError('Your session has expired. Please log in again and retry.');
      } else {
        setError(msg || 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = () => {
    const role = getUserRole()?.toLowerCase();
    if (role === Role.Customer.toLowerCase()) {
      router.push('/customer-dashboard/jobs');
    } else {
      router.push('/directory-listing/search');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100 my-10 relative">
      <h2 className="text-[24px] font-bold text-[#1C2C1C] mb-2">
        {editReviewId ? "Edit Your Review" : workCarriedOut ? "Share Your Experience" : "Why Was the Job Closed?"}
      </h2>
      <p className="text-gray-500 text-[14px] mb-8">
        {workCarriedOut
          ? "Your feedback helps maintain our high standards of quality."
          : "This helps us improve our matchmaking and professional network."}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {!!editReviewId && !canEditReview && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          This review can no longer be edited. Reviews can only be edited within 48 hours of submission.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Select Tradesperson / Company <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50] appearance-none"
              required
            >
              <option value="">Select Tradesperson / Company</option>
              {traders.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.companyName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown Company'}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Interaction Source</label>
          <div className="relative">
            <select
              value={interactionSource}
              onChange={(e) => setInteractionSource(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50] appearance-none"
            >
              <option value="">Select source</option>
              <option value="JOB_CHAT">Job Chat</option>
              <option value="DIRECTORY_CHAT">Directory Chat</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE">Phone</option>
              <option value="MANUAL">Manual</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>


        {!hideWorkCarriedOut && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1C2C1C] text-[15px]">Was the work carried out? <span className="text-red-500">*</span></h3>
                <p className="text-[13px] text-gray-500 mt-1">Confirm if any work was started or completed.</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setWorkCarriedOut(true)}
                  className={`px-5 py-2 text-[14px] font-semibold rounded-full transition-colors ${workCarriedOut ? 'bg-white text-[#1C2C1C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWorkCarriedOut(false)}
                  className={`px-5 py-2 text-[14px] font-semibold rounded-full transition-colors ${!workCarriedOut ? 'bg-white text-[#1C2C1C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <hr className="border-gray-100 mb-8" />

        {workCarriedOut ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Completion Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Services Used</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50] appearance-none"
                  >
                    <option value="">Select a service</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-8 text-center border border-gray-100">
              <h3 className="text-[15px] font-semibold text-[#1C2C1C] mb-4">How would you rate the professional?</h3>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`${star <= (hoverRating || rating)
                        ? 'text-[#6E9625] fill-[#6E9625]'
                        : 'text-[#E5E7EB] fill-[#E5E7EB]'
                        } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[13px] font-bold text-[#6E9625]">
                  {rating.toFixed(1)} {rating >= 4 ? 'Excellent Quality' : rating >= 3 ? 'Good Quality' : 'Poor Quality'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exceptional craftsmanship and attention to detail"
                className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">Tell us more about your experience</label>
              <textarea
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="How was the communication? Was the workspace kept clear?"
                className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] text-gray-700 outline-none focus:border-[#4CAF50] resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1C2C1C] mb-2">
                Upload Files {reviewType === 'DIRECTORY' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <label className="block border-2 border-dashed border-[#E5E7EB] hover:border-[#6E9625] bg-gray-50/50 rounded-xl p-8 text-center cursor-pointer transition-colors w-1/2">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-[14px] font-semibold text-[#1C2C1C] mb-1">Drop file or Browse</p>
                <p className="text-[12px] text-gray-500">Format: pdf, docx, doc &<br />Max file size: 25 MB</p>
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-2 w-1/2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[12px] text-[#1C2C1C] bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                      <span className="truncate mr-2 font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 flex-shrink-0 font-bold"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[14px] font-semibold text-[#1C2C1C]">Recommend this Tradesperson?</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13px] font-bold transition-colors ${recommend === true
                    ? 'border-[#6E9625] text-[#6E9625] bg-[#F8F9F5]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <ThumbsUp size={16} className={recommend === true ? 'text-[#6E9625]' : 'text-gray-400'} />
                  Recommended
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13px] font-bold transition-colors ${recommend === false
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <ThumbsDown size={16} className={recommend === false ? 'text-red-500' : 'text-gray-400'} />
                  Don't Recommend
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || (!!editReviewId && !canEditReview)}
                className="px-8 py-3.5 bg-[#1C2C1C] text-white rounded-xl text-[14px] font-bold flex items-center gap-2 hover:bg-[#2c3e2c] transition-colors disabled:opacity-50"
              >
                {editReviewId
                  ? isSubmitting
                    ? "Updating..."
                    : "Update Review"
                  : isSubmitting
                    ? "Submitting..."
                    : "Submit →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  className={`text-left p-5 rounded-xl border transition-all ${selectedReason === reason.id
                    ? 'border-[#6E9625] bg-[#F8F9F5]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedReason === reason.id ? 'border-[#6E9625]' : 'border-gray-300'
                      }`}>
                      {selectedReason === reason.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6E9625]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1C2C1C] mb-1">{reason.label}</h4>
                      <p className="text-[12px] text-gray-500">{reason.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50/50 rounded-xl p-8 text-center border border-gray-100">
              <h3 className="text-[15px] font-semibold text-[#1C2C1C] mb-4">How would you rate the professional?</h3>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`${star <= (hoverRating || rating)
                        ? 'text-[#6E9625] fill-[#6E9625]'
                        : 'text-[#E5E7EB] fill-[#E5E7EB]'
                        } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[13px] font-bold text-[#6E9625]">
                  {rating.toFixed(1)} {rating >= 4 ? 'Excellent Quality' : rating >= 3 ? 'Good Quality' : 'Poor Quality'}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="px-8 py-3.5 bg-[#1C2C1C] text-white rounded-xl text-[14px] font-bold flex items-center gap-2 hover:bg-[#2c3e2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editReviewId
                  ? isSubmitting
                    ? "Updating..."
                    : "Update Review"
                  : isSubmitting
                    ? "Submitting..."
                    : "Submit →"}
              </button>
            </div>
          </div>
        )}
      </form>

      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-[24px] p-10 max-w-md w-full mx-auto shadow-xl text-center">
            <div className="w-20 h-20 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-[#6E9625]" />
            </div>
            <h2 className="text-[28px] font-bold text-[#1C2C1C] mb-3">Review Submitted!</h2>
            <p className="text-gray-600 mb-8 text-[15px]">
              Your review has been submitted successfully. Thank you for your valuable feedback!
            </p>
            <button
              onClick={handleReturn}
              className="w-full px-8 py-3.5 bg-[#1C2C1C] text-white rounded-xl text-[14px] font-bold hover:bg-[#2c3e2c] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
