import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '@/lib/formatters';

export default function Statistics() {
  const { data } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;
  const now = new Date();

  // Category pie chart (current month expenses)
  const categoryData = useMemo(() => {
    const map = {};
    data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .forEach(t => {
        const cat = data.categories.find(c => c.id === t.categoryId);
        const name = cat ? cat.name : 'Outros';
        const color = cat ? cat.color : '#94a3b8';
        map[name] = map[name] || { name, value: 0, color };
        map[name].value += t.amount;
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [data.transactions, data.categories]);

  // Monthly line chart
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const txs = data.transactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });
      months.push({
        name: MONTH_NAMES[m].substring(0, 3),
        receitas: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        despesas: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        economia: 0,
      });
      months[months.length - 1].economia = months[months.length - 1].receitas - months[months.length - 1].despesas;
    }
    return months;
  }, [data.transactions]);

  // Stats
  const currentMonthTxs = data.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const totalExpenses = currentMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const avgExpenses = monthlyData.length > 0 ? monthlyData.reduce((s, m) => s + m.despesas, 0) / monthlyData.filter(m => m.despesas > 0).length : 0;
  const maxExpense = currentMonthTxs.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
  const maxIncome = currentMonthTxs.filter(t => t.type === 'income').sort((a, b) => b.amount - a.amount)[0];

  const cardClass = `p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estatísticas</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Média mensal de gastos</p>
          <p className="text-lg font-bold text-red-500 mt-1">{formatCurrency(avgExpenses || 0, sym)}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Economia do mês</p>
          <p className={`text-lg font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(totalIncome - totalExpenses, sym)}
          </p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Maior gasto</p>
          <p className="text-sm font-bold text-red-500 mt-1">{maxExpense ? formatCurrency(maxExpense.amount, sym) : '-'}</p>
          <p className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-300'}`}>{maxExpense?.description || ''}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Maior receita</p>
          <p className="text-sm font-bold text-emerald-500 mt-1">{maxIncome ? formatCurrency(maxIncome.amount, sym) : '-'}</p>
          <p className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-300'}`}>{maxIncome?.description || ''}</p>
        </div>
      </div>

      {/* Pie Chart */}
      {categoryData.length > 0 && (
        <div className={cardClass}>
          <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, sym)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line Chart */}
      <div className={cardClass}>
        <h3 className="font-semibold mb-4">Evolução Mensal</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#64748b' }} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, color: isDark ? '#fff' : '#000' }} formatter={(v) => formatCurrency(v, sym)} />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="economia" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-500 rounded" /> Receitas</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-500 rounded" /> Despesas</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500 rounded border-dashed" /> Economia</div>
        </div>
      </div>

      {/* Monthly comparison bar chart */}
      <div className={cardClass}>
        <h3 className="font-semibold mb-4">Comparativo Mensal</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.slice(-6)}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#64748b' }} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, color: isDark ? '#fff' : '#000' }} formatter={(v) => formatCurrency(v, sym)} />
              <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}