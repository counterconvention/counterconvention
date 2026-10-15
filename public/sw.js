// Service Worker for Áurea Moda Feminina - Background Notifications
const SW_VERSION = 'v1.0.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from client tabs to display notifications directly in SW thread
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SHOW_NOTIFICATION' || event.data.type === 'NEW_ORDER')) {
    const title = event.data.title || '🛍️ Novo Pedido Recebido!';
    const options = {
      body: event.data.body || 'Um novo pedido foi finalizado via WhatsApp.',
      icon: event.data.icon || '/favicon.ico',
      badge: event.data.badge || event.data.icon || '/favicon.ico',
      tag: event.data.tag || `order-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [250, 100, 250, 100, 250],
      data: event.data.data || { url: '/' }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '🛍️ Novo Pedido Recebido!',
    body: 'Um novo pedido foi finalizado via WhatsApp.',
    icon: '/favicon.ico',
    tag: 'order-alert'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || data.icon || '/favicon.ico',
    tag: data.tag || 'order-alert',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click: Focus or open the Admin orders tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            orderId: event.notification.data?.orderId,
            action: 'OPEN_ADMIN_ORDERS'
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
