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
  onNewNotification?: (notification: any) => void;
  onNewQuote?: (quote: any) => void;
  onQuoteUpdated?: (quote: any) => void;
  onJobUpdated?: (job: any) => void;
  onNewJob?: (job: any) => void;
  onTraderDashboardUpdate?: (data: any) => void;
  onCustomerDashboardUpdate?: (data: any) => void;
}

// Global socket variables for singleton pattern
let globalSocket: Socket | null = null;
let connectionCount = 0;

export function useSocket({
  conversationId,
  onNewMessage,
  onUserOnline,
  onUserOffline,
  onTyping,
  onStopTyping,
  onMessagesRead,
  onNewNotification,
  onNewQuote,
  onQuoteUpdated,
  onJobUpdated,
  onNewJob,
  onTraderDashboardUpdate,
  onCustomerDashboardUpdate,
}: UseSocketProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep references to latest callbacks
  const onNewMessageRef = useRef(onNewMessage);
  const onUserOnlineRef = useRef(onUserOnline);
  const onUserOfflineRef = useRef(onUserOffline);
  const onTypingRef = useRef(onTyping);
  const onStopTypingRef = useRef(onStopTyping);
  const onMessagesReadRef = useRef(onMessagesRead);
  const onNewNotificationRef = useRef(onNewNotification);
  const onNewQuoteRef = useRef(onNewQuote);
  const onQuoteUpdatedRef = useRef(onQuoteUpdated);
  const onJobUpdatedRef = useRef(onJobUpdated);
  const onNewJobRef = useRef(onNewJob);
  const onTraderDashboardUpdateRef = useRef(onTraderDashboardUpdate);
  const onCustomerDashboardUpdateRef = useRef(onCustomerDashboardUpdate);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onUserOnlineRef.current = onUserOnline;
    onUserOfflineRef.current = onUserOffline;
    onTypingRef.current = onTyping;
    onStopTypingRef.current = onStopTyping;
    onMessagesReadRef.current = onMessagesRead;
    onNewNotificationRef.current = onNewNotification;
    onNewQuoteRef.current = onNewQuote;
    onQuoteUpdatedRef.current = onQuoteUpdated;
    onJobUpdatedRef.current = onJobUpdated;
    onNewJobRef.current = onNewJob;
    onTraderDashboardUpdateRef.current = onTraderDashboardUpdate;
    onCustomerDashboardUpdateRef.current = onCustomerDashboardUpdate;
  });

  // Connection handler (Run once on mount)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No access token found");
      return;
    }

    if (!globalSocket) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      globalSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    connectionCount++;
    const socket = globalSocket;
    socketRef.current = socket;

    // Check initial status
    if (socket.connected) {
      setIsConnected(true);
      if (conversationId) {
        socket.emit("joinConversation", { conversationId });
      }
    }

    // Listener functions
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      console.log("Socket connected:", socket.id);
      if (conversationId) {
        socket.emit("joinConversation", { conversationId });
      }
    };

    const handleConnectError = (err: any) => {
      setIsConnected(false);
      setError(err.message);
      console.error("Socket connection error:", err.message);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    };

    const handleNewMessage = (message: any) => onNewMessageRef.current?.(message);
    const handleUserOnline = (data: any) => onUserOnlineRef.current?.(data);
    const handleUserOffline = (data: any) => onUserOfflineRef.current?.(data);
    const handleTyping = (data: any) => onTypingRef.current?.(data);
    const handleStopTyping = () => onStopTypingRef.current?.();
    const handleMessagesRead = (data: any) => onMessagesReadRef.current?.(data);
    const handleNewNotification = (data: any) => onNewNotificationRef.current?.(data);
    const handleNewQuote = (data: any) => onNewQuoteRef.current?.(data);
    const handleQuoteUpdated = (data: any) => onQuoteUpdatedRef.current?.(data);
    const handleJobUpdated = (data: any) => onJobUpdatedRef.current?.(data);
    const handleNewJob = (data: any) => onNewJobRef.current?.(data);
    const handleTraderDashboardUpdate = (data: any) => onTraderDashboardUpdateRef.current?.(data);
    const handleCustomerDashboardUpdate = (data: any) => onCustomerDashboardUpdateRef.current?.(data);

    // Setup active listeners
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("newMessage", handleNewMessage);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("newNotification", handleNewNotification);
    socket.on("newQuote", handleNewQuote);
    socket.on("quoteUpdated", handleQuoteUpdated);
    socket.on("jobUpdated", handleJobUpdated);
    socket.on("newJob", handleNewJob);
    socket.on("traderDashboardUpdate", handleTraderDashboardUpdate);
    socket.on("customerDashboardUpdate", handleCustomerDashboardUpdate);

    return () => {
      // Remove listeners specific to this component instance
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("newMessage", handleNewMessage);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("newNotification", handleNewNotification);
      socket.off("newQuote", handleNewQuote);
      socket.off("quoteUpdated", handleQuoteUpdated);
      socket.off("jobUpdated", handleJobUpdated);
      socket.off("newJob", handleNewJob);
      socket.off("traderDashboardUpdate", handleTraderDashboardUpdate);
      socket.off("customerDashboardUpdate", handleCustomerDashboardUpdate);

      connectionCount--;
      if (connectionCount === 0) {
        socket.disconnect();
        globalSocket = null;
      }
      
      socketRef.current = null;
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
