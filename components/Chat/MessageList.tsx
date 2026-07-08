"use client";

import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

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
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  traderName?: string;
}

export default function MessageList({
  messages,
  currentUserId,
  isTyping,
  traderName = "Trader",
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#F9FAFB]">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          
        </div>
      ) : (
        <div className="flex flex-col">
          {messages.map((msg, index) => (
            <MessageItem
              key={msg.id || msg._id || index}
              message={msg}
              currentUserId={currentUserId}
            />
          ))}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex flex-col items-start mb-4 animate-pulse">
              <div className="bg-white border border-gray-100 text-[#1C2C1C] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[70%]">
                <p className="text-[11px] font-bold text-[#6E9625] mb-1">
                  {traderName}
                </p>
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
