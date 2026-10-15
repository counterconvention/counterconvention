import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import { MessageSquare, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, currentView } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Hide in admin view
  if (currentView === 'admin') return null;

  const isWaActive = settings.whatsappEnabled !== false;
  const isDiscordActive = settings.discordEnabled !== false && Boolean(settings.discordUrl);

  // If both channels are disabled, hide completely
  if (!isWaActive && !isDiscordActive) return null;

  const cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber || '5500000000000'}?text=${encodeURIComponent(
    `Olá! Estou visitando a ${settings.storeName} e gostaria de mais informações sobre os produtos.`
  )}`;

  // If only WhatsApp is active
  if (isWaActive && !isDiscordActive) {
    return (
      <aside
        aria-label="Atendimento via WhatsApp"
        className="fixed bottom-6 right-5 sm:right-6 z-30 flex items-center group select-none"
      >
        <span className="mr-3 px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-semibold shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none hidden sm:inline-block whitespace-nowrap translate-x-2 group-hover:translate-x-0">
          Atendimento no WhatsApp
        </span>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="btn-floating-whatsapp"
          aria-label="Iniciar conversa no WhatsApp oficial da loja"
          title={`WhatsApp: ${settings.whatsappDisplay || 'Atendimento'}`}
          className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-emerald-900/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/40"
        >
          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white drop-shadow-xs" />
        </a>
      </aside>
    );
  }

  // If only Discord is active
  if (!isWaActive && isDiscordActive) {
    return (
      <aside
        aria-label="Comunidade Discord"
        className="fixed bottom-6 right-5 sm:right-6 z-30 flex items-center group select-none"
      >
        <span className="mr-3 px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-semibold shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none hidden sm:inline-block whitespace-nowrap translate-x-2 group-hover:translate-x-0">
          Entrar no Discord
        </span>

        <a
          href={settings.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="btn-floating-discord"
          aria-label="Entrar no servidor do Discord da loja"
          title={`Discord: ${settings.discordServerName || 'Comunidade'}`}
          className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white flex items-center justify-center shadow-lg shadow-indigo-900/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/40"
        >
          <DiscordIcon className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white drop-shadow-xs" />
        </a>
      </aside>
    );
  }

  // If both WhatsApp and Discord are active -> Elegant modular popout menu
  return (
    <aside
      aria-label="Canais de Atendimento e Comunidade"
      className="fixed bottom-6 right-5 sm:right-6 z-30 flex flex-col items-end gap-2.5 select-none"
    >
      {isOpen && (
        <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-2 pb-1 border-b border-neutral-100">
            Fale Conosco
          </span>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Oficial</span>
          </a>

          <a
            href={settings.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
            <span>Comunidade Discord</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir canais de contato"
        title="Canais de Contato & Suporte"
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/60"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <MessageSquare className="w-5 h-5 text-white" />}
      </button>
    </aside>
  );
};
