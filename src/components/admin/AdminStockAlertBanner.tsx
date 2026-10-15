import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AlertTriangle, Boxes, CheckCircle2, Sliders, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  onNavigateToStock?: () => void;
}

export const AdminStockAlertBanner: React.FC<Props> = ({ onNavigateToStock }) => {
  const { lowStockProducts, outOfStockProducts, settings, updateSettings } = useStore();
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(settings.lowStockThreshold || 3);
  const [feedback, setFeedback] = useState('');

  const totalCritical = lowStockProducts.length + outOfStockProducts.length;

  const handleSaveThreshold = (newVal: number) => {
    const val = Math.max(1, Math.min(50, newVal));
    setThresholdInput(val);
    updateSettings({ lowStockThreshold: val });
    setIsEditingThreshold(false);
    setFeedback(`Limite de alerta de estoque configurado para ${val} unidade(s)!`);
    setTimeout(() => setFeedback(''), 3500);
  };

  if (totalCritical === 0 && !isEditingThreshold) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">Monitoramento de Estoque Normal:</span> Todos os produtos estão com níveis saudáveis (acima do limite configurado de <strong className="underline">{settings.lowStockThreshold} un</strong>).
          </div>
        </div>
        <button
          onClick={() => setIsEditingThreshold(true)}
          className="text-emerald-800 hover:text-emerald-950 font-semibold inline-flex items-center gap-1 underline cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          Configurar limite ({settings.lowStockThreshold} un)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      {feedback && (
        <div className="p-2.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
        outOfStockProducts.length > 0
          ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20 text-rose-950'
          : 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              outOfStockProducts.length > 0
                ? 'bg-rose-200 text-rose-800 animate-pulse'
                : 'bg-amber-200 text-amber-800'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-current shadow-2xs">
                  {outOfStockProducts.length > 0 ? '⚠️ Alerta Crítico de Estoque' : '⚡ Alerta de Estoque Mínimo'}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  Limite configurado: <strong className="text-neutral-900">{settings.lowStockThreshold} unidades</strong>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold leading-snug">
                {outOfStockProducts.length > 0 && (
                  <span className="text-rose-700 mr-2">
                    • {outOfStockProducts.length} produto(s) totalmente esgotado(s)!
                  </span>
                )}
                {lowStockProducts.length > 0 && (
                  <span className="text-amber-800">
                    • {lowStockProducts.length} produto(s) com estoque baixo (&le; {settings.lowStockThreshold} un).
                  </span>
                )}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[...outOfStockProducts.slice(0, 3), ...lowStockProducts.slice(0, 3)].map((item) => {
                  const prod = 'product' in item ? item.product : item;
                  const qty = 'totalStock' in item ? item.totalStock : 0;
                  return (
                    <span
                      key={prod.id}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                        qty === 0
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-amber-100 border-amber-300 text-amber-900'
                      }`}
                    >
                      {prod.name}: <strong>{qty === 0 ? 'ZERADO' : `${qty} un`}</strong>
                    </span>
                  );
                })}
                {totalCritical > 6 && (
                  <span className="text-[11px] text-neutral-500 self-center">
                    +{totalCritical - 6} outros itens
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons and quick threshold configurator */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            {isEditingThreshold ? (
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-neutral-300 shadow-xs">
                <span className="text-xs font-semibold text-neutral-700 pl-1.5">Limite:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-center"
                />
                <button
                  onClick={() => handleSaveThreshold(thresholdInput)}
                  className="px-2.5 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditingThreshold(false)}
                  className="px-2 py-1 text-neutral-500 hover:text-neutral-900 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingThreshold(true)}
                className="px-3 py-2 bg-white/90 hover:bg-white text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Ajustar o número mínimo de peças que aciona este alerta"
              >
                <Sliders className="w-3.5 h-3.5 text-neutral-600" />
                <span>Configurar Limite ({settings.lowStockThreshold} un)</span>
              </button>
            )}

            {onNavigateToStock && (
              <button
                onClick={onNavigateToStock}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Boxes className="w-3.5 h-3.5 text-rose-300" />
                <span>Repor & Gerenciar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
