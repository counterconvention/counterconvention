// Browser Notification API utility for Áurea Moda Feminina
import { Order } from '../types';
import { playOrderNotificationSound } from './audio';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

const PUSH_STORAGE_KEY = 'aurea_push_alerts_active_v1';

/**
 * Check if push alerts have been activated by the user in this store
 */
export function isPushAlertsStoredEnabled(): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(PUSH_STORAGE_KEY);
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    }
  } catch {}
  return false;
}

/**
 * Save user preference for push alerts in this store
 */
export function setPushAlertsStoredEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PUSH_STORAGE_KEY, enabled ? 'true' : 'false');
    }
  } catch {}
}

let titleInterval: number | null = null;
let originalTitle = typeof document !== 'undefined' ? document.title : 'Catálogo Digital & Gestão';

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current permission status taking into account user activation
 */
export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  // If user explicitly activated in store, consider granted
  if (isPushAlertsStoredEnabled()) {
    return 'granted';
  }

  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  // If browser explicitly denied, report denied
  if (Notification.permission === 'denied') {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return 'default';
}

/**
 * Request notification permission from the user and persist active state
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Always mark stored preference as enabled so audio, title alert, and toasts activate
  setPushAlertsStoredEnabled(true);

  if (!isNotificationSupported()) {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    // Keep user's active intent enabled even if browser sandbox blocks desktop OS popup
    setPushAlertsStoredEnabled(true);
    return true;
  } catch (err) {
    console.warn('Error requesting notification permission (using active in-app alerts):', err);
    setPushAlertsStoredEnabled(true);
    return true;
  }
}

/**
 * Explicitly disable notifications
 */
export function disablePushAlerts(): void {
  setPushAlertsStoredEnabled(false);
}

/**
 * Register the Service Worker for background notification resilience
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    return registration;
  } catch (err) {
    console.warn('Service Worker registration skipped or failed:', err);
    return null;
  }
}

/**
 * Start flashing the document title when a background event occurs
 */
export function startTitleAlert(alertText: string) {
  if (typeof document === 'undefined') return;
  stopTitleAlert();
  originalTitle = document.title;

  let toggle = false;
  titleInterval = window.setInterval(() => {
    document.title = toggle ? alertText : originalTitle;
    toggle = !toggle;
  }, 1000);

  const resetOnFocus = () => {
    stopTitleAlert();
    window.removeEventListener('focus', resetOnFocus);
    window.removeEventListener('click', resetOnFocus);
  };
  window.addEventListener('focus', resetOnFocus);
  window.addEventListener('click', resetOnFocus);
}

/**
 * Stop flashing document title
 */
export function stopTitleAlert() {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }
  if (typeof document !== 'undefined' && originalTitle) {
    document.title = originalTitle;
  }
}

/**
 * Send a native browser OS-level notification for a new order
 */
export async function sendBrowserOrderNotification(
  order: Order,
  options?: {
    isTest?: boolean;
    onNotificationClick?: () => void;
  }
): Promise<boolean> {
  // Always play the attention chime
  playOrderNotificationSound();

  // If the document is hidden/minimized, flash title
  if (typeof document !== 'undefined' && document.hidden) {
    startTitleAlert(`(1) 🛍️ NOVO PEDIDO #${order.id}!`);
  }

  if (!isNotificationSupported()) {
    return false;
  }

  // Request permission if not already determined, or return if denied
  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  } else if (Notification.permission !== 'granted') {
    return false;
  }

  const title = options?.isTest
    ? `🔔 [TESTE] Novo Pedido #${order.id} Recebido!`
    : `🛍️ NOVO PEDIDO RECEBIDO! (#${order.id})`;

  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const itemsText = itemsCount === 1 ? '1 peça' : `${itemsCount} peças`;
  const body = `${order.customer.name} concluiu compra de R$ ${order.total.toFixed(2).replace('.', ',')} via ${order.customer.paymentMethod} (${itemsText}). Toque para abrir no painel.`;

  const notificationOptions: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=192&q=80',
    badge: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=96&q=80',
    tag: `order-${order.id}`,
    renotify: true,
    requireInteraction: true, // Crucial: Stays on screen even when user is away from the computer
    silent: false,
    data: {
      orderId: order.id,
      url: window.location.href
    }
  } as NotificationOptions & { renotify?: boolean };

  try {
    // 1. Prefer Service Worker notification if available (works reliably in background even with tab throttled)
    if ('serviceWorker' in navigator) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        }
        if (registration && registration.showNotification) {
          await registration.showNotification(title, notificationOptions);
          // Also post message to active worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'SHOW_NOTIFICATION',
              title,
              body,
              options: notificationOptions
            });
          }
          return true;
        }
      } catch (swErr) {
        console.warn('Service Worker notification failed, falling back to Notification API:', swErr);
      }
    }

    // 2. Standard Web Notification API fallback
    const notification = new Notification(title, notificationOptions);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      stopTitleAlert();
      if (options?.onNotificationClick) {
        options.onNotificationClick();
      }
    };

    return true;
  } catch (err) {
    console.warn('Native notification failed:', err);
    return false;
  }
}
