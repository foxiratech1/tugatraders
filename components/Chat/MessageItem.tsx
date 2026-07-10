"use client";

import React, { useState } from "react";
import { Download, FileText, Check, CheckCheck, X } from "lucide-react";

interface Attachment {
  path: string;
  name?: string;
}

interface Message {
  id?: string;
  _id?: string;
  senderId: string;
  sender?: {
    fullName: string;
    profileImage?: string | null;
  };
  message?: string;
  attachment?: string | null;
  attachments?: string[] | null;
  createdAt: string;
  isRead?: boolean;
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export default function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isSender = message.senderId === currentUserId;
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Determine attachments
  const allAttachments: string[] = [];
  if (message.attachments && message.attachments.length > 0) {
    allAttachments.push(...message.attachments);
  } else if (message.attachment) {
    allAttachments.push(message.attachment);
  }

  const getAttachmentUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // Avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
  };

  const isImage = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
  };

  const getFileName = (path: string) => {
    return path.split("/").pop() || "Attachment";
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className={`flex flex-col mb-4 ${isSender ? "items-end" : "items-start"}`}>
      {/* Bubble Container */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isSender
            ? "bg-[#1C2C1C] text-white rounded-tr-none"
            : "bg-white text-[#1C2C1C] border border-gray-100 rounded-tl-none"
        }`}
      >
        {/* Sender Name (only for received messages) */}
        {!isSender && message.sender?.fullName && (
          <p className="text-[11px] font-bold text-[#6E9625] mb-1">
            {message.sender.fullName}
          </p>
        )}

        {/* Text Message */}
        {message.message && (
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </p>
        )}

        {/* Attachments */}
        {allAttachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {allAttachments.map((filePath, index) => {
              const fileUrl = getAttachmentUrl(filePath);
              if (isImage(filePath)) {
                return (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-100/10">
                    <img
                      src={fileUrl}
                      alt="Uploaded image"
                      onClick={() => setFullscreenImage(fileUrl)}
                      className="max-w-full max-h-60 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        // fallback or hide image if error
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <a
                    key={index}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-[12px] font-medium transition-colors ${
                      isSender
                        ? "bg-[#2A3C2A] border-[#3B4E3B] text-emerald-100 hover:bg-[#344934]"
                        : "bg-gray-50 border-gray-150 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText size={16} />
                    <span className="truncate flex-1 max-w-[150px]">
                      {getFileName(filePath)}
                    </span>
                    <Download size={14} className="flex-shrink-0" />
                  </a>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Message Metadata */}
      <div className="flex items-center justify-end gap-1 mt-1 px-1">
        <span className="text-[10px] text-gray-400">
          {formatTime(message.createdAt)}
        </span>
        {isSender && (
          <span className="text-gray-400 flex items-center">
            {message.isRead ? (
              <CheckCheck size={14} className="text-[#4CAF50]" />
            ) : (
              <Check size={14} />
            )}
          </span>
        )}
      </div>
      
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <X size={24} />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
