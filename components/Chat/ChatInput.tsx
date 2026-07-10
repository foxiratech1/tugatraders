"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send, X, File } from "lucide-react";
import toast from "react-hot-toast";

interface ChatInputProps {
  onSendMessage: (text: string, file: File | null) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear preview URL on cleanup
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size cannot exceed 3MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || sending || disabled) return;

    try {
      setSending(true);
      // Immediately stop typing indicator on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onStopTyping();

      await onSendMessage(text.trim(), selectedFile);
      setText("");
      handleRemoveFile();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 p-2 bg-[#F9FAFB] rounded-xl border border-gray-100 max-w-sm animate-fadeIn">
          {filePreview ? (
            <img
              src={filePreview}
              alt="Upload preview"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <File size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#1C2C1C] truncate">
              {selectedFile.name}
            </p>
            <p className="text-[10px] text-gray-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 bg-[#F9FAFB] border border-gray-200 rounded-2xl px-4 py-2 hover:border-[#6E9625] transition-all">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors flex-shrink-0"
          disabled={disabled || sending}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />

        {/* Input Text Box */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder={disabled ? "Select a conversation to start chatting" : "Type your message here..."}
          className="flex-1 bg-transparent border-0 outline-none text-[14px] text-[#1C2C1C] placeholder-gray-400 py-1"
          disabled={disabled || sending}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || sending || disabled}
          className={`p-2.5 rounded-full flex-shrink-0 transition-all ${
            (!text.trim() && !selectedFile) || sending || disabled
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-[#6E9625] text-white hover:bg-[#5E831E] active:scale-95 shadow-sm"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
}
