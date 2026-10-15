import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  SiteNotification,
  StoreSettings,
  ProductCategory,
  ProductSize,
  OrderCustomer,
  CompleteStoreBackup,
  StoredBackupSnapshot,
  DEFAULT_CATEGORIES
} from '../types';
import {
  initialProducts,
  initialStoreSettings,
  initialNotifications,
  initialOrders
} from '../data/initialData';
import { playOrderNotificationSound } from '../utils/audio';
import { getClientMetadata } from '../utils/clientMetadata';
import { computeSha256, encryptData, decryptData } from '../utils/backupCrypto';
import { sendDiscordOrderNotification } from '../utils/discordIntegration';
import {
  registerServiceWorker,
  sendBrowserOrderNotification,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  disablePushAlerts,
  NotificationPermissionStatus
} from '../utils/browserNotifications';

interface StoreContextType {
  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Catalog Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkAdjustStock: (productId: string, size: ProductSize, delta: number) => void;
  setProductSizeStock: (productId: string, size: ProductSize, quantity: number) => void;
  setAllSizesStock: (productId: string, quantity: number) => void;
  bulkCategoryStockAdjustment: (category: ProductCategory, delta: number) => void;
  importProductsList: (newProducts: Product[], replace: boolean) => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (product: Product, size: ProductSize, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: ProductSize, color: string) => void;
  updateCartQuantity: (productId: string, size: ProductSize, color: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Orders & Real-time Alerts
  orders: Order[];
  createOrderFromCart: (customer: OrderCustomer) => { order: Order; waUrl: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  latestNewOrder: Order | null;
  dismissLatestOrder: () => void;
  unreadOrdersCount: number;

  // Notifications
  notifications: SiteNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<SiteNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  notificationPermission: NotificationPermissionStatus;
  requestBrowserPushPermission: () => Promise<boolean>;
  disableBrowserPushAlerts: () => void;
  triggerTestOrderNotification: (delaySeconds?: number) => Promise<void>;
  testNotificationCountdown: number | null;

  // Navigation & Modals
  currentView: 'catalog' | 'admin';
  setCurrentView: (view: 'catalog' | 'admin') => void;
  isAdminAuthenticated: boolean;
  isAdminPinModalOpen: boolean;
  setIsAdminPinModalOpen: (open: boolean) => void;
  requestAdminAccess: () => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedCategory: ProductCategory | 'Todos';
  setSelectedCategory: (cat: ProductCategory | 'Todos') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Stock Alerts
  lowStockProducts: { product: Product; totalStock: number }[];
  outOfStockProducts: Product[];

  // Full System Backup & Migration
  getCompleteBackupData: (password?: string) => Promise<{ dataString: string; rawBackup: CompleteStoreBackup; checksum: string; isEncrypted: boolean }>;
  restoreCompleteBackup: (backupText: string, password?: string) => Promise<{ success: boolean; message: string; stats?: { settingsCount: number; notificationsCount: number; productsCount: number; ordersCount: number } }>;
  syncBackupToCloudApi: (url: string, token?: string, password?: string) => Promise<{ success: boolean; message: string; httpStatus?: number; timestamp?: string }>;
  importSettingsFromCsv: (newSettings: Partial<StoreSettings>) => void;
  importNotificationsFromCsv: (newNotifs: SiteNotification[], replace?: boolean) => void;

  // Snapshots por Horário e Google Drive
  snapshots: StoredBackupSnapshot[];
  createHourlySnapshot: (label?: string, type?: 'hourly' | 'daily' | 'manual') => Promise<StoredBackupSnapshot>;
  restoreSnapshotById: (snapshotId: string) => Promise<{ success: boolean; message: string; stats?: any }>;
  deleteSnapshotById: (snapshotId: string) => void;
  exportSnapshotAsJson: (snapshotIdOrData: string | CompleteStoreBackup) => void;
  exportGoogleDriveBackup: (password?: string) => Promise<{ dataString: string; filename: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'aurea_store_settings_v1',
  PRODUCTS: 'aurea_store_products_v2',
  ORDERS: 'aurea_store_orders_v1',
  NOTIFICATIONS: 'aurea_store_notifications_v1',
  CART: 'aurea_store_cart_v1',
  LAST_ORDER_EVENT: 'aurea_last_order_event_v1',
  SNAPSHOTS: 'counter_backup_snapshots_v1',
  LAST_DAILY_BACKUP: 'counter_last_daily_backup_date'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state with automatic migration to generic Replace store & modular options
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.storeName === 'Áurea Moda Feminina' ||
          parsed.storeName === 'Áurea Boutique' ||
          parsed.storeName === 'Counter' ||
          !parsed.storeName
        ) {
          parsed.storeName = 'Replace Store';
        }
        if (parsed.tagline?.includes('Elegância contemporânea') || !parsed.tagline) {
          parsed.tagline = 'Replace your tagline here';
        }
        if (parsed.bannerText?.includes('299') || parsed.bannerText?.includes('Coleção Nova Disponível')) {
          parsed.bannerText = 'Replace announcement banner text • Frete Grátis nas compras acima de R$ 500';
        }
        if (parsed.instagramBio?.includes('Catálogo oficial de peças') || !parsed.instagramBio) {
          parsed.instagramBio = 'replace here bio';
        }
        if (
          parsed.instagramUser === 'aurea.boutiquefem' ||
          parsed.instagramUser === 'aurea.boutique' ||
          parsed.instagramUser === 'counter.oficial' ||
          !parsed.instagramUser
        ) {
          parsed.instagramUser = 'replace.profile';
          parsed.instagramUrl = 'https://instagram.com/replace.profile';
        }
        if (
          parsed.email === 'atendimento@counter.com.br' ||
          parsed.email === 'atendimento@aureamoda.com.br' ||
          !parsed.email
        ) {
          parsed.email = 'replace@email.com';
        }
        if (parsed.whatsappNumber === '5511987654321' || !parsed.whatsappNumber) {
          parsed.whatsappNumber = '5500000000000';
          parsed.whatsappDisplay = '(00) 00000-0000';
        }
        if (parsed.landline === '(11) 3456-7890' || !parsed.landline) {
          parsed.landline = '(00) 0000-0000';
        }
        if (parsed.whatsappEnabled === undefined) parsed.whatsappEnabled = true;
        if (parsed.instagramEnabled === undefined) parsed.instagramEnabled = true;
        if (parsed.discordEnabled === undefined) parsed.discordEnabled = true;
        if (!parsed.discordUrl) parsed.discordUrl = 'https://discord.gg/replace';
        if (!parsed.discordServerName) parsed.discordServerName = 'Replace Community';
        if (!parsed.discordDisplay) parsed.discordDisplay = 'Discord Oficial';
        if (!parsed.categories || parsed.categories.length === 0) parsed.categories = DEFAULT_CATEGORIES;
        if (!parsed.currencySymbol) parsed.currencySymbol = 'R$';

        const merged = { ...initialStoreSettings, ...parsed };
        return merged;
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  // 2. Products state with auto-filtering of demo products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const demoIds = ['conj-01', 'conj-02', 'conj-03', 'vest-01', 'vest-02', 'vest-03', 'sai-01', 'sai-02', 'cam-01', 'cam-02', 'cam-03'];
          const real = parsed.filter((p: Product) => !demoIds.includes(p.id) && !p.id.startsWith('conj-') && !p.id.startsWith('vest-') && !p.id.startsWith('sai-') && !p.id.startsWith('cam-'));
          return real.length > 0 ? real : initialProducts;
        }
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // 3. Orders state (filtering out demo orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realOrders = parsed.filter((o: Order) => !o.id.startsWith('PED-9'));
          return realOrders;
        }
      }
      return initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // 4. Notifications state (filtering out demo notifications)
  const [notifications, setNotifications] = useState<SiteNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realNotifs = parsed.filter((n: SiteNotification) => !n.id.startsWith('notif-'));
          return realNotifs;
        }
      }
      return initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  // 5. Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Snapshots state (Horários e Diários)
  const [snapshots, setSnapshots] = useState<StoredBackupSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Real-time new order banner alert
  const [latestNewOrder, setLatestNewOrder] = useState<Order | null>(null);

  // UI state
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('counter_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  const requestAdminAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  const loginAdmin = (pin: string): boolean => {
    const targetPin = settings.adminPin || '9000';
    if (pin.trim() === targetPin.trim()) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('counter_admin_auth', 'true');
      } catch {}
      setCurrentView('admin');
      setIsAdminPinModalOpen(false);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('counter_admin_auth');
    } catch {}
    setCurrentView('catalog');
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Browser push notification status & testing countdown
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus>(
    () => getNotificationPermissionStatus()
  );
  const [testNotificationCountdown, setTestNotificationCountdown] = useState<number | null>(null);

  // Register service worker and handle clicks from background notifications
  useEffect(() => {
    registerServiceWorker();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.action === 'OPEN_ADMIN_ORDERS') {
          setCurrentView('admin');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  // Automatic Daily Backup: executes automatically if a new day has arrived
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastDaily = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_BACKUP);
      if (lastDaily !== todayStr) {
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = now.toLocaleDateString('pt-BR');
        const autoSnap: StoredBackupSnapshot = {
          id: `snap-daily-${now.getTime()}`,
          timestamp: now.getTime(),
          isoDate: now.toISOString(),
          dateFormatted,
          timeFormatted,
          label: `Backup Diário Automático (${dateFormatted} ${timeFormatted})`,
          type: 'daily',
          productsCount: products.length,
          ordersCount: orders.length,
          settingsCount: Object.keys(settings).length,
          notificationsCount: notifications.length,
          data: {
            version: '2.0',
            appName: settings.storeName || 'Counter',
            exportedAt: now.toISOString(),
            exportTimestamp: now.getTime(),
            timeFormatted,
            dateFormatted,
            originHost: typeof window !== 'undefined' ? window.location.host : 'localhost',
            settings,
            notifications,
            products,
            orders,
            cart,
            totalRecords: (products?.length || 0) + (orders?.length || 0) + (notifications?.length || 0) + Object.keys(settings || {}).length,
            backupType: 'auto-daily',
            label: `Backup Diário Automático (${dateFormatted})`
          }
        };

        setSnapshots((prev) => {
          const updated = [autoSnap, ...prev.filter((s) => s.id !== autoSnap.id)].slice(0, 30);
          try {
            localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updated));
            localStorage.setItem(STORAGE_KEYS.LAST_DAILY_BACKUP, todayStr);
          } catch {}
          return updated;
        });
      }
    } catch (e) {
      console.warn('Auto daily backup check error:', e);
    }
  }, [products.length, orders.length]);

  // Sync notification permission updates
  useEffect(() => {
    setNotificationPermission(getNotificationPermissionStatus());
    const handleFocus = () => {
      setNotificationPermission(getNotificationPermissionStatus());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Multi-tab BroadcastChannel & window storage for real-time background notification across tabs
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('aurea_orders_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ORDER' && event.data.order) {
            processIncomingOrder(event.data.order, event.data.isTest);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not initialized:', err);
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.LAST_ORDER_EVENT && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          if (payload?.order) {
            processIncomingOrder(payload.order, payload.isTest);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Central processor for incoming orders (whether from checkout, another tab, or background simulation)
  const processIncomingOrder = (order: Order, isTest?: boolean) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });

    setLatestNewOrder(order);

    // Send native OS notification (desktop banner/push)
    sendBrowserOrderNotification(order, {
      isTest,
      onNotificationClick: () => {
        setCurrentView('admin');
      }
    });

    addNotification({
      title: isTest ? `🔔 [TESTE] Pedido #${order.id} Recebido` : `🛍️ Pedido #${order.id} Recebido`,
      message: `${order.customer.name} concluiu pedido de R$ ${order.total.toFixed(2).replace('.', ',')} via ${order.customer.paymentMethod}!`,
      type: 'order'
    });
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Settings update
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProd, ...prev]);

    // Add in-site notification
    addNotification({
      title: '✨ Novo Produto no Catálogo',
      message: `${newProd.name} acaba de ser adicionado à categoria ${newProd.category}!`,
      type: 'promo'
    });
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const bulkAdjustStock = (productId: string, size: ProductSize, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => {
          if (s.size === size) {
            return { ...s, quantity: Math.max(0, s.quantity + delta) };
          }
          return s;
        });
        return { ...p, sizes: newSizes };
      })
    );
  };

  const setProductSizeStock = (productId: string, size: ProductSize, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(quantity) || 0);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => {
          if (s.size === size) {
            return { ...s, quantity: safeQty };
          }
          return s;
        });
        return { ...p, sizes: newSizes };
      })
    );
  };

  const setAllSizesStock = (productId: string, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(quantity) || 0);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => ({
          ...s,
          quantity: safeQty
        }));
        return { ...p, sizes: newSizes };
      })
    );
  };

  const bulkCategoryStockAdjustment = (category: ProductCategory, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.category !== category) return p;
        const newSizes = p.sizes.map((s) => ({
          ...s,
          quantity: Math.max(0, s.quantity + delta)
        }));
        return { ...p, sizes: newSizes };
      })
    );
  };

  const importProductsList = (newProds: Product[], replace: boolean) => {
    if (replace) {
      setProducts(newProds);
    } else {
      setProducts((prev) => [...newProds, ...prev]);
    }
  };

  // Cart operations
  const addToCart = (product: Product, size: ProductSize, color: string, qty = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string, size: ProductSize, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateCartQuantity = (productId: string, size: ProductSize, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
    return acc + price * item.quantity;
  }, 0);

  // Orders creation and real-time WhatsApp generation
  const createOrderFromCart = (customer: OrderCustomer): { order: Order; waUrl: string } => {
    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartTotal;
    const isPix = customer.paymentMethod.toLowerCase().includes('pix');
    const discount = isPix ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    let totalCost = 0;
    const items = cart.map((item) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
      const cost = item.product.costPrice * item.quantity;
      totalCost += cost;

      return {
        productId: item.product.id,
        productName: item.product.name,
        category: item.product.category,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        salePrice: price,
        costPrice: item.product.costPrice
      };
    });

    const totalProfit = total - totalCost;
    const clientMetadata = getClientMetadata();

    // Build the enhanced pre-formatted WhatsApp message containing all cart details
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const totalPieces = cart.reduce((acc, item) => acc + item.quantity, 0);

    const lines: string[] = [];
    lines.push(`✨ *PEDIDO DE COMPRA - ${settings.storeName.toUpperCase()}* ✨`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🔖 *CÓDIGO DO PEDIDO:* *#${orderId}*`);
    lines.push(`📅 *Data:* ${formattedDate} às ${formattedTime}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👤 *DADOS DA CLIENTE:*`);
    lines.push(`• *Nome Completo:* ${customer.name}`);
    lines.push(`• *WhatsApp:* ${customer.phone}`);

    if (customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja') {
      lines.push(`• *Forma de Entrega:* Retirada no Showroom (Grátis)`);
      lines.push(`  📍 *Ponto de Retirada:* ${settings.address}, ${settings.cityState}`);
    } else {
      lines.push(`• *Forma de Entrega:* Correios / Sedex`);
      if (customer.address) {
        lines.push(`  📍 *Endereço Completo:* ${customer.address}`);
      }
    }

    const paymentLabel = customer.paymentMethod.toLowerCase().includes('pix')
      ? 'Pix (5% OFF aplicado)'
      : customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito')
      ? 'Cartão de Crédito (Até 12x)'
      : customer.paymentMethod.toLowerCase().includes('débito') || customer.paymentMethod.toLowerCase().includes('debito')
      ? 'Débito (Máquina no Showroom)'
      : customer.paymentMethod;

    lines.push(`• *Forma de Pagamento:* ${paymentLabel}`);
    if (customer.notes && customer.notes.trim()) {
      lines.push(`• *Observações:* ${customer.notes.trim()}`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📦 *ITENS DO PEDIDO (${cart.length} produto(s) • ${totalPieces} un.):*`);
    lines.push(``);

    cart.forEach((item, idx) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
      const itemTotal = price * item.quantity;
      lines.push(`${idx + 1}️⃣ *${item.quantity}x ${item.product.name}*`);
      lines.push(`   ▸ Categoria: ${item.product.category}`);
      lines.push(`   ▸ Tamanho / Opção: *${item.selectedSize}* | Cor / Var: *${item.selectedColor}*`);
      if (item.product.fabric) {
        lines.push(`   ▸ Especificação: ${item.product.fabric}`);
      }
      lines.push(`   ▸ Valor: R$ ${itemTotal.toFixed(2).replace('.', ',')} (R$ ${price.toFixed(2).replace('.', ',')} cada)`);
      lines.push(``);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💰 *RESUMO FINANCEIRO:*`);
    lines.push(`• *Subtotal dos Produtos:* R$ ${subtotal.toFixed(2).replace('.', ',')}`);
    if (discount > 0) {
      lines.push(`• *Desconto Pix (5% OFF):* -R$ ${discount.toFixed(2).replace('.', ',')}`);
    }
    const isFreeShipping = subtotal >= settings.freeShippingMinimum || customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja';
    lines.push(`• *Frete:* ${isFreeShipping ? 'GRÁTIS' : 'A calcular / combinar'}`);
    lines.push(`💎 *TOTAL A PAGAR:* *R$ ${total.toFixed(2).replace('.', ',')}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Olá! Montei meu pedido no catálogo online com o código *#${orderId}*. Gostaria de confirmar a disponibilidade dos itens para prosseguirmos. Aguardo seu retorno! ✨`);

    const waText = lines.join('\n');

    // Clean phone number (guarantee Brazilian country code 55 if not present)
    let cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = `55${cleanNumber}`;
    }
    if (!cleanNumber || cleanNumber === '00000000000' || cleanNumber === '5500000000000') {
      cleanNumber = '5500000000000';
    }
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waText)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      items,
      subtotal,
      discount,
      total,
      totalCost,
      totalProfit,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      whatsappMessage: waText,
      clientMetadata
    };

    // Decrement stock for ordered items
    setProducts((prev) =>
      prev.map((p) => {
        const matchingCartItems = cart.filter((ci) => ci.product.id === p.id);
        if (matchingCartItems.length === 0) return p;

        const updatedSizes = p.sizes.map((s) => {
          const orderedForSize = matchingCartItems
            .filter((ci) => ci.selectedSize === s.size)
            .reduce((sum, ci) => sum + ci.quantity, 0);
          return {
            ...s,
            quantity: Math.max(0, s.quantity - orderedForSize)
          };
        });

        return { ...p, sizes: updatedSizes };
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Send automated Discord notification if enabled
    if (settings.discordEnabled && settings.discordWebhookUrl) {
      sendDiscordOrderNotification(newOrder, settings).catch((err) => {
        console.warn('Discord webhook notification notice:', err);
      });
    }

    // Broadcast to other tabs & background listeners
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('aurea_orders_sync_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
        channel.close();
      }
      localStorage.setItem(
        STORAGE_KEYS.LAST_ORDER_EVENT,
        JSON.stringify({ order: newOrder, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }

    // Trigger audio notification, OS native notification & real-time popup
    setLatestNewOrder(newOrder);
    sendBrowserOrderNotification(newOrder, {
      onNotificationClick: () => setCurrentView('admin')
    });

    // Add in-site notification for order
    addNotification({
      title: `🛍️ Pedido #${orderId} Realizado`,
      message: `${customer.name} concluiu o pedido de R$ ${total.toFixed(2).replace('.', ',')} via ${customer.paymentMethod}!`,
      type: 'order'
    });

    // Clear cart
    clearCart();

    return { order: newOrder, waUrl };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const dismissLatestOrder = () => setLatestNewOrder(null);

  // Notifications
  const addNotification = (notif: Omit<SiteNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: SiteNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestBrowserPushPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermissionStatus());
    if (granted) {
      addNotification({
        title: '🔔 Alertas de Pedidos Ativados!',
        message: 'Você receberá alertas no seu navegador e computador mesmo quando a aba do admin estiver em segundo plano.',
        type: 'info'
      });
    }
    return granted;
  };

  const disableBrowserPushAlerts = () => {
    disablePushAlerts();
    setNotificationPermission('default');
  };

  const triggerTestOrderNotification = async (delaySeconds = 0): Promise<void> => {
    // If permission has not been requested yet, request it
    if (getNotificationPermissionStatus() === 'default') {
      const granted = await requestBrowserPushPermission();
      if (!granted) return;
    }

    const firstProduct = products[0] || initialProducts[0];
    const unitPrice = firstProduct.isPromo && firstProduct.promoPrice
      ? firstProduct.promoPrice
      : firstProduct.salePrice;

    const testOrder: Order = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: {
        name: 'Camila Albuquerque',
        phone: '11998877665',
        deliveryMethod: 'Retirada na Loja',
        paymentMethod: 'Pix',
        notes: 'Pedido de teste para validação de notificações em segundo plano!'
      },
      items: [
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          category: firstProduct.category,
          size: 'M',
          color: firstProduct.colors[0] || 'Off-white',
          quantity: 1,
          salePrice: unitPrice,
          costPrice: firstProduct.costPrice
        }
      ],
      subtotal: unitPrice,
      discount: unitPrice * 0.05,
      total: unitPrice * 0.95,
      totalCost: firstProduct.costPrice,
      totalProfit: unitPrice * 0.95 - firstProduct.costPrice,
      status: 'Pendente',
      whatsappMessage: `✨ *PEDIDO DE COMPRA - ${settings.storeName.toUpperCase()}* ✨\n🔖 *CÓDIGO:* #TESTE\n📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n👤 *Cliente:* Camila Albuquerque\n👗 *Itens:* 1x ${firstProduct.name} (Tam: M)\n💰 *Total:* R$ ${(unitPrice * 0.95).toFixed(2).replace('.', ',')}`,
      createdAt: new Date().toISOString(),
      clientMetadata: getClientMetadata()
    };

    if (delaySeconds <= 0) {
      processIncomingOrder(testOrder, true);
      return;
    }

    setTestNotificationCountdown(delaySeconds);
    let remaining = delaySeconds;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timer);
        setTestNotificationCountdown(null);
        processIncomingOrder(testOrder, true);
      } else {
        setTestNotificationCountdown(remaining);
      }
    }, 1000);
  };

  // Automated Stock Alert to Message Inbox (SiteNotification)
  // Ensures that whenever an item reaches or drops below minimum stock (or hits 0), an alert is logged in the message box.
  const prevStockLevelsRef = useRef<Map<string, number>>(new Map());
  const initialStockScannedRef = useRef(false);

  useEffect(() => {
    // Populate baseline on first mount without generating historic duplicate alerts
    if (!initialStockScannedRef.current) {
      products.forEach((p) => {
        const total = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
        prevStockLevelsRef.current.set(p.id, total);
      });
      initialStockScannedRef.current = true;
      return;
    }

    products.forEach((p) => {
      const currentTotal = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
      const prevTotal = prevStockLevelsRef.current.get(p.id);

      // Trigger notification if stock dropped and reached or crossed into minimum threshold
      if (
        prevTotal !== undefined &&
        currentTotal < prevTotal &&
        currentTotal <= settings.lowStockThreshold
      ) {
        const isOutOfStock = currentTotal === 0;
        addNotification({
          title: isOutOfStock ? `🚨 Estoque Esgotado: ${p.name}` : `⚠️ Estoque Mínimo Atingido: ${p.name}`,
          message: isOutOfStock
            ? `O item "${p.name}" esgotou completamente (0 unidades em estoque). Necessário reposição urgente.`
            : `O item "${p.name}" atingiu o nível crítico com ${currentTotal} unidade(s) restante(s) (limite configurado: ${settings.lowStockThreshold} un).`,
          type: 'alert'
        });
      }

      prevStockLevelsRef.current.set(p.id, currentTotal);
    });
  }, [products, settings.lowStockThreshold]);

  // Stock alert computations
  const lowStockProducts = products
    .map((p) => ({
      product: p,
      totalStock: p.sizes.reduce((acc, s) => acc + s.quantity, 0)
    }))
    .filter((item) => item.totalStock > 0 && item.totalStock <= settings.lowStockThreshold);

  const outOfStockProducts = products.filter(
    (p) => p.sizes.reduce((acc, s) => acc + s.quantity, 0) === 0
  );

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadOrdersCount = orders.filter((o) => o.status === 'Pendente').length;

  // Import Settings from CSV
  const importSettingsFromCsv = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: '⚙️ Configurações Importadas',
      message: `${Object.keys(newSettings).length} parâmetros da loja foram atualizados com sucesso via CSV.`,
      type: 'info'
    });
  };

  // Import Notifications from CSV
  const importNotificationsFromCsv = (newNotifs: SiteNotification[], replace = false) => {
    setNotifications((prev) => {
      const updated = replace ? newNotifs : [...newNotifs, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: '🔔 Comunicados Importados',
      message: `${newNotifs.length} avisos e comunicados foram importados com sucesso.`,
      type: 'info'
    });
  };

  // Get complete store backup payload (optionally encrypted with AES-256)
  const getCompleteBackupData = async (password?: string): Promise<{
    dataString: string;
    rawBackup: CompleteStoreBackup;
    checksum: string;
    isEncrypted: boolean;
  }> => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateFormatted = now.toLocaleDateString('pt-BR');

    const raw: CompleteStoreBackup = {
      version: '2.0',
      appName: settings.storeName || 'Counter',
      exportedAt: now.toISOString(),
      exportTimestamp: now.getTime(),
      timeFormatted,
      dateFormatted,
      originHost: typeof window !== 'undefined' ? window.location.host : 'localhost',
      settings,
      notifications,
      products,
      orders,
      cart,
      totalRecords: (products?.length || 0) + (orders?.length || 0) + (notifications?.length || 0) + Object.keys(settings || {}).length,
      backupType: 'manual'
    };

    const rawJson = JSON.stringify(raw, null, 2);
    const checksum = await computeSha256(rawJson);
    raw.checksum = checksum;

    let finalString = JSON.stringify(raw, null, 2);
    let isEncrypted = false;

    if (password && password.trim().length > 0) {
      finalString = await encryptData(finalString, password.trim());
      isEncrypted = true;
    }

    const nowIso = now.toISOString();
    updateSettings({
      lastBackupDate: nowIso,
      lastBackupType: isEncrypted ? 'Criptografado (AES-256-GCM)' : 'JSON Completo'
    });

    return { dataString: finalString, rawBackup: raw, checksum, isEncrypted };
  };

  // Restore complete backup from text (supporting auto-decryption)
  const restoreCompleteBackup = async (
    backupText: string,
    password?: string
  ): Promise<{
    success: boolean;
    message: string;
    stats?: {
      settingsCount: number;
      notificationsCount: number;
      productsCount: number;
      ordersCount: number;
    };
  }> => {
    let plain = backupText.trim();

    // Check if input is encrypted JSON structure
    let parsed: any;
    try {
      parsed = JSON.parse(plain);
    } catch {
      return { success: false, message: 'Formato inválido. Certifique-se de colar o JSON do backup completo.' };
    }

    // Decrypt if it's an encrypted payload
    if (parsed.cipher && parsed.salt && parsed.iv) {
      if (!password || !password.trim()) {
        return {
          success: false,
          message: 'Este backup está protegido por senha/criptografia. Por favor, informe a senha para restaurar.'
        };
      }
      try {
        plain = await decryptData(plain, password.trim());
        parsed = JSON.parse(plain);
      } catch {
        return { success: false, message: 'Senha incorreta ou dados de backup corrompidos.' };
      }
    }

    // Validate that at least one main entity exists
    if (!parsed.settings && !parsed.products && !parsed.orders && !parsed.notifications) {
      return {
        success: false,
        message: 'O arquivo não contém os dados esperados de backup (configurações, produtos, pedidos ou comunicados).'
      };
    }

    let settingsCount = 0;
    if (parsed.settings && typeof parsed.settings === 'object') {
      setSettings((prev) => {
        const merged = { ...prev, ...parsed.settings };
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        } catch {}
        return merged;
      });
      settingsCount = Object.keys(parsed.settings).length;
    }

    let productsCount = 0;
    if (Array.isArray(parsed.products)) {
      setProducts(parsed.products);
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed.products));
      } catch {}
      productsCount = parsed.products.length;
    }

    let ordersCount = 0;
    if (Array.isArray(parsed.orders)) {
      setOrders(parsed.orders);
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(parsed.orders));
      } catch {}
      ordersCount = parsed.orders.length;
    }

    let notificationsCount = 0;
    if (Array.isArray(parsed.notifications)) {
      setNotifications(parsed.notifications);
      try {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(parsed.notifications));
      } catch {}
      notificationsCount = parsed.notifications.length;
    }

    if (Array.isArray(parsed.cart)) {
      setCart(parsed.cart);
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(parsed.cart));
      } catch {}
    }

    addNotification({
      title: '📦 Backup Completo Restaurado!',
      message: `Restauração concluída: ${productsCount} produtos, ${ordersCount} pedidos, ${settingsCount} configurações e ${notificationsCount} comunicados importados.`,
      type: 'info'
    });

    return {
      success: true,
      message: 'Backup restaurado com sucesso!',
      stats: { settingsCount, notificationsCount, productsCount, ordersCount }
    };
  };

  // Create an hourly snapshot or on-demand snapshot with 1-click
  const createHourlySnapshot = async (
    customLabel?: string,
    type: 'hourly' | 'daily' | 'manual' = 'hourly'
  ): Promise<StoredBackupSnapshot> => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const label = customLabel || (type === 'hourly' ? `Snapshot Horário - ${timeFormatted}` : `Ponto de Restauração - ${dateFormatted} ${timeFormatted}`);

    const completeBackup: CompleteStoreBackup = {
      version: '2.0',
      appName: settings.storeName || 'Counter',
      exportedAt: now.toISOString(),
      exportTimestamp: now.getTime(),
      timeFormatted,
      dateFormatted,
      originHost: typeof window !== 'undefined' ? window.location.host : 'localhost',
      settings,
      notifications,
      products,
      orders,
      cart,
      totalRecords: (products?.length || 0) + (orders?.length || 0) + (notifications?.length || 0) + Object.keys(settings || {}).length,
      backupType: type === 'hourly' ? 'hourly-snapshot' : type === 'daily' ? 'auto-daily' : 'manual',
      label
    };

    const rawJson = JSON.stringify(completeBackup);
    const checksum = await computeSha256(rawJson);
    completeBackup.checksum = checksum;

    const newSnapshot: StoredBackupSnapshot = {
      id: `snap-${now.getTime()}`,
      timestamp: now.getTime(),
      isoDate: now.toISOString(),
      dateFormatted,
      timeFormatted,
      label,
      type,
      productsCount: products.length,
      ordersCount: orders.length,
      settingsCount: Object.keys(settings).length,
      notificationsCount: notifications.length,
      data: completeBackup
    };

    setSnapshots((prev) => {
      const updated = [newSnapshot, ...prev.filter((s) => s.id !== newSnapshot.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: '⚡ Ponto de Restauração Criado!',
      message: `Snapshot salvo com sucesso às ${timeFormatted}. Contém ${products.length} produtos, ${orders.length} pedidos e configurações da loja.`,
      type: 'info'
    });

    return newSnapshot;
  };

  // Restore snapshot from local snapshot history with 1-click
  const restoreSnapshotById = async (snapshotId: string) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap || !snap.data) {
      return { success: false, message: 'Ponto de restauração não encontrado no navegador.' };
    }
    const rawJson = JSON.stringify(snap.data);
    return await restoreCompleteBackup(rawJson);
  };

  // Delete snapshot from history
  const deleteSnapshotById = (snapshotId: string) => {
    setSnapshots((prev) => {
      const updated = prev.filter((s) => s.id !== snapshotId);
      try {
        localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Export any snapshot object as .json file download
  const exportSnapshotAsJson = (snapshotIdOrData: string | CompleteStoreBackup) => {
    let dataObj: CompleteStoreBackup | null = null;
    if (typeof snapshotIdOrData === 'string') {
      const found = snapshots.find((s) => s.id === snapshotIdOrData);
      if (found) dataObj = found.data;
    } else {
      dataObj = snapshotIdOrData;
    }

    if (!dataObj) return;

    const jsonStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date(dataObj.exportTimestamp || Date.now());
    const dateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
    a.href = url;
    a.download = `backup_counter_${dateFormatted}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Google Drive ready export
  const exportGoogleDriveBackup = async (password?: string): Promise<{ dataString: string; filename: string }> => {
    const res = await getCompleteBackupData(password);
    const d = new Date();
    const dateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
    const filename = `backup_counter_googledrive_${dateFormatted}${res.isEncrypted ? '_enc' : ''}.json`;

    const blob = new Blob([res.dataString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { dataString: res.dataString, filename };
  };

  // Sync backup to external cloud API or webhook
  const syncBackupToCloudApi = async (
    url: string,
    token?: string,
    password?: string
  ): Promise<{
    success: boolean;
    message: string;
    httpStatus?: number;
    timestamp?: string;
  }> => {
    try {
      const { dataString, checksum, isEncrypted, rawBackup } = await getCompleteBackupData(password);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Backup-Checksum': checksum,
        'X-Backup-Version': '2.0',
        'X-Backup-Encrypted': isEncrypted ? 'true' : 'false'
      };

      if (token && token.trim()) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token.trim()}`;
      }

      const payload = {
        source: settings.storeName,
        originHost: typeof window !== 'undefined' ? window.location.host : 'localhost',
        timestamp: new Date().toISOString(),
        encrypted: isEncrypted,
        checksum,
        backupPayload: isEncrypted ? dataString : rawBackup
      };

      const response = await fetch(url.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Servidor de backup retornou status HTTP ${response.status} (${response.statusText})`);
      }

      const now = new Date().toISOString();
      updateSettings({
        lastCloudSyncDate: now,
        backupWebhookUrl: url,
        backupWebhookToken: token
      });

      addNotification({
        title: '☁️ Sincronização em Nuvem Concluída',
        message: `Backup transmitido com sucesso para a API externa (${new Date().toLocaleTimeString('pt-BR')}).`,
        type: 'info'
      });

      return {
        success: true,
        message: `Backup transmitido com sucesso para a API externa! (HTTP ${response.status})`,
        httpStatus: response.status,
        timestamp: now
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Falha ao conectar com o serviço de API externa.'
      };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkAdjustStock,
        setProductSizeStock,
        setAllSizesStock,
        bulkCategoryStockAdjustment,
        importProductsList,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        orders,
        createOrderFromCart,
        updateOrderStatus,
        deleteOrder,
        latestNewOrder,
        dismissLatestOrder,
        unreadOrdersCount,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        notificationPermission,
        requestBrowserPushPermission,
        disableBrowserPushAlerts,
        triggerTestOrderNotification,
        testNotificationCountdown,
        currentView,
        setCurrentView,
        isAdminAuthenticated,
        isAdminPinModalOpen,
        setIsAdminPinModalOpen,
        requestAdminAccess,
        loginAdmin,
        logoutAdmin,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        lowStockProducts,
        outOfStockProducts,
        getCompleteBackupData,
        restoreCompleteBackup,
        syncBackupToCloudApi,
        importSettingsFromCsv,
        importNotificationsFromCsv,
        snapshots,
        createHourlySnapshot,
        restoreSnapshotById,
        deleteSnapshotById,
        exportSnapshotAsJson,
        exportGoogleDriveBackup
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
