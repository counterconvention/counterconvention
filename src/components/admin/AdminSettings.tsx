import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings, DEFAULT_CATEGORIES } from '../../types';
import { AdminUserHandleSync } from './AdminUserHandleSync';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { DiscordIcon } from '../icons/DiscordIcon';
import { testDiscordWebhook } from '../../utils/discordIntegration';
import {
  Settings,
  Save,
  CheckCircle2,
  Phone,
  Instagram,
  MapPin,
  Clock,
  Mail,
  Bell,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  Shield,
  Layers,
  Radio
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, addNotification } = useStore();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [discordTestFeedback, setDiscordTestFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Sync form state when store settings change externally
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 4000);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const currentCats = formData.categories || DEFAULT_CATEGORIES;
    if (currentCats.includes(trimmed)) return;

    const updated = [...currentCats, trimmed];
    setFormData({ ...formData, categories: updated });
    setNewCategoryInput('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const currentCats = formData.categories || DEFAULT_CATEGORIES;
    if (currentCats.length <= 1) return;
    const updated = currentCats.filter((c) => c !== catToRemove);
    setFormData({ ...formData, categories: updated });
  };

  const handleTestDiscord = async () => {
    if (!formData.discordWebhookUrl) return;
    setTestingDiscord(true);
    setDiscordTestFeedback(null);

    const res = await testDiscordWebhook(formData.discordWebhookUrl, formData.storeName);
    setTestingDiscord(false);
    setDiscordTestFeedback(res);

    if (res.success) {
      addNotification({
        title: 'Webhook do Discord Testado',
        message: 'A mensagem de verificação foi enviada ao servidor com sucesso.',
        type: 'info'
      });
    }
  };

  const currentCategories = formData.categories || DEFAULT_CATEGORIES;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1-Click @ Handle Integration */}
      <AdminUserHandleSync />

      {savedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Configurações salvas com sucesso! As integrações modulares, dados e regras foram sincronizados em todo o site.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Identidade & Segmento da Loja */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Sparkles className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Identidade & Marca da Loja
              </h3>
              <p className="text-xs text-neutral-500">
                Nome da loja, slogan e segmento exibidos no cabeçalho e rodapé.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Nome da Loja *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="Replace Store"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 bg-neutral-50/50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="replace your tagline here"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                Descrição do Segmento / Nicho
              </label>
              <input
                type="text"
                value={formData.nicheDescription || ''}
                onChange={(e) => setFormData({ ...formData, nicheDescription: e.target.value })}
                placeholder="Ex: Loja e catálogo versátil multissegmento"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                Texto de Boas-Vindas / Subtítulo do Catálogo
              </label>
              <textarea
                rows={2}
                value={formData.catalogSubtitle ?? ''}
                onChange={(e) => setFormData({ ...formData, catalogSubtitle: e.target.value })}
                placeholder="Selecione suas peças favoritas, confira disponibilidade de cores e tamanhos em tempo real e feche seu pedido com atendimento via WhatsApp."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs resize-y"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Exibido no banner de boas-vindas do catálogo na página inicial.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Integrações Modulares (WhatsApp, Instagram, Discord) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Radio className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Integrações & Redes Modulares
              </h3>
              <p className="text-xs text-neutral-500">
                Ative ou desative canais de comunicação com 1 clique. O site se adapta dinamicamente.
              </p>
            </div>
          </div>

          {/* MÓDULO 1: WhatsApp */}
          <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                    Integração WhatsApp (Checkout & Atendimento)
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Controla o botão no cabeçalho, botão flutuante e checkout wa.me.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.whatsappEnabled !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {formData.whatsappEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-200/60">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Número WhatsApp (com DDI e DDD)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="00000000000"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Usado para gerar o link direto wa.me/55...
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    WhatsApp Formatado (Exibição Visual)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappDisplay}
                    onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Exibido no rodapé e informações de atendimento
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MÓDULO 2: Instagram */}
          <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                    Integração Instagram (Feed, Bio & Perfil)
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Controla a seção de galeria do Instagram, contadores e botão no cabeçalho.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.instagramEnabled !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            {formData.instagramEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-200/60">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Nome de Usuário (@handle do Instagram)
                  </label>
                  <input
                    type="text"
                    value={formData.instagramUser}
                    onChange={(e) => setFormData({ ...formData, instagramUser: e.target.value })}
                    placeholder="replace"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Link Completo do Perfil
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/replace"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Seguidores (Exibição)
                  </label>
                  <input
                    type="text"
                    value={formData.instagramFollowers}
                    onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
                    placeholder="0k"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Número de Publicações (Exibição)
                  </label>
                  <input
                    type="number"
                    value={formData.instagramPostsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramPostsCount: parseInt(e.target.value, 10) || 0
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Bio Oficial do Instagram (Configurável)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.instagramBio}
                    onChange={(e) => setFormData({ ...formData, instagramBio: e.target.value })}
                    placeholder="replace here bio"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs resize-y"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Exibida no cartão de perfil do Instagram na página inicial.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MÓDULO 3: Discord */}
          <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                    Integração Discord (Comunidade & Webhook de Pedidos)
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Adiciona botões para o Discord e permite receber notificações automáticas de cada novo pedido em um canal do servidor.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.discordEnabled !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, discordEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {formData.discordEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-200/60">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Link de Convite do Servidor Discord
                  </label>
                  <input
                    type="url"
                    value={formData.discordUrl}
                    onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                    placeholder="https://discord.gg/replace"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Nome de Exibição da Comunidade
                  </label>
                  <input
                    type="text"
                    value={formData.discordServerName}
                    onChange={(e) => setFormData({ ...formData, discordServerName: e.target.value })}
                    placeholder="Replace Community"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="font-semibold text-neutral-700 block">
                    URL do Webhook do Discord (Notificação Automática de Novos Pedidos)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.discordWebhookUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, discordWebhookUrl: e.target.value })
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleTestDiscord}
                      disabled={testingDiscord || !formData.discordWebhookUrl}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{testingDiscord ? 'Testando...' : 'Testar Webhook'}</span>
                    </button>
                  </div>

                  {discordTestFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        discordTestFeedback.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {discordTestFeedback.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{discordTestFeedback.message}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-neutral-400">
                    No Discord: Configurações do Canal &gt; Integrações &gt; Criar Webhook &gt; Copiar URL do Webhook.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Gestor de Categorias & Segmento Versátil */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Layers className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Categorias & Segmento do Catálogo
              </h3>
              <p className="text-xs text-neutral-500">
                Personalize as categorias da loja para vender qualquer tipo de produto (Tech, Acessórios, Casa, etc.).
              </p>
            </div>
          </div>

          {/* Current Categories Chips */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-neutral-700 block mb-2">
              Categorias Ativas ({currentCategories.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800"
                >
                  <span>{cat}</span>
                  {currentCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title={`Remover categoria ${cat}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Add Category Row */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Nome de uma nova categoria..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Categoria</span>
            </button>
          </div>
        </div>

        {/* 4. Contatos, E-mail & Endereço */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <MapPin className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Contatos & Ponto de Atendimento
              </h3>
              <p className="text-xs text-neutral-500">
                Informações de suporte exibidas no rodapé da loja.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                E-mail de Atendimento
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="replace@email.com"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Telefone Fixo / Suporte
              </label>
              <input
                type="text"
                value={formData.landline}
                onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                placeholder="(00) 0000-0000"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Endereço / Logradouro
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua Exemplo, 000 - Bairro"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Cidade, Estado & CEP
              </label>
              <input
                type="text"
                value={formData.cityState}
                onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                placeholder="Cidade - UF, CEP 00000-000"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                URL do Google Maps
              </label>
              <input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/?q=0,0"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                Horário de Atendimento
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                placeholder="Segunda a Sexta: 00:00 às 00:00"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 5. Regras Comerciais, Banner & Segurança */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Bell className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Regras Comerciais & Segurança
              </h3>
              <p className="text-xs text-neutral-500">
                Banner superior, frete grátis, estoque mínimo e PIN de acesso.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="check-announcement"
                checked={formData.bannerEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, bannerEnabled: e.target.checked })
                }
                className="rounded-sm text-neutral-900 focus:ring-neutral-900"
              />
              <label htmlFor="check-announcement" className="font-bold text-neutral-800 cursor-pointer">
                Exibir Barra de Avisos no topo do site
              </label>
            </div>

            {formData.bannerEnabled && (
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Texto da Barra de Avisos
                </label>
                <input
                  type="text"
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  placeholder="Frete Grátis nas compras acima de R$ 500 • 5% OFF no Pix"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Frete Grátis a partir de (R$)
                </label>
                <input
                  type="number"
                  value={formData.freeShippingMinimum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      freeShippingMinimum: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Chave Pix da Loja
                </label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="replace@email.com"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Alerta de Estoque Baixo (un.)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value, 10) || 3
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  PIN de Acesso Admin
                </label>
                <input
                  type="text"
                  value={formData.adminPin || '9000'}
                  onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                  placeholder="9000"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-save-settings"
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Salvar Todas as Configurações da Loja</span>
          </button>
        </div>
      </form>
    </div>
  );
};
