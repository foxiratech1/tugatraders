// Scripts for firebase and firebase messaging in service worker
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAWCgsWU7E6CZQk9NMmzpsfJ-Z9ixF6VCg",
  authDomain: "tuga-trader.firebaseapp.com",
  projectId: "tuga-trader",
  storageBucket: "tuga-trader.firebasestorage.app",
  messagingSenderId: "343539162860",
  appId: "1:343539162860:web:4c4327b20e784b47ed0fc9",
  measurementId: "G-5E6ZL3X06P"
};

// Immediate activation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [FCM Service Worker] Background message received:', payload);

  // Broadcast background message to all open window tabs so utils/firebase.ts can log it
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'FCM_BACKGROUND_MESSAGE',
        payload: payload,
      });
    });
  });

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tuga Traders';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || payload.data?.icon || '/TugaLogo.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Focus or open window on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
