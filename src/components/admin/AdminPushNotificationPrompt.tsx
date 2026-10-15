import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AdminPushNotificationPrompt: React.FC = () => {
  const {
    notificationPermission,
    requestBrowserPushPermission,
    triggerTestOrderNotification,
    testNotificationCountdown
  } = useStore();

  const [requestFeedback, setRequestFeedback] = useState('');

  const isGranted = notificationPermission === 'granted';

  const handleRequestPermission = async () => {
    const granted = await requestBrowserPushPermission();
    if (granted) {
      setRequestFeedback('Permissão concedida com sucesso! Notificações nativas ativadas.');
    } else {
      setRequestFeedback('Permissão não concedida. Você pode alterar nas configurações do navegador.');
    }
  };

  return (
    <div className="rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs">
      {requestFeedback && (
        <div className="p-3 bg-neutral-900 text-white text-xs font-semibold flex items-center justify-between">
          <span>{requestFeedback}</span>
          <button
            onClick={() => setRequestFeedback('')}
            className="text-neutral-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            notificationPermission === 'granted'
              ? 'bg-emerald-100 text-emerald-700'
              : notificationPermission === 'denied'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
          }`}>
            {notificationPermission === 'granted' ? (
              <BellRing className="w-5 h-5 text-emerald-600 animate-bounce" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-sans font-bold text-neutral-900 text-sm sm:text-base">
                Alertas Push Nativos & Service Worker em Segundo Plano
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {notificationPermission === 'granted'
                  ? 'Ativado no Navegador'
                  : notificationPermission === 'denied'
                  ? 'Bloqueado no Navegador'
                  : 'Pendente de Ativação'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
              Dispara notificações sonoras na área de trabalho e no celular mesmo se você estiver em outra aba, minimizado ou com o painel fechado. Sincronizado via Service Worker e BroadcastChannel.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Ativar Alertas Nativos Agora</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Service Worker Ativo</span>
            </div>
          )}

          {/* Background Test Trigger */}
          <button
            onClick={() => triggerTestOrderNotification(5)}
            disabled={testNotificationCountdown !== null}
            className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            title="Inicia contagem de 5 segundos para você minimizar esta aba e ver a notificação nativa tocar no seu sistema"
          >
            {testNotificationCountdown !== null ? (
              <>
                <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Minimizar agora! ({testNotificationCountdown}s)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-rose-300" />
                <span>Testar Notificação (5s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
