"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/utils/auth";

interface UseSocketProps {
  conversationId?: string | null;
  onNewMessage?: (message: any) => void;
  onUserOnline?: (data: { userId: string }) => void;
  onUserOffline?: (data: { userId: string }) => void;
  onTyping?: (data: { userId: string }) => void;
  onStopTyping?: () => void;
  onMessagesRead?: (data: { userId: string }) => void;
}

export function useSocket({
  conversationId,
  onNewMessage,
  onUserOnline,
  onUserOffline,
  onTyping,
  onStopTyping,
  onMessagesRead,
}: UseSocketProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep references to latest callbacks to avoid triggering useEffect on inline definitions
  const onNewMessageRef = useRef(onNewMessage);
  const onUserOnlineRef = useRef(onUserOnline);
  const onUserOfflineRef = useRef(onUserOffline);
  const onTypingRef = useRef(onTyping);
  const onStopTypingRef = useRef(onStopTyping);
  const onMessagesReadRef = useRef(onMessagesRead);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onUserOnlineRef.current = onUserOnline;
    onUserOfflineRef.current = onUserOffline;
    onTypingRef.current = onTyping;
    onStopTypingRef.current = onStopTyping;
    onMessagesReadRef.current = onMessagesRead;
  });

  // Connection handler (Run once on mount)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No access token found");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // Socket.io initialization options
    const socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      console.log("Socket connected:", socket.id);
      
      // Auto-join conversation on connect/reconnect if one is active
      if (conversationId) {
        socket.emit("joinConversation", { conversationId });
      }
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setError(err.message);
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    // Setup active listeners calling the refs
    socket.on("newMessage", (message) => {
      onNewMessageRef.current?.(message);
    });
    socket.on("userOnline", (data) => {
      onUserOnlineRef.current?.(data);
    });
    socket.on("userOffline", (data) => {
      onUserOfflineRef.current?.(data);
    });
    socket.on("typing", (data) => {
      onTypingRef.current?.(data);
    });
    socket.on("stopTyping", () => {
      onStopTypingRef.current?.();
    });
    socket.on("messagesRead", (data) => {
      onMessagesReadRef.current?.(data);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []); // Run once on mount

  // Separately handle joining rooms on conversationId changes
  useEffect(() => {
    if (socketRef.current && isConnected && conversationId) {
      console.log("Joining conversation room:", conversationId);
      socketRef.current.emit("joinConversation", { conversationId });
    }
  }, [conversationId, isConnected]);

  // Join a new conversation
  const joinConversation = useCallback((id: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("joinConversation", { conversationId: id });
    }
  }, [isConnected]);

  // Send a message via socket
  const sendMessage = useCallback((messageData: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("sendMessage", messageData);
    }
  }, [isConnected]);

  // Mark messages in conversation as read
  const markAsRead = useCallback((id: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("markAsRead", { conversationId: id });
    }
  }, [isConnected]);

  // Emit typing status
  const startTyping = useCallback((id: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing", { conversationId: id });
    }
  }, [isConnected]);

  // Emit stop typing status
  const stopTyping = useCallback((id: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("stopTyping", { conversationId: id });
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
}
