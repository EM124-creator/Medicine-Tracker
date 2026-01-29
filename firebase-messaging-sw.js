// حفظ هذا الملف كـ firebase-messaging-sw.js في نفس مجلد المشروع

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyBAcSevspk9_fK4jC1ZkLRhRMNqG9Pv5mU",
  authDomain: "medicine-tracker-a8955.firebaseapp.com",
  projectId: "medicine-tracker-a8955",
  storageBucket: "medicine-tracker-a8955.firebasestorage.app",
  messagingSenderId: "507688371470",
  appId: "1:507688371470:web:e65375310a82e5ba83435f",
  measurementId: "G-SK8M4BFT6Q"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            { 
                action: 'take', 
                title: '✅ تم الأخذ',
                icon: '/check.png'
            },
            { 
                action: 'snooze', 
                title: '⏰ تأجيل 10 دقائق',
                icon: '/clock.png'
            }
        ],
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    const urlToOpen = new URL('/', self.location.origin).href;
    
    if (event.action === 'take') {
        // فتح الصفحة مع إجراء "تم الأخذ"
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
                return clients.openWindow('/?action=take_medication');
            })
        );
    } else if (event.action === 'snooze') {
        // فتح الصفحة مع إجراء "تأجيل"
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
                return clients.openWindow('/?action=snooze');
            })
        );
    } else {
        // فتح التطبيق
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
                return clients.openWindow('/');
            })
        );
    }
});

// معالجة الرسائل من الصفحة
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, options, time } = event.data;
        const now = Date.now();
        const delay = time - now;
        
        if (delay > 0) {
            setTimeout(() => {
                self.registration.showNotification(title, options);
            }, delay);
        }
    }
});