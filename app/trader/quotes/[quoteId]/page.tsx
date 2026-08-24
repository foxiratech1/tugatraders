"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";

interface QuoteDetail {
  id: string;
  status: string;
  price?: string | number;
  estimatedDays?: number;
  message?: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
  job?: {
    id: string;
    title: string;
    postcode?: string;
  };
}

export default function TraderQuoteDetailPage() {
  const { quoteId } = useParams() as { quoteId: string };
  const router = useRouter();

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useSocket({
    onQuoteUpdated: (updated) => {
      if (!updated) return;
      setQuote((prev) => {
        if (prev && (prev.id === updated.id || prev.job?.id === updated.jobId || prev.job?.id === updated.job?.id)) {
          return { ...prev, ...updated };
        }
        return prev;
      });
    },
  });

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Route Quote ID:", quoteId);

        const res = await authApi.getMyQuoteByJobId(quoteId);

        console.log("Quote API Response:", res);

        setQuote(res?.data || res);
      } catch (error) {
        console.error("Failed to fetch quote", error);
        toast.error("Failed to load quote details");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading quote...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Quote not found.</p>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#243A24] text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9F5] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#6E9625] hover:text-[#4A6B0A] mb-6"
        >
          <ArrowLeft size={16} />
          Back to Quotes
        </button>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1C2C1C] mb-6">
            {quote.job?.title || "Quote Details"}
          </h1>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-lg">{quote.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Quoted Price</p>
              <p className="font-bold text-2xl text-[#1C2C1C]">
                {quote.price
                  ? new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                  }).format(Number(quote.price))
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estimated Days</p>
              <p className="font-medium">
                {quote.estimatedDays ?? "—"} Days
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Message</p>
              <p className="whitespace-pre-wrap">
                {quote.message || "No message provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p>
                {new Date(quote.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>

            {quote.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p>
                  {new Date(quote.updatedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            )}

            {quote.job?.postcode && (
              <div>
                <p className="text-sm text-gray-500">Postcode</p>
                <p>{quote.job.postcode}</p>
              </div>
            )}

            {/* Attachments */}
            {Array.isArray(quote.attachments) && quote.attachments.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                  <Paperclip size={14} />
                  Attachments ({quote.attachments.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {quote.attachments.map((att: any, idx: number) => {
                    // API may return objects { url, file, path } or plain strings
                    let url: string = typeof att === "string"
                      ? att
                      : (att?.url || att?.file || att?.path || "");
                    if (url.startsWith("undefined")) url = url.replace("undefined", "");
                    const rawBase = process.env.NEXT_PUBLIC_API_URL || "";
                    const baseUrl = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
                    const fullUrl = url.startsWith("http")
                      ? url
                      : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
                    const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                    const fileName = url.substring(url.lastIndexOf("/") + 1) || `attachment-${idx + 1}`;

                    return (
                      <a
                        key={idx}
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block w-[120px] rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#6E9625] hover:shadow-md transition-all"
                      >
                        {isImage ? (
                          <img
                            src={fullUrl}
                            alt={fileName}
                            className="w-full h-[80px] object-cover"
                          />
                        ) : (
                          <div className="w-full h-[80px] bg-gray-50 flex items-center justify-center">
                            <FileText size={28} className="text-gray-400 group-hover:text-[#6E9625] transition-colors" />
                          </div>
                        )}
                        <div className="px-2 py-1.5">
                          <p className="text-[11px] text-[#1C2C1C] font-medium truncate">{fileName}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}