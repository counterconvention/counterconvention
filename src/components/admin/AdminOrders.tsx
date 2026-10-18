import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Order } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  ExternalLink,
  Phone,
  Trash2,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShoppingBag,
  DollarSign,
  Calendar,
  MessageCircle,
  CreditCard,
  Truck
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    settings,
    products
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const statuses: OrderStatus[] = ['Pendente', 'Em Separação', 'Concluído', 'Cancelado'];

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCopyOrderId = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(`#${orderId}`);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyWhatsAppMsg = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(order.whatsappMessage);
    setCopiedMsgId(order.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleContactCustomer = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${order.customer.name}! Estamos processando seu pedido #${order.id} na ${settings.storeName || 'nossa loja'}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Search filter supporting code, customer name, phone, address, and products
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.trim().toLowerCase();
    const cleanTerm = term.replace(/^#/, '');
    const cleanDigits = term.replace(/\D/g, '');

    const matchesId =
      o.id.toLowerCase().includes(term) ||
      o.id.toLowerCase().includes(cleanTerm) ||
      (cleanDigits.length > 0 && o.id.replace(/\D/g, '').includes(cleanDigits));

    const matchesName = o.customer.name.toLowerCase().includes(term);
    const matchesPhone =
      o.customer.phone.toLowerCase().includes(term) ||
      (cleanDigits.length > 0 && o.customer.phone.replace(/\D/g, '').includes(cleanDigits));

    const matchesAddress = o.customer.address ? o.customer.address.toLowerCase().includes(term) : false;
    const matchesPayment = o.customer.paymentMethod.toLowerCase().includes(term);
    const matchesItems = o.items.some(
      (item) =>
        item.productName.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.color.toLowerCase().includes(term)
    );

    const matchesQuery = matchesId || matchesName || matchesPhone || matchesAddress || matchesPayment || matchesItems;
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Em Separação':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelado':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'Em Separação':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'Concluído':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Cancelado':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código #, cliente, WhatsApp ou item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'Todos' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Todos ({orders.length})
          </button>
          {statuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === st ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {getStatusIcon(st)}
                <span>{st}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200/80 text-neutral-400 text-xs">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">Nenhum pedido encontrado</p>
            <p className="text-neutral-400 mt-1">
              {searchTerm ? `Nenhum resultado para "${searchTerm}".` : 'Ainda não há pedidos registrados.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Main Order Card Header Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order ID & Customer Info */}
                  <div className="space-y-1.5 min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyOrderId(order.id, e)}
                        className="font-mono font-bold text-neutral-900 text-xs sm:text-sm bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg border border-neutral-300/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Clique para copiar código do pedido"
                      >
                        <span>#{order.id}</span>
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400 hover:text-neutral-700" />
                        )}
                      </button>

                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <h4 className="font-sans font-bold text-neutral-900 text-base">
                      {order.customer.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                        title="Abrir WhatsApp do cliente"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {order.customer.phone}
                      </a>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {order.customer.deliveryMethod && (
                      <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 pt-0.5">
                        <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="line-clamp-1">
                          <strong>{order.customer.deliveryMethod}</strong>
                          {order.customer.address ? ` • ${order.customer.address}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items Summary Preview */}
                  <div className="flex-1 max-w-md bg-neutral-50/80 p-3 rounded-2xl border border-neutral-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Itens do Pedido ({order.items.reduce((sum, i) => sum + i.quantity, 0)} un.)
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        {order.items.length} produto(s)
                      </span>
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-neutral-700 text-xs">
                          <span className="line-clamp-1">
                            <strong>{item.quantity}x</strong> {item.productName}{' '}
                            <span className="text-neutral-400 font-medium">({item.size} • {item.color})</span>
                          </span>
                          <span className="font-semibold shrink-0 ml-2 text-neutral-900">
                            R$ {(item.salePrice * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Totals */}
                  <div className="min-w-[160px] text-left lg:text-right space-y-1">
                    <div className="text-lg font-black text-neutral-900 font-sans">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-xs text-emerald-700 font-bold flex items-center lg:justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Lucro: R$ {order.totalProfit.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block">
                      {order.customer.paymentMethod}
                    </span>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="h-9 px-3 text-xs rounded-xl border border-neutral-300 bg-white font-semibold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          Status: {st}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => handleContactCustomer(order, e)}
                      title="Conversar com o cliente no WhatsApp"
                      className="h-9 w-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const ok = window.confirm(`Deseja excluir o registro do pedido #${order.id}?`);
                        if (ok) deleteOrder(order.id);
                      }}
                      title="Excluir Pedido"
                      className="h-9 w-9 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Details Button */}
                    <button
                      onClick={() => toggleOrderExpanded(order.id)}
                      className={`h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isExpanded
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200/90'
                      }`}
                      title={isExpanded ? 'Recolher detalhes' : 'Ver detalhes completos do pedido'}
                    >
                      <span>{isExpanded ? 'Recolher' : 'Detalhes'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* EXPANDED SECTION: Clean, Actionable Information */}
                {isExpanded && (
                  <div className="border-t border-neutral-200/80 bg-neutral-50/60 p-4 sm:p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer & Delivery Card */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide border-b border-neutral-100 pb-2">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span>Cliente & Entrega</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Nome</span>
                            <span className="font-bold text-neutral-900">{order.customer.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Telefone / WhatsApp</span>
                            <a
                              href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5"
                            >
                              <span>{order.customer.phone}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Forma de Entrega</span>
                            <span className="font-medium text-neutral-800">{order.customer.deliveryMethod || 'Padrão'}</span>
                          </div>
                          {order.customer.address ? (
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Endereço de Entrega</span>
                              <p className="text-neutral-700 leading-relaxed font-medium">{order.customer.address}</p>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-neutral-700 hover:text-neutral-950 hover:underline mt-1 font-semibold"
                              >
                                <MapPin className="w-3 h-3 text-rose-500" />
                                <span>Ver no Google Maps</span>
                              </a>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Local de Retirada</span>
                              <p className="text-neutral-700">{settings.address}, {settings.cityState}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Forma de Pagamento</span>
                            <span className="font-semibold text-neutral-800">{order.customer.paymentMethod}</span>
                          </div>
                          {order.customer.notes && (
                            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-neutral-700">
                              <span className="text-[10px] text-amber-800 block font-bold uppercase">Observações do Cliente:</span>
                              <p className="mt-0.5 italic">{order.customer.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Message Preview Card */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-neutral-900 font-bold text-xs uppercase tracking-wide border-b border-neutral-100 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-emerald-600" />
                              <span>Mensagem do Pedido (WhatsApp)</span>
                            </div>
                            <button
                              onClick={(e) => handleCopyWhatsAppMsg(order, e)}
                              className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedMsgId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedMsgId === order.id ? 'Copiada' : 'Copiar Texto'}</span>
                            </button>
                          </div>
                          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                            {order.whatsappMessage || 'Mensagem direta via WhatsApp'}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Data do Pedido:</span>
                          <span className="font-semibold text-neutral-900">
                            {new Date(order.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Full Product Breakdown Table */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide">
                          <ShoppingBag className="w-4 h-4 text-neutral-700" />
                          <span>Itens e Produtos do Pedido</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Lucro: R$ {order.totalProfit.toFixed(2).replace('.', ',')} ({order.total > 0 ? ((order.totalProfit / order.total) * 100).toFixed(1) : 0}% margem)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              <th className="py-2 pr-3">Produto</th>
                              <th className="py-2 px-3">Tamanho</th>
                              <th className="py-2 px-3">Cor</th>
                              <th className="py-2 px-3 text-center">Qtd</th>
                              <th className="py-2 px-3 text-right">Preço Venda</th>
                              <th className="py-2 px-3 text-right">Custo</th>
                              <th className="py-2 px-3 text-right">Lucro</th>
                              <th className="py-2 pl-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {order.items.map((item, idx) => {
                              const matchingProd = products.find((p) => p.id === item.productId);
                              const img = matchingProd?.images?.[0] || '/src/assets/images/generic_product_backpack_1791981744366.jpg';
                              const itemProfit = (item.salePrice - item.costPrice) * item.quantity;

                              return (
                                <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                                  <td className="py-2.5 pr-3">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={img}
                                        alt={item.productName}
                                        className="w-9 h-11 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                                      />
                                      <div>
                                        <span className="font-bold text-neutral-900 block leading-tight">
                                          {item.productName}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 font-medium">
                                          {item.category}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-neutral-800">
                                    <span className="px-2 py-0.5 bg-neutral-100 rounded-md">
                                      {item.size}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-neutral-700">
                                    {item.color}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-neutral-900">
                                    {item.quantity} un.
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-neutral-800">
                                    R$ {item.salePrice.toFixed(2).replace('.', ',')}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-neutral-500">
                                    R$ {item.costPrice.toFixed(2).replace('.', ',')}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                                    +R$ {itemProfit.toFixed(2).replace('.', ',')}
                                  </td>
                                  <td className="py-2.5 pl-3 text-right font-black text-neutral-900">
                                    R$ {(item.salePrice * item.quantity).toFixed(2).replace('.', ',')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
