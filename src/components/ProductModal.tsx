import React, { useState, useEffect } from 'react';
import { Product, ProductSize, LETTER_SIZES, NUMERIC_SIZES } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Ruler,
  AlertCircle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface Props {
  product?: Product | null;
  onClose?: () => void;
}

export const ProductModal: React.FC<Props> = ({
  product: propProduct,
  onClose: propOnClose
}) => {
  const {
    addToCart,
    setIsCartOpen,
    settings,
    selectedProduct: storeProduct,
    setSelectedProduct,
    products
  } = useStore();

  const rawProduct = propProduct !== undefined ? propProduct : storeProduct;
  const product = rawProduct ? (products.find((p) => p.id === rawProduct.id) || rawProduct) : null;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setSelectedProduct(null);
    }
  };

  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Initialize selections whenever a new product is selected
  useEffect(() => {
    if (product) {
      setSelectedImg(0);
      // Pick first size with stock > 0, or fallback to first size
      const availableSize = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(availableSize ? availableSize.size : product.sizes[0]?.size || 'M');
      setSelectedColor(product.colors[0] || 'Cor Única');
      setQty(1);
      setAddedSuccess(false);
      setShowSizeGuide(false);
    }
  }, [product]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const isSingleUniqueSize =
    product.sizes.length === 0 ||
    product.sizeSystem === 'generic' ||
    product.sizes.every((s) =>
      ['único', 'unico', 'u', 'tamanho único', 'tamanho unico'].includes(s.size.trim().toLowerCase())
    );

  const currentPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.salePrice;
  const currentSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const stockForSelectedSize = currentSizeObj ? currentSizeObj.quantity : 0;
  const isSizeAvailable = stockForSelectedSize > 0;

  const handleAddToCart = () => {
    if (!isSizeAvailable) return;
    addToCart(product, selectedSize, selectedColor, qty);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
      handleClose();
    }, 600);
  };

  const handleBuyWhatsAppNow = () => {
    const cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
    const totalPrice = (currentPrice * qty).toFixed(2).replace('.', ',');
    const sizeLine = isSingleUniqueSize ? '' : `• *Tamanho / Opção:* ${selectedSize}\n`;
    const message =
      `Olá! Gostaria de fazer o pedido pelo WhatsApp:\n\n` +
      `✨ *${product.name}*\n` +
      `• *Categoria:* ${product.category}\n` +
      sizeLine +
      `• *Cor / Variação:* ${selectedColor}\n` +
      `• *Quantidade:* ${qty}x\n` +
      `• *Valor Total:* R$ ${totalPrice}\n\n` +
      `Poderia confirmar a disponibilidade para entrega? Obrigado!`;

    window.open(`https://wa.me/${cleanNumber || '5500000000000'}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-4xl sm:rounded-3xl shadow-2xl border border-neutral-200 relative flex flex-col md:flex-row overflow-hidden my-auto max-h-screen sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (Desktop & Mobile) */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-neutral-950 shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer border border-neutral-200/80"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= LEFT COLUMN: IMAGES GALLERY ================= */}
        <div className="w-full md:w-1/2 bg-neutral-100/90 flex flex-col p-4 sm:p-6 border-b md:border-b-0 md:border-r border-neutral-200 shrink-0 md:shrink overflow-y-auto">
          {/* Main Photo: optimized aspect ratio so on mobile it doesn't take 100% of height */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-200 shadow-inner w-full max-h-72 sm:max-h-none aspect-[4/3] sm:aspect-[3/4]">
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.isPromo && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm">
                Oferta Especial
              </span>
            )}
          </div>

          {/* Thumbnails row if multiple images */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImg === idx
                      ? 'border-neutral-900 shadow-sm scale-102 ring-2 ring-neutral-900/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: PRODUCT INFO & CONTROLS ================= */}
        <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div className="p-5 sm:p-7 space-y-5 pb-6">
            {/* 1. Header: Category & Stock Status */}
            <div className="flex items-center justify-between gap-2 pr-10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
                {product.category}
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Pronta Entrega
              </span>
            </div>

            {/* 2. Product Name & Fabric */}
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 leading-snug font-sans">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
                Tecido:{' '}
                <span className="text-neutral-800 font-semibold">
                  {product.fabric || 'Alfaiataria Premium'}
                </span>
              </p>
            </div>

            {/* 3. Price Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-sans">
                    R$ {currentPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {product.isPromo && product.promoPrice && (
                    <span className="text-sm text-neutral-400 line-through">
                      R$ {product.salePrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-600 block mt-0.5">
                  ou até 3x de R$ {(currentPrice / 3).toFixed(2).replace('.', ',')} sem juros
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 shrink-0">
                5% OFF no Pix
              </span>
            </div>

            {/* 4. Cores Disponíveis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Cor Selecionada: <span className="text-rose-700 font-extrabold">{selectedColor}</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {product.colors.length} {product.colors.length === 1 ? 'opção' : 'opções'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900/20 scale-102'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-300" />}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Tamanhos Disponíveis (Omitido para tamanho único) */}
            {!isSingleUniqueSize && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Tamanho: <span className="text-rose-700 font-extrabold">{selectedSize}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-rose-800 hover:text-rose-950 font-bold flex items-center gap-1 underline decoration-rose-300 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5 text-rose-600" />
                    Guia de Medidas
                  </button>
                </div>

                {/* Grid dos Tamanhos */}
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((s) => {
                    const isOut = s.quantity <= 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        disabled={isOut}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setQty(1);
                        }}
                        className={`py-2.5 rounded-2xl font-extrabold text-sm transition-all flex flex-col items-center justify-center cursor-pointer border ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-102 ring-2 ring-neutral-900/10'
                            : isOut
                            ? 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through cursor-not-allowed opacity-50'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span>{s.size}</span>
                        <span className="text-[10px] font-semibold opacity-80 mt-0.5">
                          {isOut ? 'Esgotado' : `${s.quantity} un.`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tabela / Guia de Medidas Completo */}
                {showSizeGuide && (
                  <div className="mt-3 p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-neutral-800 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-rose-600" />
                        Tabela de Medidas (cm):
                      </span>
                      <button
                        onClick={() => setShowSizeGuide(false)}
                        className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
                      >
                        Fechar
                      </button>
                    </div>

                    {/* Tabela de Letras (PP, P, M, G, GG) */}
                    <div className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-2xs space-y-1">
                      <div className="font-bold text-[11px] text-rose-900">
                        Padrão Letras (PP, P, M, G, GG):
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-sans font-medium text-neutral-600">
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>PP</strong>
                          <div>Busto: 82-86</div>
                          <div>Cint: 64-68</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>P</strong>
                          <div>Busto: 86-90</div>
                          <div>Cint: 68-72</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>M</strong>
                          <div>Busto: 92-96</div>
                          <div>Cint: 74-78</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>G</strong>
                          <div>Busto: 98-102</div>
                          <div>Cint: 80-84</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>GG</strong>
                          <div>Busto: 104-108</div>
                          <div>Cint: 86-90</div>
                        </div>
                      </div>
                    </div>

                    {/* Tabela Numérica (32, 34, 36, 38, 40) */}
                    <div className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-2xs space-y-1">
                      <div className="font-bold text-[11px] text-rose-900">
                        Padrão Numérico (32, 34, 36, 38, 40):
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-sans font-medium text-neutral-600">
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>32</strong>
                          <div>Cint: 60-64</div>
                          <div>Quad: 88-92</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>34</strong>
                          <div>Cint: 64-68</div>
                          <div>Quad: 92-96</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>36</strong>
                          <div>Cint: 68-72</div>
                          <div>Quad: 96-100</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>38</strong>
                          <div>Cint: 72-76</div>
                          <div>Quad: 100-104</div>
                        </div>
                        <div className="bg-neutral-50 p-1 rounded-lg">
                          <strong>40</strong>
                          <div>Cint: 76-80</div>
                          <div>Quad: 104-108</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Seletor de Quantidade & Estoque */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-900 block">
                  Quantidade:
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {stockForSelectedSize > 0
                    ? isSingleUniqueSize
                      ? `Disponível: ${stockForSelectedSize} un. em estoque`
                      : `Disponível: ${stockForSelectedSize} un. no tamanho ${selectedSize}`
                    : 'Produto esgotado'}
                </span>
              </div>

              <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-neutral-800 font-bold transition-colors disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-neutral-900">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(stockForSelectedSize, qty + 1))}
                  disabled={qty >= stockForSelectedSize || stockForSelectedSize === 0}
                  className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-neutral-800 font-bold transition-colors disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 7. Descrição do Produto & Detalhes */}
            <div className="pt-2 border-t border-neutral-100 space-y-1.5">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Sobre o produto:
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* ================= STICKY ACTION BUTTONS ================= */}
          <div className="p-4 sm:p-6 bg-white border-t border-neutral-200 space-y-2.5 shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={!isSizeAvailable}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : !isSizeAvailable
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-98'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Produto Adicionado à Sacola!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-neutral-300" />
                  <span>
                    Adicionar à Sacola • R$ {(currentPrice * qty).toFixed(2).replace('.', ',')}
                  </span>
                </>
              )}
            </button>

            {settings.whatsappEnabled !== false && (
              <button
                onClick={handleBuyWhatsAppNow}
                disabled={!isSizeAvailable}
                className="w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.124-.531-1.828-.758-2.996-2.614-3.087-2.735-.09-.12-1.205-1.603-1.205-3.057 0-1.455.765-2.169 1.036-2.459.271-.29.593-.362.79-.362.197 0 .394.002.566.01.184.008.43-.07.672.512.25.603.854 2.085.928 2.235.074.15.124.325.025.522-.099.197-.148.32-.295.492-.148.172-.311.385-.445.516-.148.147-.302.308-.13.604.172.296.766 1.264 1.644 2.046 1.129 1.006 2.08 1.317 2.376 1.464.296.147.469.123.642-.074.172-.198.739-.861.936-1.156.197-.295.394-.246.665-.147.271.098 1.722.812 2.018.96.296.148.493.222.566.345.074.123.074.714-.07 1.119z" />
                </svg>
                <span>Comprar pelo WhatsApp</span>
              </button>
            )}

            {settings.whatsappEnabled === false && settings.discordEnabled !== false && settings.discordUrl && (
              <a
                href={settings.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <span>Tirar Dúvidas no Discord</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
