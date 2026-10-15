import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { NotificationPopover } from './NotificationPopover';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import {
  Bell,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    setIsCartOpen,
    unreadNotificationsCount,
    setCurrentView
  } = useStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Clean WhatsApp URL for top button
  const cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
  const waDirectUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Olá! Estou visitando a ${settings.storeName} e gostaria de mais informações sobre os produtos.`
  )}`;

  return (
    <>
      {/* Dynamic Announcement Banner */}
      {settings.bannerEnabled && settings.bannerText && (
        <div className="bg-neutral-950 text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
          <span>{settings.bannerText}</span>
        </div>
      )}

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-18 flex items-center justify-between gap-4">
            {/* Left: Store Name */}
            <div
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              onClick={() => setCurrentView('catalog')}
            >
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 block leading-tight group-hover:text-neutral-700 transition-colors font-sans">
                  {settings.storeName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-neutral-400 hidden sm:block">
                  {settings.tagline || 'Catálogo Oficial'}
                </span>
              </div>
            </div>

            {/* Right: Modular Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* 1. WhatsApp Button (if enabled) */}
              {settings.whatsappEnabled !== false && cleanNumber && (
                <a
                  href={waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-header-whatsapp"
                  title={`WhatsApp: ${settings.whatsappDisplay || 'Atendimento'}`}
                  className="h-9 px-2.5 sm:px-3 rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span className="hidden md:inline">WhatsApp</span>
                </a>
              )}

              {/* 2. Instagram Button (if enabled) */}
              {settings.instagramEnabled !== false && settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-header-instagram"
                  title={`Instagram: @${settings.instagramUser}`}
                  className="h-9 px-2.5 sm:px-3 rounded-xl border border-pink-200/90 bg-pink-50/70 hover:bg-pink-100/90 text-pink-900 font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current text-pink-600 shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="hidden md:inline">Instagram</span>
                </a>
              )}

              {/* 3. Discord Button (if enabled) */}
              {settings.discordEnabled !== false && settings.discordUrl && (
                <a
                  href={settings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-header-discord"
                  title={`Comunidade Discord: ${settings.discordServerName || 'Comunidade'}`}
                  className="h-9 px-2.5 sm:px-3 rounded-xl border border-indigo-200/90 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-900 font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer"
                >
                  <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span className="hidden md:inline">Discord</span>
                </a>
              )}

              {/* 4. Notifications Button */}
              <button
                id="btn-header-notifications"
                onClick={() => setIsNotificationsOpen(true)}
                title="Avisos e Notificações"
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all relative active:scale-97 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Avisos</span>
                {unreadNotificationsCount > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* 5. Cart Bag Button */}
              <button
                id="btn-header-cart"
                onClick={() => setIsCartOpen(true)}
                title="Ver Carrinho de Compras"
                className="h-9 px-3 sm:px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-97 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Carrinho</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-neutral-900 font-extrabold text-[10px]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Notifications Drawer / Popover */}
      <NotificationPopover
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
