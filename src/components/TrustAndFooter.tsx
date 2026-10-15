import React from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import {
  Truck,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Clock,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

export const TrustAndFooter: React.FC = () => {
  const { settings, requestAdminAccess } = useStore();

  const cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber || '5500000000000'}?text=${encodeURIComponent(
    `Olá! Gostaria de falar com o atendimento da ${settings.storeName}.`
  )}`;

  const isWaActive = settings.whatsappEnabled !== false;
  const isInstaActive = settings.instagramEnabled !== false && Boolean(settings.instagramUrl);
  const isDiscordActive = settings.discordEnabled !== false && Boolean(settings.discordUrl);

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      {/* 1. Mini Landing Page: 3 Generic Trust Badges / Selos de Confiança */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Selo 1: Entrega para Todo o Brasil */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-200 border border-neutral-700/60 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-neutral-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Entrega para Todo o Brasil
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Envio seguro com código de rastreamento em tempo real e seguro de mercadoria via Correios e transportadoras.
                </p>
              </div>
            </div>

            {/* Selo 2: Atendimento Dedicado */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-200 border border-neutral-700/60 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Atendimento Especializado
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Suporte direto e atencioso para tirar dúvidas sobre especificações, disponibilidade e pós-venda.
                </p>
              </div>
            </div>

            {/* Selo 3: Troca Fácil e Compra Segura */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-200 border border-neutral-700/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Compra Segura & Garantia
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Garantia incondicional de 7 dias para troca ou devolução. Transparência e respeito em cada pedido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Service Columns & Physical Store Address */}
      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Coluna 1: Loja e Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center font-bold text-sm">
                {(settings.storeName || 'R').charAt(0).toUpperCase()}
              </div>
              <h3 className="font-sans font-extrabold text-white text-lg tracking-tight">
                {settings.storeName}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.tagline || 'Catálogo e Loja Online'}
            </p>
            {settings.nicheDescription && (
              <p className="text-[11px] text-neutral-500">
                {settings.nicheDescription}
              </p>
            )}
          </div>

          {/* Coluna 2: Canais Digitais Modulares (WhatsApp, Instagram, Discord) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200">
              Canais Digitais
            </h4>
            <div className="space-y-2 text-xs">
              {/* WhatsApp */}
              {isWaActive && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-neutral-300 hover:text-emerald-400 transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 text-[#25D366] flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div>
                    <span className="block font-semibold text-white">WhatsApp</span>
                    <span className="text-neutral-400">{settings.whatsappDisplay || '(00) 0000-0000'}</span>
                  </div>
                </a>
              )}

              {/* Instagram */}
              {isInstaActive && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-neutral-300 hover:text-pink-400 transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-pink-900/60 text-pink-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-semibold text-white">Instagram</span>
                    <span className="text-neutral-400">@{settings.instagramUser || 'replace'}</span>
                  </div>
                </a>
              )}

              {/* Discord */}
              {isDiscordActive && (
                <a
                  href={settings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-neutral-300 hover:text-indigo-400 transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-900/60 text-[#5865F2] flex items-center justify-center shrink-0">
                    <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
                  </div>
                  <div>
                    <span className="block font-semibold text-white">Discord</span>
                    <span className="text-neutral-400">{settings.discordServerName || 'Comunidade'}</span>
                  </div>
                </a>
              )}

              {!isWaActive && !isInstaActive && !isDiscordActive && (
                <p className="text-xs text-neutral-500">Canais digitais sob consulta.</p>
              )}
            </div>
          </div>

          {/* Coluna 3: E-mail & Número Fixo */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200">
              Contatos Diretos
            </h4>
            <div className="space-y-2 text-xs">
              {/* E-mail */}
              <a
                href={`mailto:${settings.email || 'replace@email.com'}`}
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-700/60 text-neutral-300 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">E-mail</span>
                  <span className="text-neutral-400">{settings.email || 'replace@email.com'}</span>
                </div>
              </a>

              {/* Telefone Fixo */}
              <a
                href={`tel:${(settings.landline || '0000000000').replace(/\D/g, '')}`}
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-700/60 text-neutral-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Número Fixo</span>
                  <span className="text-neutral-400">{settings.landline || '(00) 0000-0000'}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Coluna 4: Endereço da Loja Física com Botão Google Maps */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Ponto de Atendimento
            </h4>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-3 text-xs">
              <p className="text-neutral-300 font-medium leading-snug">
                {settings.address || 'Rua Exemplo, 000 - Bairro'}
              </p>
              <p className="text-neutral-400 text-[11px]">
                {settings.cityState || 'Cidade - UF, CEP 00000-000'}
              </p>

              <div className="flex items-start gap-1.5 text-neutral-400 text-[11px] pt-1 border-t border-neutral-700/50">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-500" />
                <span>{settings.openingHours || 'Segunda a Sexta: 00:00 às 00:00'}</span>
              </div>

              {/* Botão destacado redirecionando para o Google Maps */}
              <a
                href={settings.googleMapsUrl || 'https://maps.google.com/?q=0,0'}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-google-maps-footer"
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center sm:text-left text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={requestAdminAccess}
            className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer focus:outline-none"
            title="Acesso Seguro / Painel Administrativo"
          >
            © {new Date().getFullYear()} {settings.storeName || 'Loja'}. Todos os direitos reservados.
          </button>
          <span className="text-[11px] text-neutral-600">
            Painel Administrativo & Backup Integrado
          </span>
        </div>
      </div>
    </footer>
  );
};
