import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_CATEGORIES } from '../../types';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { settings, updateSettings, products, importProductsList } = useStore();

  const categories = settings.categories && settings.categories.length > 0
    ? settings.categories
    : DEFAULT_CATEGORIES;

  const [newCatInput, setNewCatInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ index: number; name: string; count: number } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Count products per category
  const productCountByCategory = (cat: string) => {
    return products.filter((p) => (p.category || '').toLowerCase() === cat.toLowerCase()).length;
  };

  const handleAddCategory = (nameToAdd?: string) => {
    const raw = (nameToAdd || newCatInput).trim();
    if (!raw) return;

    if (categories.some((c) => c.toLowerCase() === raw.toLowerCase())) {
      notify(`A categoria "${raw}" já existe.`, 'error');
      return;
    }

    const updated = [...categories, raw];
    updateSettings({ categories: updated });
    setNewCatInput('');
    notify(`Categoria "${raw}" adicionada com sucesso!`);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleSaveEdit = (index: number) => {
    const raw = editingValue.trim();
    if (!raw) {
      notify('O nome da categoria não pode ser vazio.', 'error');
      return;
    }

    const oldName = categories[index];
    if (oldName.toLowerCase() === raw.toLowerCase()) {
      setEditingIndex(null);
      return;
    }

    if (categories.some((c, i) => i !== index && c.toLowerCase() === raw.toLowerCase())) {
      notify(`Já existe uma categoria chamada "${raw}".`, 'error');
      return;
    }

    const updated = [...categories];
    updated[index] = raw;

    // Cascade update all products with this category
    const updatedProducts = products.map((p) => {
      if ((p.category || '').toLowerCase() === oldName.toLowerCase()) {
        return { ...p, category: raw };
      }
      return p;
    });

    importProductsList(updatedProducts, true);
    updateSettings({ categories: updated });
    setEditingIndex(null);
    notify(`Categoria renomeada para "${raw}" (produtos atualizados)!`);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 1) {
      notify('A loja deve ter pelo menos uma categoria.', 'error');
      return;
    }

    const catToRemove = categories[index];
    const count = productCountByCategory(catToRemove);

    if (count > 0) {
      setCategoryToDelete({ index, name: catToRemove, count });
    } else {
      executeDeleteCategory(index, catToRemove, false);
    }
  };

  const executeDeleteCategory = (index: number, catToRemove: string, moveProducts: boolean) => {
    if (moveProducts) {
      const fallbackCat = categories.find((c, i) => i !== index) || 'Geral';
      const updatedProducts = products.map((p) => {
        if ((p.category || '').toLowerCase() === catToRemove.toLowerCase()) {
          return { ...p, category: fallbackCat };
        }
        return p;
      });
      importProductsList(updatedProducts, true);
    }

    const updated = categories.filter((_, i) => i !== index);
    updateSettings({ categories: updated });
    setCategoryToDelete(null);
    notify(`Categoria "${catToRemove}" removida com sucesso.`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    updateSettings({ categories: updated });
  };

  // Quick preset suggestions
  const presetSuggestions = [
    'Geral',
    'Eletrônicos',
    'Acessórios',
    'Casa & Decoração',
    'Vestuário & Moda',
    'Beleza & Cuidados',
    'Calçados',
    'Esportes & Lazer',
    'Papelaria & Escritório',
    'Destaques'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-neutral-100" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900">
                Gerenciar Categorias
              </h2>
              <p className="text-xs text-neutral-500">
                Configure as categorias do seu catálogo (Geral, Eletrônicos, Acessórios, etc.).
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-600 font-semibold bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/80 self-start sm:self-auto">
          Total de Categorias: <span className="font-extrabold text-neutral-900">{categories.length}</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add New Category Box */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-neutral-700" />
          <span>Criar Nova Categoria</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="Ex: Eletrônicos, Acessórios, Smart Home..."
            className="flex-1 h-10 px-3.5 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => handleAddCategory()}
            className="h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-97 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Categoria</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sugestões Rápidas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetSuggestions.map((preset) => {
              const alreadyExists = categories.some((c) => c.toLowerCase() === preset.toLowerCase());
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={alreadyExists}
                  onClick={() => handleAddCategory(preset)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    alreadyExists
                      ? 'bg-neutral-100 text-neutral-400 cursor-default opacity-50'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 active:scale-95'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Table / List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Categorias Ativas ({categories.length})
          </span>
          <span className="text-[11px] text-neutral-400">
            Arraste ou use as setas para alterar a ordem no catálogo
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {categories.map((cat, idx) => {
            const count = productCountByCategory(cat);
            const isEditing = editingIndex === idx;

            return (
              <div
                key={`${cat}-${idx}`}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
              >
                {/* Left: Position & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 text-center text-xs font-bold text-neutral-400">
                    #{idx + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(idx);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        className="h-8 px-2.5 rounded-lg border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 hover:bg-neutral-800 cursor-pointer"
                        title="Salvar alteração"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 hover:bg-neutral-200 cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                        {cat}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        <ShoppingBag className="w-3 h-3 text-neutral-400" />
                        <span>{count} {count === 1 ? 'produto' : 'produtos'}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Button */}
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      className="w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Renomear categoria"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={categories.length <= 1}
                    onClick={() => handleRemoveCategory(idx)}
                    className="w-8 h-8 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-app Confirmation Modal for Category Removal with Products */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">
                  Excluir categoria "{categoryToDelete.name}"?
                </h4>
                <p className="text-xs text-neutral-500">
                  Existem {categoryToDelete.count} produto(s) nesta categoria.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Ao confirmar, todos os produtos atualmente em <strong>"{categoryToDelete.name}"</strong> serão transferidos para outra categoria ativa e continuarão disponíveis na sua loja.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="h-9 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDeleteCategory(categoryToDelete.index, categoryToDelete.name, true)}
                className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Mover Produtos & Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
