import React, { useState } from 'react';
import { Product, ProductSize } from '../types';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';

interface Props {
  product: Product;
  onOpenModal?: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onOpenModal }) => {
  const { addToCart, settings, setSelectedProduct } = useStore();

  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(product);
    } else {
      setSelectedProduct(product);
    }
  };

  const [selectedSize, setSelectedSize] = useState<ProductSize>(() => {
    const available = product.sizes.find((s) => s.quantity > 0);
    return available ? available.size : product.sizes[0]?.size || 'M';
  });
  const [selectedColor] = useState<string>(product.colors[0] || 'Única');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isSingleUniqueSize =
    product.sizes.length === 0 ||
    product.sizeSystem === 'generic' ||
    product.sizes.every((s) =>
      ['único', 'unico', 'u', 'tamanho único', 'tamanho unico'].includes(s.size.trim().toLowerCase())
    );

  const totalStock = product.sizes.reduce((acc, s) => acc + s.quantity, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= settings.lowStockThreshold;

  const currentPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.salePrice;
  const installmentVal = (currentPrice / 3).toFixed(2).replace('.', ',');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, 1);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
    const sizePart = isSingleUniqueSize ? '' : ` no tamanho/opção *${selectedSize}*`;
    const message = `Olá! Gostaria de comprar o produto *${product.name}* (${product.category})${sizePart}, cor/variação *${selectedColor}* por R$ ${currentPrice.toFixed(2).replace('.', ',')}. Está disponível?`;
    window.open(`https://wa.me/${cleanNumber || '5500000000000'}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl sm:rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Image Stage */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10">
          {product.isPromo && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase rounded-md shadow-xs">
              Oferta
            </span>
          )}
          {product.isFeatured && !product.isPromo && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-900 text-white font-semibold text-[9px] sm:text-[10px] tracking-wider uppercase rounded-md shadow-xs">
              Destaque
            </span>
          )}
          {isLowStock && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-amber-500 text-white font-medium text-[9px] sm:text-[10px] rounded-md shadow-xs flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              Últimas {totalStock} un.
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-800/90 text-white font-bold text-[9px] sm:text-[10px] uppercase rounded-md shadow-xs">
              Esgotado
            </span>
          )}
        </div>

        {/* Category Pill Top Right */}
        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-neutral-800 font-medium text-[9px] sm:text-[10px] rounded-full shadow-2xs border border-white/60">
          {product.category}
        </span>

        {/* Quick View Button on Hover (desktop) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center p-3">
          <span className="px-3 py-1.5 bg-white/95 text-neutral-900 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            Ver Detalhes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Colors palette minimal indicator */}
          <div className="flex items-center gap-1 mb-1.5">
            {product.colors.slice(0, 2).map((c, i) => (
              <span
                key={i}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-medium truncate max-w-[80px]"
              >
                {c}
              </span>
            ))}
            {product.colors.length > 2 && (
              <span className="text-[9px] text-neutral-400 font-medium">
                +{product.colors.length - 2}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-rose-900 transition-colors">
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 line-clamp-1">
            {product.fabric || 'Alfaiataria Premium'}
          </p>

          {/* Sizes Row Selector (Omitted for unique size products) */}
          {!isSingleUniqueSize && (
            <div
              className="flex items-center gap-1 mt-2 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mr-0.5">
                Tam:
              </span>
              {product.sizes.map((s) => {
                const out = s.quantity <= 0;
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    disabled={out}
                    onClick={() => setSelectedSize(s.size)}
                    title={out ? 'Tamanho esgotado' : `${s.quantity} disponíveis`}
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-2xs scale-105'
                        : out
                        ? 'bg-neutral-100 text-neutral-300 line-through cursor-not-allowed'
                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/90'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2 border-t border-neutral-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-neutral-900">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
            {product.isPromo && product.promoPrice && (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
                R$ {product.salePrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] text-neutral-500 block mb-2">
            ou 3x de R$ {installmentVal}
          </span>

          {/* Action Buttons Grid */}
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            {settings.whatsappEnabled !== false ? (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleQuickAdd}
                  disabled={isOutOfStock}
                  title="Adicionar à sacola"
                  className={`h-8 sm:h-8.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 active:scale-97'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pronto!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Sacola</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDirectWhatsApp}
                  disabled={isOutOfStock}
                  title="Pedir direto no WhatsApp"
                  className="h-8 sm:h-8.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-97 cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate">Whats</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                disabled={isOutOfStock}
                title="Adicionar à sacola"
                className={`w-full h-8 sm:h-8.5 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-97 shadow-2xs'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
