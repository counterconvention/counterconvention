import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Product,
  ProductCategory,
  ProductSize,
  SizingType,
  LETTER_SIZES,
  NUMERIC_SIZES
} from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  Check,
  Ruler,
  Boxes
} from 'lucide-react';

const createSizesForSystem = (
  system: SizingType,
  existingSizes?: { size: ProductSize; quantity: number }[],
  defaultQty = 4
): { size: ProductSize; quantity: number }[] => {
  if (system === 'numeric') {
    return NUMERIC_SIZES.map((num, idx) => {
      const match = existingSizes?.find((s) => s.size === num);
      return {
        size: num as ProductSize,
        quantity: match ? match.quantity : (existingSizes?.[idx]?.quantity ?? defaultQty)
      };
    });
  } else if (system === 'generic') {
    const match = existingSizes?.find((s) => s.size === 'Único');
    return [
      {
        size: 'Único' as ProductSize,
        quantity: match ? match.quantity : defaultQty * 3
      }
    ];
  } else {
    return LETTER_SIZES.map((ltr, idx) => {
      const match = existingSizes?.find((s) => s.size === ltr);
      return {
        size: ltr as ProductSize,
        quantity: match ? match.quantity : (existingSizes?.[idx]?.quantity ?? defaultQty)
      };
    });
  }
};

interface AdminProductsProps {
  onNavigateToStock?: (productName?: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onNavigateToStock }) => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Dynamic categories list
  const categories: ProductCategory[] = React.useMemo(() => {
    const set = new Set<string>();
    const source =
      settings.categories && settings.categories.length > 0
        ? settings.categories
        : ['Geral', 'Eletrônicos & Tech', 'Acessórios', 'Casa & Estilo', 'Vestuário'];
    source.forEach((c) => set.add(c));
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [settings.categories, products]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Geral' as ProductCategory,
    salePrice: 199.9,
    costPrice: 85.0,
    isPromo: false,
    promoPrice: 179.9,
    isFeatured: false,
    fabric: 'Material de Alta Durabilidade',
    colors: 'Preto, Prata',
    images: '/src/assets/images/generic_product_headphones_1791981742572.jpg',
    description: '',
    sizeSystem: 'generic' as SizingType,
    sizes: [{ size: 'Único' as ProductSize, quantity: 10 }]
  });

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      category: categories[0] || 'Geral',
      salePrice: 199.9,
      costPrice: 85.0,
      isPromo: false,
      promoPrice: 179.9,
      isFeatured: false,
      fabric: 'Material de Alta Durabilidade',
      colors: 'Preto, Prata',
      images: '/src/assets/images/generic_product_headphones_1791981742572.jpg',
      description: 'Produto com excelente acabamento, durabilidade e desempenho para o seu dia a dia.',
      sizeSystem: 'generic',
      sizes: [{ size: 'Único' as ProductSize, quantity: 10 }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    // Detect system if not set
    const detectedSystem: SizingType =
      p.sizeSystem ||
      (p.sizes.some((s) => ['32', '34', '36', '38', '40'].includes(String(s.size)))
        ? 'numeric'
        : 'letter');

    setFormData({
      name: p.name,
      category: p.category,
      salePrice: p.salePrice,
      costPrice: p.costPrice,
      isPromo: !!p.isPromo,
      promoPrice: p.promoPrice || p.salePrice,
      isFeatured: !!p.isFeatured,
      fabric: p.fabric || '',
      colors: p.colors.join(', '),
      images: p.images.join('\n'),
      description: p.description,
      sizeSystem: detectedSystem,
      sizes: createSizesForSystem(detectedSystem, p.sizes)
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedColors = formData.colors
      .split(/[,/]/)
      .map((c) => c.trim())
      .filter(Boolean);

    const parsedImages = formData.images
      .split(/[\n,]/)
      .map((img) => img.trim())
      .filter((img) => img.startsWith('http'));

    const finalImages =
      parsedImages.length > 0
        ? parsedImages
        : ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=85'];

    const existingProd = editingProductId ? products.find((p) => p.id === editingProductId) : null;
    const finalSizes = existingProd
      ? existingProd.sizeSystem === formData.sizeSystem
        ? existingProd.sizes
        : createSizesForSystem(formData.sizeSystem, existingProd.sizes, 0)
      : createSizesForSystem(formData.sizeSystem, undefined, 4);

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formData.name,
        category: formData.category,
        salePrice: Number(formData.salePrice),
        costPrice: Number(formData.costPrice),
        isPromo: formData.isPromo,
        promoPrice: formData.isPromo ? Number(formData.promoPrice) : undefined,
        isFeatured: formData.isFeatured,
        fabric: formData.fabric,
        colors: parsedColors.length > 0 ? parsedColors : ['Única'],
        images: finalImages,
        description: formData.description,
        sizeSystem: formData.sizeSystem,
        sizes: finalSizes
      });
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        salePrice: Number(formData.salePrice),
        costPrice: Number(formData.costPrice),
        isPromo: formData.isPromo,
        promoPrice: formData.isPromo ? Number(formData.promoPrice) : undefined,
        isFeatured: formData.isFeatured,
        fabric: formData.fabric,
        colors: parsedColors.length > 0 ? parsedColors : ['Única'],
        images: finalImages,
        description: formData.description,
        sizeSystem: formData.sizeSystem,
        sizes: finalSizes
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calcUnitProfit = formData.salePrice - formData.costPrice;
  const calcMargin =
    formData.salePrice > 0 ? ((calcUnitProfit / formData.salePrice) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 bg-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-medium text-neutral-700"
          >
            <option value="Todos">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          id="btn-admin-add-product"
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Look</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Preço Venda</th>
                <th className="py-3 px-4">Preço Fabricação</th>
                <th className="py-3 px-4">Lucro Margem</th>
                <th className="py-3 px-4">Estoque Total</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
                const unitProfit = p.salePrice - p.costPrice;
                const margin = p.salePrice > 0 ? ((unitProfit / p.salePrice) * 100).toFixed(1) : '0';

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-12 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block line-clamp-1">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {p.colors.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-md">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-neutral-900">
                      R$ {p.salePrice.toFixed(2).replace('.', ',')}
                      {p.isPromo && p.promoPrice && (
                        <span className="block text-[10px] text-rose-600 font-bold">
                          Promo: R$ {p.promoPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-mono">
                      R$ {p.costPrice.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 block">
                        +R$ {unitProfit.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {margin}% margem
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            totalStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : totalStock <= 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalStock} un. no total
                        </span>
                        <div className="flex items-center gap-1 flex-wrap text-[10px] text-neutral-600 font-mono">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={`px-1 py-0.5 rounded ${
                                s.quantity <= 0 ? 'bg-rose-50 text-rose-500 line-through' : 'bg-neutral-100'
                              }`}
                            >
                              {s.size}:{s.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onNavigateToStock && (
                          <button
                            onClick={() => onNavigateToStock(p.name)}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Gerenciar estoque individual por tamanho deste look"
                          >
                            <Boxes className="w-3.5 h-3.5 text-amber-700" />
                            <span className="hidden sm:inline">Estoque</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar Look no Catálogo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Peça"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar / Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-sans font-bold text-lg text-neutral-900">
                {editingProductId ? 'Editar Peça do Catálogo' : 'Cadastrar Nova Peça'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              {/* Nome */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Fone Wireless ANC Studio Pro"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50"
                />
              </div>

              {/* Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Material / Especificação
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="Ex: Alumínio Escovado e Acabamento Premium"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50"
                  />
                </div>
              </div>

              {/* Preço de Venda e Preço de Fabricação */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <span className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] block">
                  Precificação & Margem de Lucro
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Preço de Fabricação / Custo (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                    />
                  </div>
                </div>

                {/* Lucro e Margem Calculados */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-200 text-xs">
                  <span className="text-neutral-600">Lucro Bruto Unitário:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    R$ {calcUnitProfit.toFixed(2).replace('.', ',')} ({calcMargin}% de margem)
                  </span>
                </div>
              </div>

              {/* Sistema de Tamanhos da Peça (Grade Visual do Catálogo) */}
              <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/90">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-rose-600" />
                    <span>Grade de Tamanhos da Peça *</span>
                  </label>
                  {editingProductId && (
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Estoque Total: <strong className="text-neutral-900">{formData.sizes.reduce((sum, s) => sum + s.quantity, 0)} un.</strong>
                    </span>
                  )}
                </div>

                {/* Alternador de Classificação: Único, Letras ou Números */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sizeSystem: 'generic',
                        sizes: createSizesForSystem('generic', formData.sizes)
                      });
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.sizeSystem === 'generic'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        formData.sizeSystem === 'generic'
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      U
                    </div>
                    <div>
                      <div className="font-bold text-xs">Tamanho Único</div>
                      <div className="text-[10px] opacity-80">Padrão / Universal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sizeSystem: 'letter',
                        sizes: createSizesForSystem('letter', formData.sizes)
                      });
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.sizeSystem === 'letter'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        formData.sizeSystem === 'letter'
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      PP
                    </div>
                    <div>
                      <div className="font-bold text-xs">Padrão Letras</div>
                      <div className="text-[10px] opacity-80">PP, P, M, G, GG</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sizeSystem: 'numeric',
                        sizes: createSizesForSystem('numeric', formData.sizes)
                      });
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      formData.sizeSystem === 'numeric'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        formData.sizeSystem === 'numeric'
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      36
                    </div>
                    <div>
                      <div className="font-bold text-xs">Padrão Numérico</div>
                      <div className="text-[10px] opacity-80">32, 34, 36, 38, 40</div>
                    </div>
                  </button>
                </div>

                {/* Grade de Tamanhos e Informação de Estoque Centralizado */}
                <div className="p-3 bg-white rounded-xl border border-neutral-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                      Tamanhos / Opções do Produto:
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                      Estoque Centralizado
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((s) => (
                      <div
                        key={s.size}
                        className="text-center min-w-[70px] p-2 rounded-xl bg-neutral-50 border border-neutral-200 shadow-2xs"
                      >
                        <span className="font-extrabold text-neutral-900 text-xs block">
                          {s.size}
                        </span>
                        <span className={`text-[10px] font-bold mt-0.5 block ${
                          s.quantity === 0 ? 'text-rose-600' : 'text-neutral-500'
                        }`}>
                          {editingProductId ? `${s.quantity} un.` : 'Ativo'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      <strong>Gestão em Estoque:</strong> O catálogo é focado na apresentação visual. As unidades e reposição de cada tamanho são gerenciadas na aba <strong>Estoque</strong>, refletindo instantaneamente no catálogo e em todo o site.
                    </p>
                    {editingProductId && onNavigateToStock && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          onNavigateToStock(formData.name);
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Gerenciar no Estoque &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cores */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Cores Disponíveis (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Ex: Off-white, Terracota, Verde Oliva"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50"
                />
              </div>

              {/* Imagens */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  URLs das Fotos (uma por linha ou separadas por vírgula)
                </label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50 font-mono text-[11px]"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Descrição dos Detalhes da Peça
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50 resize-none"
                />
              </div>

              {/* Promo & Destaque Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded-sm text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-medium text-neutral-800">Destaque no Catálogo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPromo}
                    onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                    className="rounded-sm text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-medium text-neutral-800">Peça em Oferta</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-xs"
                >
                  Salvar Peça no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
