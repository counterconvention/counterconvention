import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderCustomer } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Truck,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Store,
  MapPin,
  CreditCard,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    createOrderFromCart,
    settings,
    products
  } = useStore();

  const [customer, setCustomer] = useState<OrderCustomer>({
    name: '',
    phone: '',
    deliveryMethod: 'Retirar na Loja',
    address: '',
    paymentMethod: 'Pix (5% OFF)',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<{
    orderId: string;
    waUrl: string;
    waText: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const isStorePickup = customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja';
  const isPix = customer.paymentMethod.toLowerCase().includes('pix');
  const pixDiscount = isPix ? cartTotal * 0.05 : 0;
  const finalTotal = cartTotal - pixDiscount;
  const remainingForFreeShipping = Math.max(0, settings.freeShippingMinimum - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / settings.freeShippingMinimum) * 100);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCheckoutWhatsApp = () => {
    if (!customer.name.trim()) {
      setErrorMsg('Por favor, informe seu nome para o pedido.');
      return;
    }
    if (!customer.phone.trim()) {
      setErrorMsg('Por favor, informe seu WhatsApp de contato.');
      return;
    }
    if (!isStorePickup && !customer.address?.trim()) {
      setErrorMsg('Por favor, informe o endereço de entrega completo para o envio via Correios.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { order, waUrl } = createOrderFromCart(customer);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti effect:', e);
      }

      setCreatedOrderData({
        orderId: order.id,
        waUrl,
        waText: order.whatsappMessage
      });

      // Safely attempt to trigger opening WhatsApp if enabled
      if (settings.whatsappEnabled !== false) {
        try {
          const link = document.createElement('a');
          link.href = waUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 200);
        } catch (openErr) {
          console.warn('Auto-open WhatsApp skipped/blocked:', openErr);
        }
      }
    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      setErrorMsg(err?.message || 'Erro ao processar pedido. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdOrderData?.orderId) {
      navigator.clipboard.writeText(`#${createdOrderData.orderId}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyText = () => {
    if (createdOrderData?.waText) {
      navigator.clipboard.writeText(createdOrderData.waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">Sua Sacola</h3>
              <p className="text-xs text-neutral-500">
                {cart.length === 0 ? 'Sacola vazia' : `${cart.length} modelo(s) selecionado(s)`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setCreatedOrderData(null);
            }}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        {cart.length > 0 && (
          <div className="px-5 py-3 bg-rose-50/50 border-b border-rose-100/60 text-xs">
            <div className="flex items-center justify-between text-neutral-700 font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-rose-600" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">Parabéns! Você ganhou Frete Grátis ✈️</span>
                ) : (
                  <span>
                    Faltam apenas <strong className="text-neutral-900">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para FRETE GRÁTIS!
                  </span>
                )}
              </span>
              <span className="font-bold text-neutral-900">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {createdOrderData ? (
            /* Order Placed Success View */
            <div className="py-5 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Pedido Registrado com Sucesso!
                </span>
                
                {/* Highlighted Order Code Box */}
                <div className="mt-3 p-3 bg-neutral-900 text-white rounded-2xl flex items-center justify-between shadow-md max-w-sm mx-auto">
                  <div className="text-left pl-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Código para Rastreio
                    </span>
                    <span className="text-xl font-black font-mono text-rose-300">
                      #{createdOrderData.orderId}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-white border border-neutral-700"
                    title="Copiar código do pedido"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-neutral-600 mt-2.5 max-w-xs mx-auto leading-relaxed">
                  Este código foi registrado no sistema da <strong>{settings.storeName}</strong>. Clique abaixo para enviar o pedido diretamente no WhatsApp oficial.
                </p>
              </div>

              {/* Box with WhatsApp message preview */}
              <div className="text-left space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold px-1">
                  <span>Prévia da Mensagem (wa.me):</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tudo incluído automaticamente</span>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-3.5 text-left border border-neutral-200 text-xs font-mono text-neutral-700 max-h-48 overflow-y-auto whitespace-pre-line shadow-inner leading-relaxed">
                  {createdOrderData.waText}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* Main WhatsApp Button */}
                <a
                  href={createdOrderData.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.124-.531-1.828-.758-2.996-2.614-3.087-2.735-.09-.12-1.205-1.603-1.205-3.057 0-1.455.765-2.169 1.036-2.459.271-.29.593-.362.79-.362.197 0 .394.002.566.01.184.008.43-.07.672.512.25.603.854 2.085.928 2.235.074.15.124.325.025.522-.099.197-.148.32-.295.492-.148.172-.311.385-.445.516-.148.147-.302.308-.13.604.172.296.766 1.264 1.644 2.046 1.129 1.006 2.08 1.317 2.376 1.464.296.147.469.123.642-.074.172-.198.739-.861.936-1.156.197-.295.394-.246.665-.147.271.098 1.722.812 2.018.96.296.148.493.222.566.345.074.123.074.714-.07 1.119z" />
                  </svg>
                  <span>Enviar Pedido pelo WhatsApp</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>

                {/* Copy full formatted message */}
                <button
                  onClick={handleCopyText}
                  className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Mensagem Completa Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-neutral-600" />
                      <span>Copiar Mensagem do Pedido</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCreatedOrderData(null);
                    setIsCartOpen(false);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 mt-2 font-medium cursor-pointer"
                >
                  Concluir e Voltar ao Catálogo
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-neutral-900">Sua sacola está vazia</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Explore nosso catálogo completo e adicione seus produtos favoritos para finalizar seu pedido!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Explorar Produtos do Catálogo
              </button>
            </div>
          ) : (
            /* Items List */
            <>
              <div className="space-y-3 divide-y divide-neutral-100">
                {cart.map((item, idx) => {
                  const unitPrice = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
                  return (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="pt-3 first:pt-0 flex gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-18 h-22 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200/80"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                              title="Remover item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {!['único', 'unico', 'u', 'tamanho único', 'tamanho unico'].includes(item.selectedSize.trim().toLowerCase()) && (
                              <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-semibold">
                                Tam: {item.selectedSize}
                              </span>
                            )}
                            <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-semibold">
                              {item.selectedColor}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {(() => {
                            const liveProd = products.find((p) => p.id === item.product.id) || item.product;
                            const sizeObj = liveProd.sizes.find((s) => s.size === item.selectedSize);
                            const availableStock = sizeObj ? sizeObj.quantity : 0;
                            const isMaxReached = item.quantity >= availableStock;

                            return (
                              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                  className="p-1 px-2 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                                  title="Diminuir"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    if (!isMaxReached) {
                                      updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1);
                                    }
                                  }}
                                  disabled={isMaxReached}
                                  className="p-1 px-2 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={isMaxReached ? `Estoque máximo atingido (${availableStock} un.)` : 'Adicionar mais 1'}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })()}

                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-bold text-neutral-900">
                              R$ {(unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-neutral-400 block">
                                R$ {unitPrice.toFixed(2).replace('.', ',')} cada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Details Form */}
              <div className="pt-4 border-t border-neutral-200 space-y-3.5">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Dados para o Atendimento
                </h4>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Amanda Silva"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98765-4321"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-neutral-50/50"
                    />
                  </div>
                </div>

                {/* Delivery Method - Only Retirar na Loja and Correios */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                    Forma de Entrega *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="btn-delivery-retirar-loja"
                      onClick={() => setCustomer({ ...customer, deliveryMethod: 'Retirar na Loja' })}
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-start gap-2.5 cursor-pointer ${
                        customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <Store className={`w-4 h-4 shrink-0 mt-0.5 ${
                        customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja'
                          ? 'text-rose-300'
                          : 'text-neutral-500'
                      }`} />
                      <div className="min-w-0">
                        <span className="block leading-tight font-bold">Retirar na Loja</span>
                        <span className={`text-[10px] block mt-0.5 ${
                          customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja'
                            ? 'text-neutral-300'
                            : 'text-neutral-500'
                        }`}>
                          Grátis • No Showroom
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-delivery-correios"
                      onClick={() => {
                        const nextPayment = customer.paymentMethod === 'Débito' ? 'Pix' : customer.paymentMethod;
                        setCustomer({ ...customer, deliveryMethod: 'Correios', paymentMethod: nextPayment });
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-start gap-2.5 cursor-pointer ${
                        customer.deliveryMethod === 'Correios' || customer.deliveryMethod === 'Correios/Sedex'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <Truck className={`w-4 h-4 shrink-0 mt-0.5 ${
                        customer.deliveryMethod === 'Correios' || customer.deliveryMethod === 'Correios/Sedex'
                          ? 'text-rose-300'
                          : 'text-neutral-500'
                      }`} />
                      <div className="min-w-0">
                        <span className="block leading-tight font-bold">Correios</span>
                        <span className={`text-[10px] block mt-0.5 ${
                          customer.deliveryMethod === 'Correios' || customer.deliveryMethod === 'Correios/Sedex'
                            ? 'text-neutral-300'
                            : 'text-neutral-500'
                        }`}>
                          Envio p/ todo o Brasil
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Info if Retirar na Loja, or Address input if Correios */}
                {isStorePickup ? (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/90 text-xs text-neutral-600 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900 block text-xs">Ponto de Retirada Oficial:</span>
                      <p className="text-[11px] text-neutral-700 mt-0.5 leading-relaxed">
                        {settings.address}, {settings.cityState}
                      </p>
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        Avisaremos assim que suas peças estiverem passadas e separadas na sacola.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Endereço Completo de Entrega (Rua, Número, Bairro, Cidade e CEP) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Rua Oscar Freire, 1200, Apto 42 - Jardins, São Paulo/SP - CEP 01426-001"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-neutral-50/50"
                    />
                  </div>
                )}

                {/* Payment Method - Dynamic based on Retirar na Loja vs Correios */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-neutral-700 block">
                      Forma de Pagamento Pretendida *
                    </label>
                    {isStorePickup && (
                      <span className="text-[10px] text-neutral-500 font-medium">
                        Opções disponíveis na loja
                      </span>
                    )}
                  </div>

                  {isStorePickup ? (
                    /* Retirar na Loja: Pix (5% OFF), Cartão de Crédito (Até 12x) ou Débito */
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        id="btn-pay-pix"
                        onClick={() => setCustomer({ ...customer, paymentMethod: 'Pix (5% OFF)' })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          customer.paymentMethod.toLowerCase().includes('pix')
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="font-bold">Pix</span>
                        <span className={`text-[10px] font-bold ${
                          customer.paymentMethod.toLowerCase().includes('pix') ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>
                          (5% OFF)
                        </span>
                      </button>

                      <button
                        type="button"
                        id="btn-pay-credito"
                        onClick={() => setCustomer({ ...customer, paymentMethod: 'Cartão de Crédito (Até 12x)' })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito')
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="font-bold leading-tight text-center">Cartão de Crédito</span>
                        <span className={`text-[10px] ${
                          customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito') ? 'text-neutral-300' : 'text-neutral-500'
                        }`}>
                          (Até 12x)
                        </span>
                      </button>

                      <button
                        type="button"
                        id="btn-pay-debito"
                        onClick={() => setCustomer({ ...customer, paymentMethod: 'Débito' })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          customer.paymentMethod.toLowerCase().includes('débito') || customer.paymentMethod.toLowerCase().includes('debito')
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="font-bold">Débito</span>
                        <span className={`text-[10px] ${
                          customer.paymentMethod.toLowerCase().includes('débito') || customer.paymentMethod.toLowerCase().includes('debito') ? 'text-neutral-300' : 'text-neutral-500'
                        }`}>
                          Na máquina
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Correios: Pix (5% OFF) ou Cartão de Crédito (Até 12x) */
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="btn-pay-pix"
                        onClick={() => setCustomer({ ...customer, paymentMethod: 'Pix (5% OFF)' })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          customer.paymentMethod.toLowerCase().includes('pix')
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="font-bold">Pix</span>
                        <span className={`text-[10px] font-bold ${
                          customer.paymentMethod.toLowerCase().includes('pix') ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>
                          (5% OFF)
                        </span>
                      </button>

                      <button
                        type="button"
                        id="btn-pay-credito"
                        onClick={() => setCustomer({ ...customer, paymentMethod: 'Cartão de Crédito (Até 12x)' })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito')
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="font-bold leading-tight">Cartão de Crédito</span>
                        <span className={`text-[10px] ${
                          customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito') ? 'text-neutral-300' : 'text-neutral-500'
                        }`}>
                          (Até 12x)
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Observações ou Dúvidas (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Embalar para presente; verificar se chega até sexta..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-neutral-50/50 resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer Checkout Bar */}
        {cart.length > 0 && !createdOrderData && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-semibold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Forma de Entrega:</span>
                <span className="font-medium text-neutral-900">
                  {isStorePickup ? 'Retirar na Loja (Grátis)' : 'Correios'}
                </span>
              </div>
              {pixDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto Pix (5% OFF):</span>
                  <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-900 text-base font-extrabold pt-1 border-t border-neutral-200">
                <span>Total a Pagar:</span>
                <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {(customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito')) && (
                <div className="text-[11px] text-right text-neutral-500 pt-0.5">
                  ou em até 12x no cartão de crédito
                </div>
              )}
              {(customer.paymentMethod.toLowerCase().includes('débito') || customer.paymentMethod.toLowerCase().includes('debito')) && (
                <div className="text-[11px] text-right text-neutral-500 pt-0.5">
                  Pagamento no cartão de débito na retirada
                </div>
              )}
            </div>

            {settings.whatsappEnabled !== false ? (
              <>
                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={isSubmitting}
                  id="btn-cart-checkout-wa"
                  className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.124-.531-1.828-.758-2.996-2.614-3.087-2.735-.09-.12-1.205-1.603-1.205-3.057 0-1.455.765-2.169 1.036-2.459.271-.29.593-.362.79-.362.197 0 .394.002.566.01.184.008.43-.07.672.512.25.603.854 2.085.928 2.235.074.15.124.325.025.522-.099.197-.148.32-.295.492-.148.172-.311.385-.445.516-.148.147-.302.308-.13.604.172.296.766 1.264 1.644 2.046 1.129 1.006 2.08 1.317 2.376 1.464.296.147.469.123.642-.074.172-.198.739-.861.936-1.156.197-.295.394-.246.665-.147.271.098 1.722.812 2.018.96.296.148.493.222.566.345.074.123.074.714-.07 1.119z" />
                  </svg>
                  <span>Finalizar Pedido pelo WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-[11px] text-center text-neutral-500">
                  Você será direcionado para o WhatsApp oficial da loja com o resumo pronto.
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={isSubmitting}
                  id="btn-cart-checkout-direct"
                  className="w-full py-4 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Confirmar & Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-[11px] text-center text-neutral-500">
                  Seu pedido será registrado e você receberá o código e comprovante imediatamente.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
