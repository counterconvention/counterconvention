import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { playOrderNotificationSound } from '../../utils/audio';
import {
  Bell,
  BellRing,
  Send,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Info,
  CheckCircle2,
  Sparkles,
  Volume2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  X,
  Megaphone,
  Check
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    addNotification,
    deleteNotification,
    notificationPermission,
    requestBrowserPushPermission,
    disableBrowserPushAlerts,
    triggerTestOrderNotification,
    testNotificationCountdown
  } = useStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'promo' | 'order' | 'alert' | 'info'>('promo');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [soundPlaying, setSoundPlaying] = useState(false);

  const isActivated = notificationPermission === 'granted';

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      title,
      message,
      type
    });

    setTitle('');
    setMessage('');
    setFeedback({
      text: 'Aviso publicado com sucesso! Ele já está visível para os visitantes do catálogo.',
      type: 'success'
    });
  };

  const handleRequestPush = async () => {
    const granted = await requestBrowserPushPermission();
    if (granted) {
      setFeedback({
        text: 'Notificações Push e alertas sonoros foram ativados com sucesso no painel!',
        type: 'success'
      });
    } else {
      setFeedback({
        text: 'Não foi possível ativar nativamente pelo navegador. As notificações em aba e alertas sonoros continuam ativos no painel.',
        type: 'info'
      });
    }
  };

  const handleDisablePush = () => {
    disableBrowserPushAlerts();
    setFeedback({
      text: 'Alertas automáticos desativados. Você pode reativá-los a qualquer momento.',
      type: 'info'
    });
  };

  const handleTestCountdown = (seconds: number) => {
    triggerTestOrderNotification(seconds);
    if (seconds > 0) {
      setFeedback({
        text: `Simulação agendada para ${seconds}s! Alterne para outra aba para ver o banner e o sinal sonoro em segundo plano.`,
        type: 'info'
      });
    }
  };

  const handlePlaySoundPreview = () => {
    setSoundPlaying(true);
    playOrderNotificationSound();
    setTimeout(() => setSoundPlaying(false), 1200);
  };

  const applyTemplate = (tplTitle: string, tplMessage: string, tplType: 'promo' | 'order' | 'alert' | 'info') => {
    setTitle(tplTitle);
    setMessage(tplMessage);
    setType(tplType);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'all') return true;
    return notif.type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card: Push & Real-time Alerts */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                isActivated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {isActivated ? (
                  <BellRing className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Bell className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div>
                <h3 className="font-sans font-bold text-lg text-white">
                  Alertas Sonoros & Notificações de Novos Pedidos
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-400">Status dos Alertas:</span>
                  {isActivated ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Ativado & Monitorando Ativamente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Clock className="w-3 h-3" />
                      Pendente de Ativação
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed pt-1">
              Receba avisos instantâneos com sinal sonoro e notificação na tela do computador ou celular assim que um cliente enviar ou confirmar um novo pedido.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {/* The Activate button ONLY shows when NOT activated, and disappears immediately when activated */}
            {!isActivated ? (
              <button
                onClick={handleRequestPush}
                id="btn-activate-push"
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ativar Notificações no Navegador</span>
              </button>
            ) : (
              <button
                onClick={handleDisablePush}
                id="btn-disable-push"
                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold rounded-2xl border border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Pausar alertas de pedidos temporariamente"
              >
                <span>Pausar Alertas</span>
              </button>
            )}

            {/* Test buttons */}
            <button
              onClick={() => handleTestCountdown(5)}
              disabled={testNotificationCountdown !== null}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              title="Dispara uma notificação daqui a 5 segundos para você trocar de aba e ver funcionando"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                {testNotificationCountdown !== null
                  ? `Disparando em ${testNotificationCountdown}s...`
                  : 'Testar em 5s (Mudar de aba)'}
              </span>
            </button>

            <button
              onClick={handlePlaySoundPreview}
              className="px-3.5 py-3 bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white text-xs font-semibold rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Ouvir som de aviso de pedido"
            >
              <Volume2 className={`w-3.5 h-3.5 text-rose-400 ${soundPlaying ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>{soundPlaying ? 'Tocando Som...' : 'Ouvir Som'}</span>
            </button>
          </div>
        </div>

        {/* PERMANENT Confirmation Box when Activated: Stays visible permanently! */}
        {isActivated && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">
                  Alertas Ativados & Conectados com Sucesso
                </p>
                <p className="text-emerald-300/80 text-[11px] mt-0.5">
                  O painel está configurado para emitir o som oficial e exibir alertas visuais em tempo real sempre que um pedido for finalizado no WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                Monitoramento Ativo
              </span>
            </div>
          </div>
        )}

        {/* Live Countdown Banner if simulation active */}
        {testNotificationCountdown !== null && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-100">
                  Simulação em andamento: {testNotificationCountdown} segundo{testNotificationCountdown !== 1 ? 's' : ''}!
                </p>
                <p className="text-amber-200/90 text-xs">
                  👉 <strong>Alterne para outra aba do navegador agora</strong> para conferir o banner nativo do sistema e o som tocando em segundo plano.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dismissible Feedback Message (when user takes an action) */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs border ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : feedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-neutral-500 hover:text-neutral-800 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: Create Announcement + History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-rose-600" />
              <h4 className="font-sans font-bold text-neutral-900 text-base">
                Criar Comunicado
              </h4>
            </div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase">
              Exibido no Catálogo
            </span>
          </div>

          {/* Quick Template Chips */}
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Sugestões Rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate(
                  '✨ Novos Produtos Disponíveis no Catálogo!',
                  'Confira os novos lançamentos e produtos em estoque com condições exclusivas e envio ágil.',
                  'promo'
                )}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium border border-neutral-200 cursor-pointer"
              >
                + Novos Lançamentos
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(
                  '✈️ Frete Grátis acima de R$ 500',
                  'Aproveite frete grátis em todas as compras acima de R$ 500 para todo o Brasil.',
                  'info'
                )}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-700 rounded-lg transition-colors font-medium border border-neutral-200"
              >
                + Frete Grátis
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(
                  '💎 5% OFF no Pix',
                  'Desconto especial de 5% aplicado automaticamente em todos os pagamentos via Pix.',
                  'promo'
                )}
                className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-amber-50 hover:text-amber-800 text-neutral-700 rounded-lg transition-colors font-medium border border-neutral-200"
              >
                + Desconto Pix
              </button>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Título do Comunicado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ✨ Nova Coleção de Seda Verona Chegou!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-neutral-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Tipo do Comunicado
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'promo' | 'order' | 'alert' | 'info')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50 font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="promo">Promoção / Coleção Nova</option>
                <option value="alert">Alerta de Estoque / Loja</option>
                <option value="info">Informativo Geral / Frete</option>
                <option value="order">Aviso de Pedido</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Mensagem Completa *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Novos produtos em estoque disponíveis para pronta entrega com garantia e envio rápido..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-neutral-50/50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-rose-300" />
              <span>Publicar no Catálogo</span>
            </button>
          </form>
        </div>

        {/* History of Notifications */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-700" />
              <h4 className="font-sans font-bold text-neutral-900 text-base">
                Histórico de Avisos ({notifications.length})
              </h4>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Todos ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('promo')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === 'promo'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Promoções
              </button>
              <button
                onClick={() => setFilterType('order')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === 'order'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setFilterType('info')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === 'info'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Informativos
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 text-xs">
                <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="font-semibold text-neutral-700">Nenhum aviso encontrado</p>
                <p className="text-neutral-400 mt-0.5">
                  {filterType !== 'all' ? 'Nenhum aviso para esta categoria.' : 'Os comunicados publicados aparecerão aqui.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex items-start justify-between gap-4 group hover:border-neutral-300 hover:bg-neutral-50 transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-xs">
                        {notif.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                          notif.type === 'alert'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : notif.type === 'order'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : notif.type === 'promo'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-neutral-200/80 text-neutral-700'
                        }`}
                      >
                        {notif.type === 'alert'
                          ? 'Alerta'
                          : notif.type === 'order'
                          ? 'Pedido'
                          : notif.type === 'promo'
                          ? 'Promoção'
                          : 'Informativo'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-neutral-400 block pt-1">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Excluir notificação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
