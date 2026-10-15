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
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Cpu,
  Wifi,
  ShoppingBag,
  DollarSign,
  Calendar,
  MessageCircle,
  Info,
  ShieldCheck,
  X
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
  const [copiedUaId, setCopiedUaId] = useState<string | null>(null);

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

  const handleCopyUserAgent = (orderId: string, ua: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(ua);
    setCopiedUaId(orderId);
    setTimeout(() => setCopiedUaId(null), 2000);
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
    const matchesItems = o.items.some((item) =>
      item.productName.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.color.toLowerCase().includes(term)
    );

    const matchesSearch = !term || matchesId || matchesName || matchesPhone || matchesAddress || matchesPayment || matchesItems;
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Em Separação':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Em Separação':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'Cancelado':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const handleContactCustomer = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let cleanPhone = order.customer.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }
    const text = `Olá ${order.customer.name}! Aqui é da ${settings.storeName}. ` +
      `Estamos acompanhando seu pedido *#${order.id}* (Status: *${order.status}*). ` +
      `Como podemos te ajudar hoje? ✨`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType === 'Celular') {
      return <Smartphone className="w-4 h-4 text-rose-500" />;
    }
    if (deviceType === 'Tablet') {
      return <Tablet className="w-4 h-4 text-amber-500" />;
    }
    return <Laptop className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="search-orders-input"
              placeholder="Buscar por código (#PED-...), cliente, telefone, endereço ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex flex-wrap items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
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
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-400 text-xs">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">Nenhum pedido encontrado</p>
            <p className="text-neutral-400 mt-1">
              {searchTerm ? `Nenhum resultado para "${searchTerm}".` : 'Ainda não há pedidos registrados.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const meta = order.clientMetadata;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Order Card Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Order ID & Customer Info */}
                  <div className="space-y-1.5 min-w-[270px]">
                    <div className="flex items-center gap-2">
                      {/* Order Code with Copy Action */}
                      <button
                        onClick={(e) => handleCopyOrderId(order.id, e)}
                        className="font-mono font-extrabold text-neutral-900 text-sm bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg border border-neutral-300/80 flex items-center gap-1.5 transition-colors cursor-pointer"
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

                    <h4 className="font-sans font-bold text-neutral-900 text-base flex items-center gap-2">
                      <span>{order.customer.name}</span>
                    </h4>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-emerald-700 hover:underline"
                        title="Abrir WhatsApp da cliente"
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
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="line-clamp-1">
                          <strong>{order.customer.deliveryMethod}</strong>
                          {order.customer.address ? ` • ${order.customer.address}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="flex-1 max-w-md bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Itens do Carrinho ({order.items.reduce((sum, i) => sum + i.quantity, 0)} un.)
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        {order.items.length} modelo(s)
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

                  {/* Financial totals */}
                  <div className="min-w-[170px] text-left lg:text-right space-y-1">
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

                  {/* Actions & "Mostrar mais..." Toggle */}
                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          Status: {st}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => handleContactCustomer(order, e)}
                      title="Conversar com a cliente no WhatsApp"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o registro do pedido #${order.id}?`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      title="Excluir Pedido"
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Prominent "Mostrar mais... " Button */}
                    <button
                      onClick={() => toggleOrderExpanded(order.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isExpanded
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200/90'
                      }`}
                      title={isExpanded ? 'Ocultar detalhes avançados' : 'Ver todos os dados do cliente, dispositivo e horário'}
                    >
                      <span>{isExpanded ? 'Mostrar menos' : 'Mostrar mais...'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* EXPANDED SECTION: "Mostrar mais..." */}
                {isExpanded && (
                  <div className="border-t border-neutral-200/80 bg-neutral-50/70 p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                          Raio-X Completo do Pedido #{order.id}
                        </h5>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        Registrado em {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Card 1: 👤 Dados da Cliente & Entrega */}
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide border-b border-neutral-100 pb-2">
                          <Phone className="w-4 h-4 text-rose-600" />
                          <span>Cliente & Atendimento</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Nome Completo</span>
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
                            <span className="font-medium text-neutral-800">{order.customer.deliveryMethod}</span>
                          </div>
                          {order.customer.address ? (
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Endereço Informado</span>
                              <p className="text-neutral-700 leading-relaxed">{order.customer.address}</p>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline mt-1 font-semibold"
                              >
                                <MapPin className="w-3 h-3" />
                                <span>Localizar no Google Maps</span>
                              </a>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Ponto de Retirada</span>
                              <p className="text-neutral-700">{settings.address}, {settings.cityState}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Forma de Pagamento</span>
                            <span className="font-semibold text-neutral-800">{order.customer.paymentMethod}</span>
                          </div>
                          {order.customer.notes && (
                            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-neutral-700">
                              <span className="text-[10px] text-amber-800 block font-bold uppercase">Observações da Cliente:</span>
                              <p className="mt-0.5 italic">{order.customer.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card 2: 📱 Dispositivo & Tecnologia */}
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide border-b border-neutral-100 pb-2">
                          {getDeviceIcon(meta?.deviceType)}
                          <span>Dispositivo & Navegador</span>
                        </div>
                        {meta ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Tipo do Aparelho</span>
                              <span className="font-bold px-2 py-0.5 bg-neutral-100 rounded-md text-neutral-800">
                                {meta.deviceType}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Sistema Operacional</span>
                              <span className="font-semibold text-neutral-800">{meta.os}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Navegador</span>
                              <span className="font-semibold text-neutral-800">{meta.browser}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Resolução da Tela</span>
                              <span className="font-mono text-[11px] text-neutral-700">{meta.screenResolution}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Janela / Viewport</span>
                              <span className="font-mono text-[11px] text-neutral-700">{meta.viewportSize} ({meta.pixelRatio})</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Orientação</span>
                              <span className="text-neutral-700">{meta.orientation}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Touchscreen</span>
                              <span className="text-neutral-700">{meta.touchSupport}</span>
                            </div>
                            {meta.cpuCores && meta.cpuCores !== 'Não informado' && (
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Hardware</span>
                                <span className="text-neutral-700">{meta.cpuCores} {meta.deviceMemory ? `• ${meta.deviceMemory}` : ''}</span>
                              </div>
                            )}
                            <div className="pt-1 border-t border-neutral-100 flex items-center justify-between">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">User-Agent</span>
                              <button
                                onClick={(e) => handleCopyUserAgent(order.id, meta.userAgent, e)}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedUaId === order.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedUaId === order.id ? 'Copiado' : 'Copiar UA'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-500 py-3 text-center">
                            Metadados detalhados de dispositivo são gravados a partir dos novos pedidos realizados no catálogo.
                          </div>
                        )}
                      </div>

                      {/* Card 3: 🕒 Horário, Rede & Localização */}
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide border-b border-neutral-100 pb-2">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span>Horário, Rede & Origem</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Horário Exato</span>
                            <span className="font-semibold text-neutral-900">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Fuso Horário</span>
                            <span className="font-medium text-neutral-800">
                              {meta?.timeZone || 'America/Sao_Paulo'} ({meta?.timeZoneOffset || 'UTC-03:00'})
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Idioma do Sistema</span>
                            <span className="font-medium text-neutral-800">{meta?.languages || meta?.language || 'pt-BR'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Conexão de Rede</span>
                            <span className="font-medium text-neutral-800">{meta?.connectionType || 'Banda Larga / Wi-Fi'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Origem do Acesso (Referrer)</span>
                            <span className="text-neutral-700 text-[11px] block truncate" title={meta?.referrer}>
                              {meta?.referrer || 'Acesso Direto ao Catálogo'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Status de Conectividade</span>
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Pedido concluído e transmitido com sucesso
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: 👗 Detalhamento Completo dos Produtos & Margem Real */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide">
                          <ShoppingBag className="w-4 h-4 text-neutral-700" />
                          <span>Detalhamento dos Looks do Carrinho & Margens de Lucro</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Lucro Total: R$ {order.totalProfit.toFixed(2).replace('.', ',')} ({order.total > 0 ? ((order.totalProfit / order.total) * 100).toFixed(1) : 0}% margem)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              <th className="py-2 pr-3">Look / Produto</th>
                              <th className="py-2 px-3">Tamanho</th>
                              <th className="py-2 px-3">Cor</th>
                              <th className="py-2 px-3 text-center">Qtd</th>
                              <th className="py-2 px-3 text-right">Preço Venda</th>
                              <th className="py-2 px-3 text-right">Custo Fab.</th>
                              <th className="py-2 px-3 text-right">Lucro Item</th>
                              <th className="py-2 pl-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {order.items.map((item, idx) => {
                              const matchingProd = products.find((p) => p.id === item.productId);
                              const img = matchingProd?.images?.[0] || 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=120&q=80';
                              const itemProfit = (item.salePrice - item.costPrice) * item.quantity;
                              const marginPct = item.salePrice > 0 ? (((item.salePrice - item.costPrice) / item.salePrice) * 100).toFixed(0) : '0';

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
                                    R$ {itemProfit.toFixed(2).replace('.', ',')}
                                    <span className="text-[10px] text-neutral-400 block font-normal">({marginPct}%)</span>
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

                      {/* Totals row */}
                      <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-4 text-neutral-500">
                          <span>Subtotal: <strong className="text-neutral-800">R$ {order.subtotal.toFixed(2).replace('.', ',')}</strong></span>
                          {order.discount > 0 && (
                            <span className="text-emerald-700">Desconto: <strong>- R$ {order.discount.toFixed(2).replace('.', ',')}</strong></span>
                          )}
                          <span>Custo Total: <strong className="text-neutral-800">R$ {order.totalCost.toFixed(2).replace('.', ',')}</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-500 mr-2">Total Final da Venda:</span>
                          <span className="text-base font-black text-neutral-900">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 5: 💬 Mensagem Formatada do WhatsApp */}
                    {order.whatsappMessage && (
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                          <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span>Mensagem Pré-formatada Enviada no WhatsApp (wa.me)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleCopyWhatsAppMsg(order, e)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedMsgId === order.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Mensagem Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>Copiar Mensagem</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => handleContactCustomer(order, e)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Abrir no WhatsApp</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto shadow-inner">
                          {order.whatsappMessage}
                        </div>
                      </div>
                    )}
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
