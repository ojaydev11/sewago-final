export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.swRegistration);

      // Check if we have permission
      const permission = await this.getPermission();
      if (permission === 'granted') {
        console.log('Push notification permission granted');
        return true;
      } else if (permission === 'default') {
        console.log('Push notification permission not yet requested');
        return false;
      } else {
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing push notification service:', error);
      return false;
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get current permission status
   */
  async getPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported || !this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      return null;
    }

    try {
      return await this.swRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  /**
   * Show local notification
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isSupported || !this.swRegistration) {
      return;
    }

    try {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-192x192.png',
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        vibrate: payload.vibrate || [100, 50, 100],
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Check if service worker is ready
   */
  async isReady(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get subscription as JSON for sending to server
   */
  async getSubscriptionJSON(): Promise<string | null> {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return null;
    }

    return JSON.stringify(subscription);
  }

  /**
   * Check if push notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    const permission = await this.getPermission();
    if (permission !== 'granted') {
      return false;
    }

    const subscription = await this.getSubscription();
    return !!subscription;
  }

  /**
   * Enable push notifications (request permission + subscribe)
   */
  async enable(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      // Initialize if not already done
      if (!this.swRegistration) {
        await this.initialize();
      }

      // Request permission
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        return false;
      }

      // Subscribe
      const subscription = await this.subscribe();
      return !!subscription;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    }
  }

  /**
   * Disable push notifications
   */
  async disable(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const success = await this.unsubscribe();
      return success;
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
