// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// تهيئة Firebase في Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBAcSevspk9_fK4jC1ZkLRhRMNqG9Pv5mU",
  authDomain: "medicine-tracker-a8955.firebaseapp.com",
  databaseURL: "https://medicine-tracker-a8955-default-rtdb.firebaseio.com",
  projectId: "medicine-tracker-a8955",
  storageBucket: "medicine-tracker-a8955.firebasestorage.app",
  messagingSenderId: "507688371470",
  appId: "1:507688371470:web:e65375310a82e5ba83435f",
  measurementId: "G-SK8M4BFT6Q"
});

const messaging = firebase.messaging();

// معالجة الرسائل في الخلفية
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || '⏰ وقت الدواء!';
    const notificationOptions = {
        body: payload.notification?.body || 'حان وقت أخذ الدواء',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            { 
                action: 'take', 
                title: '✅ تم الأخذ'
            },
            { 
                action: 'snooze', 
                title: '⏰ تأجيل'
            }
        ],
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// معالجة نقر الإشعار
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    const urlToOpen = new URL('/index.html', self.location.origin).href;
    
    if (event.action === 'take') {
        // فتح التطبيق مع إجراء "تم الأخذ"
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        client.focus();
                        client.postMessage({
                            type: 'TAKE_MEDICATION',
                            data: event.notification.data
                        });
                        return;
                    }
                }
                return clients.openWindow('/index.html?action=take');
            })
        );
    } else if (event.action === 'snooze') {
        // فتح التطبيق مع إجراء "تأجيل"
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        client.focus();
                        client.postMessage({
                            type: 'SNOOZE_MEDICATION',
                            data: event.notification.data
                        });
                        return;
                    }
                }
                return clients.openWindow('/index.html?action=snooze');
            })
        );
    } else {
        // فتح التطبيق فقط
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow('/index.html');
            })
        );
    }
});

// معالجة رسائل البث من الصفحة
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, time, data } = event.data;
        const delay = time - Date.now();
        
        if (delay > 0) {
            setTimeout(() => {
                self.registration.showNotification(title, {
                    body: body,
                    icon: '/icon-192x192.png',
                    data: data
                });
            }, delay);
        }
    }
});

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(clients.claim());
});