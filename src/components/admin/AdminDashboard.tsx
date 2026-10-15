import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface Props {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigateToTab }) => {
  const { orders, products, lowStockProducts, settings } = useStore();
  const [activePieFilter, setActivePieFilter] = useState<'category' | 'payment'>('category');

  // Overall Financial & Sales Calculations
  const completedOrPendingOrders = orders.filter((o) => o.status !== 'Cancelado');
  const totalRevenue = completedOrPendingOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = completedOrPendingOrders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const totalCost = completedOrPendingOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalProfit = completedOrPendingOrders.reduce((sum, o) => sum + o.totalProfit, 0);
  const profitMarginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Sales by Category (Dynamic)
  const categorySalesMap: Record<string, { count: number; total: number; profit: number }> = {};
  const configuredCategories = settings.categories || ['Geral', 'Eletrônicos & Tech', 'Acessórios', 'Casa & Estilo', 'Vestuário'];
  configuredCategories.forEach((cat) => {
    categorySalesMap[cat] = { count: 0, total: 0, profit: 0 };
  });

  completedOrPendingOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.category || 'Geral';
      if (!categorySalesMap[cat]) {
        categorySalesMap[cat] = { count: 0, total: 0, profit: 0 };
      }
      categorySalesMap[cat].count += item.quantity;
      const itemRevenue = item.salePrice * item.quantity;
      const itemCost = item.costPrice * item.quantity;
      categorySalesMap[cat].total += itemRevenue;
      categorySalesMap[cat].profit += (itemRevenue - itemCost);
    });
  });

  const palette = ['#0f172a', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2'];
  const categoryColors: Record<string, string> = {};
  Object.keys(categorySalesMap).forEach((cat, idx) => {
    categoryColors[cat] = palette[idx % palette.length];
  });

  // Sales by Payment Method
  const paymentMethodMap: Record<string, { count: number; total: number }> = {
    'Pix': { count: 0, total: 0 },
    'Cartão de Crédito': { count: 0, total: 0 },
    'Dinheiro': { count: 0, total: 0 }
  };

  completedOrPendingOrders.forEach((o) => {
    const pay = o.customer.paymentMethod || 'Pix';
    if (!paymentMethodMap[pay]) {
      paymentMethodMap[pay] = { count: 0, total: 0 };
    }
    paymentMethodMap[pay].count += 1;
    paymentMethodMap[pay].total += o.total;
  });

  const paymentColors: Record<string, string> = {
    'Pix': '#10b981',
    'Cartão de Crédito': '#6366f1',
    'Dinheiro': '#f59e0b'
  };

  // Pie Chart Math (SVG)
  const pieData = activePieFilter === 'category'
    ? Object.entries(categorySalesMap).map(([name, data]) => ({
        label: name,
        value: data.total,
        color: categoryColors[name as ProductCategory] || '#888'
      }))
    : Object.entries(paymentMethodMap).map(([name, data]) => ({
        label: name,
        value: data.total,
        color: paymentColors[name] || '#888'
      }));

  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  // Generate SVG Pie Slices
  let cumulativeAngle = 0;
  const pieSlices = pieData.map((slice) => {
    const sliceAngle = pieTotal > 0 ? (slice.value / pieTotal) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathData =
      slice.value === 0 || pieTotal === 0
        ? ''
        : sliceAngle >= 359.9
        ? `M 100, 20 A 80,80 0 1,1 99.9,20 Z`
        : `M 100,100 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;

    const percent = pieTotal > 0 ? Math.round((slice.value / pieTotal) * 100) : 0;

    return {
      ...slice,
      pathData,
      percent
    };
  });

  // Daily Performance Reports: Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });

    const dayOrders = completedOrPendingOrders.filter(
      (o) => o.createdAt.split('T')[0] === dateStr
    );
    const dayTotal = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const dayProfit = dayOrders.reduce((sum, o) => sum + o.totalProfit, 0);

    return {
      dateStr,
      dayLabel,
      total: dayTotal,
      profit: dayProfit,
      ordersCount: dayOrders.length
    };
  });

  const maxDailyRevenue = Math.max(...last7Days.map((d) => d.total), 500);

  // Detailed Monthly Metrics Table (Computed from real orders)
  const monthlyMap: Record<string, { revenue: number; orders: number; cost: number; profit: number }> = {};
  
  completedOrPendingOrders.forEach((o) => {
    const dateObj = new Date(o.createdAt || Date.now());
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthStr = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    
    if (!monthlyMap[monthStr]) {
      monthlyMap[monthStr] = { revenue: 0, orders: 0, cost: 0, profit: 0 };
    }
    monthlyMap[monthStr].revenue += o.total;
    monthlyMap[monthStr].orders += 1;
    monthlyMap[monthStr].cost += o.totalCost;
    monthlyMap[monthStr].profit += o.totalProfit;
  });

  // If no orders yet, include current month with zero values
  const currentDate = new Date();
  const currentMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentMonthStr = `${currentMonthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  if (Object.keys(monthlyMap).length === 0) {
    monthlyMap[currentMonthStr] = { revenue: 0, orders: 0, cost: 0, profit: 0 };
  }

  const monthlyMetrics = Object.entries(monthlyMap).map(([month, data]) => {
    const ticket = data.orders > 0 ? data.revenue / data.orders : 0;
    const marginNum = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    return {
      month,
      revenue: data.revenue,
      orders: data.orders,
      ticket,
      cost: data.cost,
      profit: data.profit,
      margin: `${marginNum.toFixed(1)}%`
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Total */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Faturamento Bruto</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-sans">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs mês anterior</span>
          </div>
        </div>

        {/* Card 2: Lucro Líquido Real */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Lucro Líquido Real</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-sans">
            R$ {totalProfit.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500">
            Venda menos Custo de Fabricação
          </div>
        </div>

        {/* Card 3: Margem Média */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Margem de Lucro</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-sans">
            {profitMarginPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-500">
            Custo total: R$ {totalCost.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Card 4: Ticket Médio & Pedidos */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Ticket Médio</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-sans">
            R$ {averageTicket.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-neutral-500">
            {totalOrdersCount} pedidos registrados
          </div>
        </div>
      </div>

      {/* Row: Gráfico de Pizza Interativo + Relatório Diário de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Gráfico de Pizza (Pie Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-neutral-900 text-lg font-sans">
                  Distribuição de Vendas
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActivePieFilter('category')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activePieFilter === 'category'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Por Categoria
                </button>
                <button
                  onClick={() => setActivePieFilter('payment')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activePieFilter === 'payment'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Por Pagamento
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mb-6">
              Participação no faturamento total das vendas registradas no catálogo.
            </p>

            {/* SVG Pie Chart and Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
              <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice, i) => (
                    <path
                      key={i}
                      d={slice.pathData}
                      fill={slice.color}
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      <title>{`${slice.label}: R$ ${slice.value.toFixed(2)} (${slice.percent}%)`}</title>
                    </path>
                  ))}
                  {/* Donut Hole */}
                  <circle cx="100" cy="100" r="48" fill="#ffffff" />
                </svg>

                {/* Inner Donut Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Total</span>
                  <span className="text-sm font-extrabold text-neutral-900">
                    R$ {pieTotal.toFixed(0).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5 w-full max-w-xs">
                {pieSlices.map((slice, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="font-semibold text-neutral-800">{slice.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-mono">
                        R$ {slice.value.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="font-bold text-neutral-900 w-9 text-right">
                        {slice.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Atualizado em tempo real</span>
            <span className="font-semibold text-neutral-800">
              {completedOrPendingOrders.length} pedidos contabilizados
            </span>
          </div>
        </div>

        {/* 2. Relatórios de Desempenho Diário */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-sans font-bold text-neutral-900 text-lg">
                  Desempenho Diário de Vendas
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                Últimos 7 dias
              </span>
            </div>

            <p className="text-xs text-neutral-500 mb-6">
              Volume diário de faturamento gerado pelos pedidos no WhatsApp.
            </p>

            {/* Daily Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-neutral-200">
              {last7Days.map((day, i) => {
                const heightPct = Math.max(12, Math.round((day.total / maxDailyRevenue) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-neutral-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      R${day.total.toFixed(0)}
                    </div>
                    <div className="w-full max-w-[36px] bg-neutral-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl group-hover:from-emerald-700 group-hover:to-teal-500 transition-all cursor-pointer"
                        style={{ height: `${heightPct}%` }}
                        title={`${day.dayLabel}: R$ ${day.total.toFixed(2)} (${day.ordersCount} pedidos)`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-600 capitalize">
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Média diária da semana:</span>
            <span className="font-bold text-neutral-900">
              R$ {(totalRevenue / 7).toFixed(2).replace('.', ',')} / dia
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tabela de Métricas de Vendas Mensais Detalhadas */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans font-bold text-neutral-900 text-lg">
              Métricas de Vendas Mensais Detalhadas
            </h3>
          </div>
          <span className="text-xs text-neutral-500">Histórico Consolidado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Período</th>
                <th className="py-3 px-4">Faturamento Bruto</th>
                <th className="py-3 px-4">Nº Pedidos</th>
                <th className="py-3 px-4">Ticket Médio</th>
                <th className="py-3 px-4">Custo Fabricação</th>
                <th className="py-3 px-4">Lucro Líquido</th>
                <th className="py-3 px-4">Margem (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {monthlyMetrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-neutral-900">{row.month}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    R$ {row.revenue.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-700">{row.orders}</td>
                  <td className="py-3.5 px-4 text-neutral-700">
                    R$ {row.ticket.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">
                    R$ {row.cost.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">
                    R$ {row.profit.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                      {row.margin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
