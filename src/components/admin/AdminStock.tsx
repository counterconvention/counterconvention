import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductSize, ProductCategory } from '../../types';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Ban,
  SlidersHorizontal
} from 'lucide-react';

interface AdminStockProps {
  initialSearchTerm?: string;
}

export const AdminStock: React.FC<AdminStockProps> = ({ initialSearchTerm = '' }) => {
  const {
    products,
    bulkAdjustStock,
    setProductSizeStock,
    setAllSizesStock,
    bulkCategoryStockAdjustment,
    lowStockProducts,
    outOfStockProducts,
    settings,
    updateSettings
  } = useStore();

  const activeCategories = settings.categories && settings.categories.length > 0
    ? settings.categories
    : ['Geral', 'Eletrônicos & Tech', 'Acessórios', 'Casa & Estilo', 'Vestuário'];

  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>(activeCategories[0] || 'Geral');
  const [bulkAmount, setBulkAmount] = useState<number>(5);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [thresholdVal, setThresholdVal] = useState(settings.lowStockThreshold || 3);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const handleUpdateThreshold = (val: number) => {
    const clamped = Math.max(1, Math.min(50, val));
    setThresholdVal(clamped);
    updateSettings({ lowStockThreshold: clamped });
    setFeedbackMsg(`Limite mínimo de alerta de estoque configurado para ${clamped} unidade(s)!`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleApplyBulkCategory = () => {
    bulkCategoryStockAdjustment(bulkCategoryTarget, bulkAmount);
    setFeedbackMsg(`Estoque de todos os ${bulkCategoryTarget} atualizado com +${bulkAmount} un. por tamanho!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const filteredProducts = products.filter((p) => {
    const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesFilter = true;
    if (stockFilter === 'low') {
      matchesFilter = totalStock > 0 && totalStock <= settings.lowStockThreshold;
    } else if (stockFilter === 'out') {
      matchesFilter = totalStock === 0;
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Notification */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Reformulated Clean Stock Alert Banner (Exclusively in Stock Tab) */}
      {lowStockProducts.length > 0 || outOfStockProducts.length > 0 ? (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xs transition-all ${
          outOfStockProducts.length > 0
            ? 'bg-rose-50/90 border-rose-200 text-rose-950'
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                outOfStockProducts.length > 0
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-amber-200 text-amber-800'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-current">
                    {outOfStockProducts.length > 0 ? 'Nível Crítico de Estoque' : 'Alerta de Reposição'}
                  </span>
                  <span className="text-xs text-neutral-600">
                    Limite operacional: <strong>{settings.lowStockThreshold} un</strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold">
                  {outOfStockProducts.length > 0 && (
                    <span className="text-rose-700 mr-2">
                      {outOfStockProducts.length} modelo(s) totalmente esgotado(s)
                    </span>
                  )}
                  {lowStockProducts.length > 0 && (
                    <span className="text-amber-800">
                      {outOfStockProducts.length > 0 ? ' • ' : ''}
                      {lowStockProducts.length} modelo(s) com estoque crítico (&le; {settings.lowStockThreshold} un)
                    </span>
                  )}
                </p>

                {/* Direct Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-neutral-600">Filtrar tabela:</span>
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      stockFilter === 'all'
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-white/80 hover:bg-white text-neutral-700 border border-neutral-300'
                    }`}
                  >
                    Todos ({products.length})
                  </button>
                  {lowStockProducts.length > 0 && (
                    <button
                      onClick={() => setStockFilter('low')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        stockFilter === 'low'
                          ? 'bg-amber-800 text-white shadow-2xs'
                          : 'bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      }`}
                    >
                      Críticos ({lowStockProducts.length})
                    </button>
                  )}
                  {outOfStockProducts.length > 0 && (
                    <button
                      onClick={() => setStockFilter('out')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        stockFilter === 'out'
                          ? 'bg-rose-800 text-white shadow-2xs'
                          : 'bg-rose-100/90 hover:bg-rose-200 text-rose-900 border border-rose-300'
                      }`}
                    >
                      Zerados ({outOfStockProducts.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Threshold Inline Editor */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 bg-white/80 p-2 rounded-xl border border-neutral-200">
              <span className="text-xs font-semibold text-neutral-600">Limite:</span>
              {[2, 3, 5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdateThreshold(val)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    settings.lowStockThreshold === val
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {val} un
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="50"
                value={thresholdVal}
                onChange={(e) => handleUpdateThreshold(Number(e.target.value))}
                className="w-11 px-1 py-0.5 rounded border border-neutral-300 text-xs font-bold text-center bg-white"
                title="Ajuste manual do limite"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Estoque Regular:</strong> Todos os produtos estão com níveis saudáveis (acima de <strong>{settings.lowStockThreshold} un</strong>).
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-emerald-700 font-medium">Limite atual:</span>
            {[2, 3, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleUpdateThreshold(val)}
                className={`px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer ${
                  settings.lowStockThreshold === val
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                }`}
              >
                {val} un
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Stock Items */}
        <div
          onClick={() => setStockFilter('all')}
          className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            stockFilter === 'all'
              ? 'bg-neutral-50 border-neutral-900 ring-1 ring-neutral-900'
              : 'bg-white border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Estoque Geral
            </span>
            <div className="text-2xl font-extrabold text-neutral-900 mt-0.5 font-sans">
              {products.reduce(
                (sum, p) => sum + p.sizes.reduce((sSum, s) => sSum + s.quantity, 0),
                0
              )}{' '}
              <span className="text-xs font-normal text-neutral-500">unidades</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Alerta: Estoque Baixo */}
        <div
          onClick={() => setStockFilter('low')}
          className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            stockFilter === 'low'
              ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Estoque Crítico (&le; {settings.lowStockThreshold} un)
            </span>
            <div className="text-2xl font-extrabold text-amber-900 mt-0.5 font-sans">
              {lowStockProducts.length}{' '}
              <span className="text-xs font-normal text-amber-700">modelos</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Alerta: Esgotados */}
        <div
          onClick={() => setStockFilter('out')}
          className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            stockFilter === 'out'
              ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-400/30'
              : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Modelos Esgotados
            </span>
            <div className="text-2xl font-extrabold text-rose-900 mt-0.5 font-sans">
              {outOfStockProducts.length}{' '}
              <span className="text-xs font-normal text-rose-700">zerados</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-200/80 text-rose-800 flex items-center justify-center">
            <Minus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Reabastecimento por Categoria (Ajuste em Massa) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-sans font-bold text-sm sm:text-base flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-300" />
            Reabastecimento por Categoria
          </h3>
          <p className="text-xs text-neutral-400">
            Adiciona quantidade uniforme em todos os tamanhos da categoria selecionada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={bulkCategoryTarget}
            onChange={(e) => setBulkCategoryTarget(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-neutral-800 border border-neutral-700 text-white font-medium"
          >
            {activeCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-xl px-2 py-1">
            <span className="text-xs text-neutral-400 font-semibold">+</span>
            <input
              type="number"
              min="1"
              max="50"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(parseInt(e.target.value, 10) || 1)}
              className="w-12 text-center text-xs font-bold text-white bg-transparent"
            />
            <span className="text-xs text-neutral-400">un/tam</span>
          </div>

          <button
            onClick={handleApplyBulkCategory}
            className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Aplicar em Massa
          </button>
        </div>
      </div>

      {/* 3. Filtros da Lista de Estoque */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar produto para ajuste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-700 font-medium"
          >
            <option value="all">Todas</option>
            {activeCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'low' ? 'bg-white text-amber-800 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Baixo ({lowStockProducts.length})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'out' ? 'bg-white text-rose-800 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Esgotados ({outOfStockProducts.length})
          </button>
        </div>
      </div>

      {/* Informative Banner */}
      <div className="p-3.5 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <Boxes className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-snug">
            <strong>Central de Controle de Estoque:</strong> O estoque individual por tamanho gerencia a disponibilidade de todo o e-commerce. Qualquer mudança reflete imediatamente no catálogo, na sacola e nos pedidos.
          </span>
        </div>
      </div>

      {/* 4. Lista e Controles Fáceis de Estoque (Mobile & PC) */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {filteredProducts.map((p) => {
            const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
            const isLow = totalStock <= settings.lowStockThreshold;

            return (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col gap-4 hover:bg-neutral-50/70 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Product Summary */}
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-14 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-sans font-bold text-neutral-900 text-sm line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-neutral-500 block">
                        {p.category} • R$ {p.salePrice.toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            totalStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Total: {totalStock} un.
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {p.sizeSystem === 'generic' ? 'Tamanho Único' : p.sizeSystem === 'numeric' ? 'Grade Numérica' : 'Grade Letras'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sizes Stock Controller: Granular per-size input & steppers */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {p.sizes.map((s) => {
                      const isZero = s.quantity === 0;
                      const isCritical = s.quantity > 0 && s.quantity <= settings.lowStockThreshold;

                      return (
                        <div
                          key={s.size}
                          className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all shadow-2xs ${
                            isZero
                              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300/30'
                              : isCritical
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/30'
                              : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full px-1 gap-1.5">
                            <span className="text-xs font-black text-neutral-900">
                              {s.size}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded-md ${
                                isZero
                                  ? 'bg-rose-200 text-rose-800'
                                  : isCritical
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isZero ? 'Esgotado' : isCritical ? 'Crítico' : 'OK'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Minus Button */}
                            <button
                              onClick={() => bulkAdjustStock(p.id, s.size, -1)}
                              disabled={s.quantity <= 0}
                              className="w-7 h-7 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 active:scale-95 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Diminuir 1 un."
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            {/* Direct Number Input */}
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={s.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setProductSizeStock(p.id, s.size, isNaN(val) ? 0 : Math.max(0, val));
                              }}
                              className="w-12 h-7 text-center font-extrabold text-xs text-neutral-900 font-mono bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-inner"
                              title="Digite a quantidade exata deste tamanho"
                            />

                            {/* Plus Button */}
                            <button
                              onClick={() => bulkAdjustStock(p.id, s.size, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Adicionar 1 un."
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Row Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAllSizesStock(p.id, 0);
                        setFeedbackMsg(`Estoque de "${p.name}" foi zerado (marcado como esgotado no site).`);
                        setTimeout(() => setFeedbackMsg(''), 3500);
                      }}
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Zerar todos os tamanhos deste produto"
                    >
                      <Ban className="w-3 h-3 text-rose-600" />
                      <span>Zerar Tudo</span>
                    </button>
                    <span className="text-neutral-200">|</span>
                    <button
                      onClick={() => {
                        const input = prompt(`Definir quantidade padrão para todos os tamanhos de "${p.name}":`, '5');
                        if (input !== null) {
                          const val = Math.max(0, parseInt(input, 10) || 0);
                          setAllSizesStock(p.id, val);
                          setFeedbackMsg(`Estoque de "${p.name}" definido para ${val} un. em todos os tamanhos!`);
                          setTimeout(() => setFeedbackMsg(''), 3500);
                        }
                      }}
                      className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Definir a mesma quantidade para todos os tamanhos"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-neutral-500" />
                      <span>Definir Igual</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    ID: #{p.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
