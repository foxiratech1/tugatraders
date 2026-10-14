"use client";

import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import { ChevronUp, ChevronDown } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);
  const [showScrollButtons, setShowScrollButtons] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isOverflow = scrollHeight > clientHeight + 10;
    setShowScrollButtons(isOverflow);
    setCanScrollUp(scrollTop > 20);
    setCanScrollDown(scrollHeight - scrollTop - clientHeight > 20);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(checkScroll, 150);
    return () => clearTimeout(timer);
  }, [messages, isTyping, checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const handleScrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -350, behavior: "smooth" });
    }
  };

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 350, behavior: "smooth" });
    }
  };

  const handleScrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex-1 relative bg-[#F9FAFB] overflow-hidden flex flex-col">
      <div
        className="flex-1 overflow-y-auto pt-4 pl-4 pr-16 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        ref={scrollRef}
        onScroll={checkScroll}
      >
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

            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Floating Scroll Up/Down Button Widget */}
      {showScrollButtons && (
        <div className="absolute right-3.5 bottom-3.5 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200/90 p-1 gap-1 z-20">
          <button
            type="button"
            onClick={handleScrollUp}
            onDoubleClick={handleScrollToTop}
            disabled={!canScrollUp}
            title="Scroll up (Double-click to go to top)"
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${canScrollUp
              ? "text-[#1C2C1C] hover:bg-gray-100 hover:text-[#6E9625] active:scale-95 cursor-pointer shadow-2xs"
              : "text-gray-300 cursor-not-allowed opacity-40"
              }`}
          >
            <ChevronUp size={16} />
          </button>
          <div className="w-3.5 h-[1px] bg-gray-200" />
          <button
            type="button"
            onClick={handleScrollDown}
            onDoubleClick={handleScrollToBottom}
            disabled={!canScrollDown}
            title="Scroll down (Double-click to go to bottom)"
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${canScrollDown
              ? "text-[#1C2C1C] hover:bg-gray-100 hover:text-[#6E9625] active:scale-95 cursor-pointer shadow-2xs"
              : "text-gray-300 cursor-not-allowed opacity-40"
              }`}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
