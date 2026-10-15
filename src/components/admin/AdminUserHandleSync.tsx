import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  deriveStoreDataFromHandle,
  DerivedStoreData
} from '../../utils/instagramIntegration';
import {
  Instagram,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminUserHandleSync: React.FC = () => {
  const { settings, updateSettings, addNotification } = useStore();
  const [handleInput, setHandleInput] = useState(settings.instagramUser ? `@${settings.instagramUser}` : '@counter.oficial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<DerivedStoreData | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePreview = (inputVal: string) => {
    setHandleInput(inputVal);
    const derived = deriveStoreDataFromHandle(inputVal);
    setPreviewData(derived);
  };

  const handleApplySync = (dataToApply?: DerivedStoreData) => {
    const data = dataToApply || previewData || deriveStoreDataFromHandle(handleInput);
    setIsProcessing(true);

    setTimeout(() => {
      // Apply updates to the store
      updateSettings({
        storeName: data.storeName,
        tagline: data.tagline,
        instagramUser: data.instagramUser,
        instagramUrl: data.instagramUrl,
        instagramFollowers: data.instagramFollowers,
        instagramPostsCount: data.instagramPostsCount,
        instagramBio: data.instagramBio
      });

      // Also trigger in-app notification
      addNotification({
        title: `Loja sincronizada com @${data.instagramUser}`,
        message: `Dados da marca, links e rodapé foram atualizados.`,
        type: 'info'
      });

      setIsProcessing(false);
      setSuccessMessage(`Loja sincronizada com sucesso para @${data.instagramUser}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 400);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
        <Instagram className="w-5 h-5 text-neutral-900" />
        <h3 className="font-sans font-bold text-neutral-900 text-base">
          Sincronização
        </h3>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Input Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm select-none">
            @
          </span>
          <input
            type="text"
            value={handleInput.replace(/^@/, '')}
            onChange={(e) => handlePreview(e.target.value)}
            placeholder="usuario_ou_marca"
            className="w-full pl-8 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 font-mono text-xs focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
          />
        </div>

        <button
          type="button"
          onClick={() => handleApplySync()}
          disabled={isProcessing || !handleInput.trim()}
          className="h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0 active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Sincronização</span>
        </button>
      </div>

      {/* Live Preview Card */}
      {previewData && (
        <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
            <span>Prévia dos dados extraídos</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Pronto para sincronizar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-neutral-200/70">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Nome da Loja</span>
              <span className="text-xs font-bold text-neutral-900 mt-0.5 block truncate">{previewData.storeName}</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-neutral-200/70">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Instagram</span>
              <span className="text-xs font-mono text-neutral-800 mt-0.5 block truncate">@{previewData.instagramUser}</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-neutral-200/70">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Seguidores / Posts</span>
              <span className="text-xs font-bold text-neutral-800 mt-0.5 block">
                {previewData.instagramFollowers} • {previewData.instagramPostsCount} posts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-neutral-200/70">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Links & WhatsApp</span>
              <span className="text-xs font-semibold text-neutral-700 mt-1 block">
                Atualização imediata
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
