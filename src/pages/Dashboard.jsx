import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import TransactionModal from '@/components/TransactionModal';
import DashboardChart from '@/components/DashboardChart';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, getTotalBalance, deleteTransaction } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const [showModal, setShowModal] = useState(false);
  const sym = data.settings.currencySymbol;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthTxs = useMemo(() =>
    data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
  [data.transactions, year, month]);

  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const totalBalance = getTotalBalance();
  const piggyTotal = data.piggyBanks.reduce((s, p) => s + (p.current || 0), 0);

  const recentTxs = [...data.transactions].sort((a, b) => 
    new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00'))
  ).slice(0, 5);

  const categorySpending = useMemo(() => {
    const map = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      const cat = data.categories.find(c => c.id === t.categoryId);
      const name = cat ? cat.name : 'Sem categoria';
      const icon = cat ? cat.icon : '📦';
      const color = cat ? cat.color : '#94a3b8';
      map[name] = map[name] || { name, icon, color, total: 0 };
      map[name].total += t.amount;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthTxs, data.categories]);

  const cards = [
    { label: 'Receitas', value: income, icon: TrendingUp, color: 'from-emerald-400 to-emerald-600', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Despesas', value: expenses, icon: TrendingDown, color: 'from-red-400 to-red-600', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'Saldo', value: totalBalance, icon: Wallet, color: 'from-blue-400 to-blue-600', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Cofrinho', value: piggyTotal, icon: PiggyBank, color: 'from-amber-400 to-amber-600', textColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const getTypeIcon = (type) => {
    if (type === 'income') return <ArrowUpCircle className="w-4 h-4 text-emerald-500" />;
    if (type === 'expense') return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-500" />;
  };

  // Insights
  const lastMonthTxs = data.transactions.filter(t => {
    const d = new Date(t.date);
    const lm = month === 0 ? 11 : month - 1;
    const ly = month === 0 ? year - 1 : year;
    return d.getFullYear() === ly && d.getMonth() === lm;
  });
  const lastMonthExpenses = lastMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const expenseChange = lastMonthExpenses > 0 ? ((expenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(0) : null;

  const insights = [];
  if (expenseChange !== null) {
    const verb = Number(expenseChange) < 0 ? 'menos' : 'mais';
    insights.push(`Você gastou ${Math.abs(expenseChange)}% ${verb} que mês passado.`);
  }
  if (categorySpending[0]) insights.push(`Seu maior gasto é ${categorySpending[0].icon} ${categorySpending[0].name}.`);
  if (savings > 0) insights.push(`Você economizou ${formatCurrency(savings, sym)} este mês.`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          Visão geral das suas finanças
        </p>
      </div>

      {/* Insight banner */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}
        >
          💡 {insights[Math.floor(Date.now() / 10000) % insights.length]}
        </motion.div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{card.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`text-lg lg:text-xl font-bold ${card.textColor}`}>
              {formatCurrency(card.value, sym)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Economy indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Economia do mês</span>
          <span className={`text-sm font-bold ${savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(savings, sym)}
          </span>
        </div>
        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: income > 0 ? `${Math.min((savings / income) * 100, 100)}%` : '0%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${savings >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
        </div>
      </motion.div>

      {/* Chart */}
      <DashboardChart />

      {/* Category spending */}
      {categorySpending.length > 0 && (
        <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
          <h3 className="font-semibold mb-4">Gastos por categoria</h3>
          <div className="space-y-3">
            {categorySpending.slice(0, 5).map(cat => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-sm font-semibold">{formatCurrency(cat.total, sym)}</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(cat.total / (categorySpending[0]?.total || 1)) * 100}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Últimas movimentações</h3>
          <Link to="/transactions" className="text-sm text-emerald-500 font-medium">Ver todas</Link>
        </div>
        {recentTxs.length === 0 ? (
          <p className={`text-sm text-center py-8 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            Nenhuma movimentação ainda
          </p>
        ) : (
          <div className="space-y-3">
            {recentTxs.map(tx => {
              const cat = data.categories.find(c => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="flex items-center gap-3">
                  {getTypeIcon(tx.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      {cat ? `${cat.icon} ${cat.name}` : ''} · {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <TransactionModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}