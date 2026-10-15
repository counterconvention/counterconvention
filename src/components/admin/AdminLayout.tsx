import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminStock } from './AdminStock';
import { AdminOrders } from './AdminOrders';
import { AdminNotifications } from './AdminNotifications';
import { AdminCsv } from './AdminCsv';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Bell,
  FileSpreadsheet,
  Settings,
  ArrowLeft
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'stock'
  | 'orders'
  | 'notifications'
  | 'csv'
  | 'settings';

export const AdminLayout: React.FC = () => {
  const {
    setCurrentView,
    orders,
    lowStockProducts,
    outOfStockProducts,
    unreadNotificationsCount,
    settings
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stockSearchTarget, setStockSearchTarget] = useState<string>('');

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pendente').length;
  const totalCriticalStock = lowStockProducts.length + outOfStockProducts.length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      id: 'stock',
      label: 'Estoque',
      icon: <Boxes className="w-4 h-4" />,
      badge: totalCriticalStock > 0 ? totalCriticalStock : undefined,
      badgeColor: outOfStockProducts.length > 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    {
      id: 'notifications',
      label: 'Mensagens',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-neutral-900 text-white'
    },
    {
      id: 'csv',
      label: 'Backup & CSV',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-800">
      {/* Top Header - Standardized with Customer Header Pattern */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 flex items-center justify-between gap-4">
            {/* Left: Store Emblem + Store Name + Technical Admin Label */}
            <div
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              {/* Store Icon Emblem - Identical to customer header */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-rose-950 text-white flex items-center justify-center shadow-md shadow-neutral-900/10 transition-transform group-hover:scale-105 shrink-0">
                <svg
                  className="w-6 h-6 text-rose-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>

              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 block leading-tight group-hover:text-rose-900 transition-colors font-sans">
                  {settings.storeName}
                </span>
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-500 hidden sm:block">
                  Painel de Gestão
                </span>
              </div>
            </div>

            {/* Right: Quick Operational Indicators & Standardized Return Button */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Catálogo Online</span>
              </div>

              <button
                onClick={() => setCurrentView('catalog')}
                id="btn-back-to-catalog"
                title="Voltar ao Catálogo do Cliente"
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md active:scale-97 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-rose-300 shrink-0" />
                <span>Voltar à Loja</span>
              </button>
            </div>
          </div>
        </div>

        {/* Technical, Clean Navigation Bar */}
        <div className="border-t border-neutral-200/80 bg-neutral-50/90 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-neutral-900 text-white shadow-2xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <AdminDashboard onNavigateToTab={(tab) => setActiveTab(tab as AdminTab)} />
        )}
        {activeTab === 'products' && (
          <AdminProducts
            onNavigateToStock={(productName) => {
              setStockSearchTarget(productName || '');
              setActiveTab('stock');
            }}
          />
        )}
        {activeTab === 'stock' && (
          <AdminStock initialSearchTerm={stockSearchTarget} />
        )}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'notifications' && <AdminNotifications />}
        {activeTab === 'csv' && <AdminCsv />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
