import React, { useState, useRef, useEffect } from 'react';
import { ProductCategory, ProductSize, LETTER_SIZES, NUMERIC_SIZES } from '../types';
import {
  Search,
  X,
  Sparkles,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Tag,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  ChevronDown,
  Check
} from 'lucide-react';

interface Props {
  categories: { id: ProductCategory | 'Todos'; label: string }[];
  selectedCategory: ProductCategory | 'Todos';
  onSelectCategory: (cat: ProductCategory | 'Todos') => void;
  categoryCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string, category?: ProductCategory | 'Todos') => void;
  maxPrice: number | null;
  onMaxPriceChange: (val: number | null) => void;
  selectedSize: ProductSize | null;
  onSelectSize: (size: ProductSize | null) => void;
  onlyPromos: boolean;
  onTogglePromos: (val: boolean) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc') => void;
  totalResults: number;
  onResetFilters: () => void;
}

export const CatalogFilterHub: React.FC<Props> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  searchQuery,
  onSearchChange,
  maxPrice,
  onMaxPriceChange,
  selectedSize,
  onSelectSize,
  onlyPromos,
  onTogglePromos,
  sortBy,
  onSortChange,
  totalResults,
  onResetFilters
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    {
      id: 'featured' as const,
      label: 'Destaques',
      shortLabel: 'Destaques',
      icon: Sparkles,
      iconColor: 'text-amber-500'
    },
    {
      id: 'price-asc' as const,
      label: 'Menor Preço',
      shortLabel: 'Menor Preço',
      icon: ArrowDownNarrowWide,
      iconColor: 'text-emerald-600'
    },
    {
      id: 'price-desc' as const,
      label: 'Maior Preço',
      shortLabel: 'Maior Preço',
      icon: ArrowUpNarrowWide,
      iconColor: 'text-indigo-600'
    }
  ];

  const currentSort = sortOptions.find((o) => o.id === sortBy) || sortOptions[0];
  const CurrentIcon = currentSort.icon;

  // Count active advanced filters (price, size)
  let activeFilterCount = 0;
  if (maxPrice !== null) activeFilterCount++;
  if (selectedSize !== null) activeFilterCount++;

  const hasActiveFilters =
    selectedCategory !== 'Todos' ||
    searchQuery.trim() !== '' ||
    activeFilterCount > 0 ||
    onlyPromos;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-3.5 sm:p-4 space-y-3 mb-7 transition-all">
      {/* Top Row: Search Input + Sort Dropdown + Advanced Filters Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5 sm:top-3" />
          <input
            type="text"
            placeholder="Buscar produtos por nome, especificação ou modelo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-neutral-50 focus:bg-white text-xs sm:text-sm rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-900 p-0.5 rounded-full cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Advanced Filter Buttons */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`w-full sm:w-auto h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center sm:justify-between gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                isSortOpen
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CurrentIcon className={`w-3.5 h-3.5 ${isSortOpen ? 'text-white' : currentSort.iconColor}`} />
                <span>{currentSort.shortLabel}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isSortOpen ? 'rotate-180 text-white' : 'text-neutral-400'
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-48 sm:w-52 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-neutral-200 p-1.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Ordenar por
                </div>
                {sortOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.id === sortBy;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : opt.iconColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`w-full sm:w-auto h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
              activeFilterCount > 0 || isAdvancedOpen
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Full-width Aligned Promo Switch Bar */}
      <div
        onClick={() => onTogglePromos(!onlyPromos)}
        className={`w-full px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
          onlyPromos
            ? 'bg-neutral-900 border-neutral-900 text-white'
            : 'bg-neutral-50/80 hover:bg-neutral-100/80 border-neutral-200/80 text-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Tag className={`w-4 h-4 ${onlyPromos ? 'text-amber-400' : 'text-neutral-500'}`} />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Apenas Produtos em Oferta</span>
            <span className={`text-[10px] font-medium ${onlyPromos ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Exibir somente itens com desconto especial
            </span>
          </div>
        </div>

        <div
          className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
            onlyPromos ? 'bg-emerald-500' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-2xs ${
              onlyPromos ? 'translate-x-4' : ''
            }`}
          />
        </div>
      </div>

      {/* Category Horizontal Pills */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-100 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`h-8 sm:h-8.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/70'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-neutral-400 font-medium whitespace-nowrap shrink-0 hidden sm:inline-block">
          <strong>{totalResults}</strong> {totalResults === 1 ? 'produto' : 'produtos'}
        </span>
      </div>

      {/* Collapsible Advanced Filters Panel (Price, Size) */}
      {isAdvancedOpen && (
        <div className="pt-3 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                <span>Filtros Avançados</span>
              </span>
              <button
                onClick={() => setIsAdvancedOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
              >
                Concluir
              </button>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-neutral-200/60 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">Preço Máximo</span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {maxPrice !== null ? `Até R$ ${maxPrice.toFixed(0)},00` : 'Sem limite'}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPrice ?? 1000}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1000) {
                    onMaxPriceChange(null);
                  } else {
                    onMaxPriceChange(val);
                  }
                }}
                className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                <span>R$ 50</span>
                <button
                  type="button"
                  onClick={() => onMaxPriceChange(null)}
                  className="hover:text-neutral-700 underline cursor-pointer"
                >
                  Remover limite de preço
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-neutral-200/60 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Filtrar por Tamanho</span>
                </span>
                {selectedSize && (
                  <button
                    onClick={() => onSelectSize(null)}
                    className="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Limpar tamanho
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase w-16">Letras:</span>
                  {LETTER_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSelectSize(selectedSize === size ? null : size)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        selectedSize === size
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase w-16">Números:</span>
                  {NUMERIC_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSelectSize(selectedSize === size ? null : size)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        selectedSize === size
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-neutral-400 font-medium text-[10px] mr-1">Filtros Ativos:</span>

          {selectedCategory !== 'Todos' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-[11px] font-medium">
              Categoria: {selectedCategory}
              <button
                onClick={() => onSelectCategory('Todos')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-[11px] font-medium">
              Busca: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {maxPrice !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-medium border border-emerald-200">
              Até R$ {maxPrice.toFixed(0)}
              <button
                onClick={() => onMaxPriceChange(null)}
                className="hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-900 rounded-lg text-[11px] font-bold border border-neutral-300">
              Tam: {selectedSize}
              <button
                onClick={() => onSelectSize(null)}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyPromos && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg text-[11px] font-medium border border-rose-200">
              Promoção
              <button
                onClick={() => onTogglePromos(false)}
                className="hover:text-rose-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1 ml-auto cursor-pointer py-0.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar tudo</span>
          </button>
        </div>
      )}
    </div>
  );
};
