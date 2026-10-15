import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  AlertCircle,
  ShoppingBag,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    notificationPermission,
    requestBrowserPushPermission
  } = useStore();

  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const isActivated = notificationPermission === 'granted';

  const handleRequestPush = async () => {
    const granted = await requestBrowserPushPermission();
    if (!granted) {
      setErrorMessage('Permissão não concedida no navegador.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-rose-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-screen sm:max-h-[85vh] mt-0 sm:mt-16 mr-0 sm:mr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Central de Avisos</h3>
              <p className="text-xs text-neutral-500">
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} novidade(s) não lida(s)`
                  : 'Você está em dia com os comunicados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification status or prompt */}
        {isActivated ? (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium text-emerald-900">Notificações ativadas no navegador</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              Ativo
            </span>
          </div>
        ) : (
          <div className="px-4 py-2.5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between text-xs">
            <span className="text-neutral-700 font-medium">Receba promoções e novidades</span>
            <button
              onClick={handleRequestPush}
              id="btn-popover-activate-push"
              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Ativar Notificações
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="px-4 py-1.5 bg-rose-50 text-rose-800 text-xs text-center border-b border-rose-100">
            {errorMessage}
          </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y divide-neutral-100 p-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 transition-colors rounded-xl flex items-start gap-3 relative group ${
                  notif.isRead ? 'bg-white opacity-80' : 'bg-rose-50/30'
                }`}
                onClick={() => markNotificationAsRead(notif.id)}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-neutral-100/80 shrink-0">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 transition-opacity absolute top-3 right-3"
                  title="Excluir notificação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas como lidas
            </button>
            <span className="text-neutral-400">{notifications.length} avisos</span>
          </div>
        )}
      </div>
    </div>
  );
};
