import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import toast from "react-hot-toast";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWCgsWU7E6CZQk9NMmzpsfJ-Z9ixF6VCg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tuga-trader.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tuga-trader",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tuga-trader.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "343539162860",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:343539162860:web:4c4327b20e784b47ed0fc9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5E6ZL3X06P",
};

export const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  "BNpzEePIFi7thHB5jqn5GqfoGInmEeiuebh6kKott9l1vNuKnHMKH44L24bazuwdndJafVSyUAZGbxrA1dUg7J8";

// Initialize Firebase App instance safely (singleton)
export const getFirebaseApp = (): FirebaseApp => {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

let cachedFcmToken: string | null = null;

/**
 * Requests notification permission (if needed) and generates an FCM device token.
 * If the VAPID key changed or forceRefresh is true, invalidates and deletes the old token
 * from Firebase before generating a new one.
 * 
 * @param timeoutMs Maximum milliseconds to wait for the token generation from Firebase
 * @param forceRefresh Set to true to force generating a new token
 * @returns FCM token string or null if unavailable/denied/timed out
 */
export const getFcmToken = async (timeoutMs = 10000, forceRefresh = false): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  // Check if VAPID key changed compared to the one used for the stored token
  let storedVapid: string | null = null;
  try {
    storedVapid = localStorage.getItem("fcm_vapid_key");
  } catch { }

  const vapidKeyChanged = storedVapid && storedVapid !== VAPID_KEY;

  if (vapidKeyChanged || forceRefresh) {
    console.log("[FCM] VAPID key changed or refresh requested. Invalidating old token cache...");
    cachedFcmToken = null;
    try {
      localStorage.removeItem("fcm_token");
      localStorage.removeItem("fcm_vapid_key");
    } catch { }
  } else {
    // If VAPID key didn't change and we have a cached or stored token, return it immediately
    if (cachedFcmToken) {
      return cachedFcmToken;
    }
    try {
      const storedToken = localStorage.getItem("fcm_token");
      if (storedToken) {
        cachedFcmToken = storedToken;
        return storedToken;
      }
    } catch { }
  }

  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.warn("[FCM] Push notifications or service workers not supported in this browser.");
      return null;
    }

    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.warn("[FCM] Firebase Messaging is not supported in this browser environment.");
      return null;
    }

    // Check or request notification permission
    let permission = Notification.permission;
    if (permission === "default") {
      console.log("[FCM] Requesting notification permission from user...");
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn(`[FCM] Notification permission was not granted (current status: "${permission}").`);
      return null;
    }

    // Register service worker if needed
    let swRegistration: ServiceWorkerRegistration | undefined;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (swError) {
      console.warn("[FCM] Service worker registration warning:", swError);
    }

    const app = getFirebaseApp();
    const messaging: Messaging = getMessaging(app);

    // If VAPID key changed or refresh requested, delete old token from Firebase IndexedDB
    if (vapidKeyChanged || forceRefresh) {
      try {
        console.log("[FCM] Deleting old Firebase token from IndexedDB...");
        await deleteToken(messaging);
      } catch (delErr) {
        console.warn("[FCM] Warning deleting old token:", delErr);
      }
    }

    // Fetch token with timeout
    const tokenPromise = getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`[FCM] Firebase token generation timed out after ${timeoutMs}ms.`);
        resolve(null);
      }, timeoutMs)
    );

    const token = await Promise.race([tokenPromise, timeoutPromise]);

    if (token) {
      console.log("[FCM] Generated FCM Token successfully with current VAPID key:", token);
      cachedFcmToken = token;
      try {
        localStorage.setItem("fcm_token", token);
        localStorage.setItem("fcm_vapid_key", VAPID_KEY);
      } catch { }
      return token;
    }

    console.warn("[FCM] No token returned by Firebase.");
    return null;
  } catch (error) {
    console.error("[FCM] Error obtaining FCM token:", error);
    return null;
  }
};

/**
 * Force generates a brand new token by clearing the cache and calling deleteToken on Firebase.
 */
export const refreshFcmToken = async (): Promise<string | null> => {
  return getFcmToken(10000, true);
};

/**
 * Proactively attempts to obtain the FCM token if the browser already has notification permissions granted.
 * This runs silently in the background without prompting the user.
 */
export const prefetchFcmToken = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (Notification.permission === "granted") {
    return getFcmToken(10000);
  }
  return null;
};

/**
 * Displays a native browser notification popup for foreground notifications.
 */
export const showBrowserNotification = async (payload: any) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const title = payload?.notification?.title || payload?.data?.title || "Tuga Traders";
  const body = payload?.notification?.body || payload?.data?.body || "";
  const icon = payload?.notification?.icon || payload?.data?.icon || "/TugaLogo.png";
  const image = payload?.notification?.image || payload?.data?.image;

  const options: NotificationOptions = {
    body,
    icon,
    ...(image ? { image } : {}),
    data: payload?.data || {},
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
    // Fallback to Notification constructor
    new Notification(title, options);
  } catch (err) {
    console.warn("[FCM] Error displaying native notification:", err);
    try {
      new Notification(title, options);
    } catch { }
  }
};

/**
 * Helper to listen for foreground messages with console logging and native popup.
 */
export const onForegroundMessage = (callback?: (payload: any) => void) => {
  if (typeof window === "undefined") return () => { };
  try {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("🔥 [FCM Foreground Message]:", payload);

      // Trigger native browser notification popup
      showBrowserNotification(payload);

      // Trigger in-app toast notification
      const title = payload?.notification?.title || payload?.data?.title;
      const body = payload?.notification?.body || payload?.data?.body;
      if (title || body) {
        toast(`${title ? title + "\n" : ""}${body || ""}`, {
          icon: "🔔",
          duration: 5000,
        });
      }

      if (callback) callback(payload);
    });
  } catch (error) {
    console.warn("[FCM] Error setting up foreground message listener:", error);
    return () => { };
  }
};

/**
 * Helper to listen for background messages forwarded from the Service Worker.
 */
export const onBackgroundMessage = (callback?: (payload: any) => void) => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => { };
  const handler = (event: MessageEvent) => {
    if (event.data?.type === "FCM_BACKGROUND_MESSAGE") {
      console.log("🔔 [FCM Background Message]:", event.data.payload);
      if (callback) callback(event.data.payload);
    }
  };
  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
};

let listenersInitialized = false;

/**
 * Automatically initializes both Foreground and Background FCM message listeners
 * so incoming notifications are immediately logged in the browser console.
 */
export const initFcmListeners = async () => {
  if (typeof window === "undefined" || listenersInitialized) return;
  listenersInitialized = true;

  // 1. Background message listener (from service worker)
  onBackgroundMessage();

  // 2. Foreground message listener (from Firebase Web SDK)
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) return;
    onForegroundMessage();
    console.log("[FCM] Foreground & Background message listeners initialized.");
  } catch (err) {
    console.warn("[FCM] Error initializing FCM listeners:", err);
  }
};

// Initialize listeners automatically in the browser
if (typeof window !== "undefined") {
  initFcmListeners();
  (window as any).getFcmToken = getFcmToken;
  (window as any).refreshFcmToken = refreshFcmToken;
  (window as any).onForegroundMessage = onForegroundMessage;
  (window as any).onBackgroundMessage = onBackgroundMessage;
}
