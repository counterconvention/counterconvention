import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, X, ArrowRight, CheckCircle } from 'lucide-react';

export const RealTimeOrderToast: React.FC = () => {
  const { latestNewOrder, dismissLatestOrder, setCurrentView } = useStore();

  if (!latestNewOrder) return null;

  const handleOpenAdminOrders = () => {
    setCurrentView('admin');
    dismissLatestOrder();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl border border-rose-500/40 flex items-start gap-3.5 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />

        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <ShoppingBag className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">
              Novo Pedido em Tempo Real!
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              #{latestNewOrder.id}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mt-1">
            {latestNewOrder.customer.name}
          </h4>

          <p className="text-xs text-neutral-300 mt-0.5">
            {latestNewOrder.items.length} produto(s) • Total:{' '}
            <strong className="text-white font-extrabold">
              R$ {latestNewOrder.total.toFixed(2).replace('.', ',')}
            </strong>
          </p>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleOpenAdminOrders}
              className="text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              Ver no Painel Admin
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-neutral-600">•</span>
            <span className="text-[11px] text-neutral-400">
              {latestNewOrder.customer.deliveryMethod}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={dismissLatestOrder}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1"
          title="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
