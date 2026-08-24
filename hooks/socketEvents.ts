/**
 * Centralized Socket.IO event name constants.
 * These match the exact backend event names — do NOT rename them.
 */
export const SOCKET_EVENTS = {
  // Connection lifecycle
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // Notifications
  NEW_NOTIFICATION: "newNotification",

  // Messaging / Chat
  NEW_MESSAGE: "newMessage",
  USER_ONLINE: "userOnline",
  USER_OFFLINE: "userOffline",
  TYPING: "typing",
  STOP_TYPING: "stopTyping",
  MESSAGES_READ: "messagesRead",

  // Jobs
  NEW_JOB: "newJob",
  JOB_UPDATED: "jobUpdated",

  // Quotes
  NEW_QUOTE: "newQuote",
  QUOTE_UPDATED: "quoteUpdated",

  // Dashboards
  TRADER_DASHBOARD_UPDATE: "traderDashboardUpdate",
  CUSTOMER_DASHBOARD_UPDATE: "customerDashboardUpdate",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
