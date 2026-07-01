import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '@/lib/formatters';
import TransactionModal from '@/components/TransactionModal';

export default function MonthlyView() {
  const { data } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const monthTxs = useMemo(() =>
    data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
  [data.transactions, year, month]);

  const filteredTxs = filter === 'all' ? monthTxs : monthTxs.filter(t => t.type === filter);

  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayData = (day) => {
    if (!day) return null;
    const dayTxs = monthTxs.filter(t => {
      const d = new Date(t.date);
      return d.getDate() === day;
    });
    const inc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income: inc, expenses: exp, count: dayTxs.length };
  };

  const selectedDayTxs = selectedDay ? filteredTxs.filter(t => new Date(t.date).getDate() === selectedDay) : [];

  const filters = [
    { value: 'all', label: 'Todos' },
    { value: 'income', label: 'Receitas' },
    { value: 'expense', label: 'Despesas' },
    { value: 'transfer', label: 'Transferências' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{MONTH_NAMES[month]} {year}</h1>
        <button onClick={nextMonth} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Recebido', value: income, color: 'text-emerald-500' },
          { label: 'Gasto', value: expenses, color: 'text-red-500' },
          { label: 'Saldo', value: income - expenses, color: income - expenses >= 0 ? 'text-emerald-500' : 'text-red-500' },
        ].map(c => (
          <div key={c.label} className={`p-3 rounded-2xl text-center ${isDark ? 'bg-white/5' : 'bg-white border border-slate-100'}`}>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{c.label}</p>
            <p className={`text-sm font-bold mt-1 ${c.color}`}>{formatCurrency(c.value, sym)}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className={`text-center text-xs font-medium py-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dayData = getDayData(day);
            const isSelected = day === selectedDay;
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <button
                key={i}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                disabled={!day}
                className={`aspect-square rounded-xl text-xs flex flex-col items-center justify-center gap-0.5 transition-all ${
                  !day ? '' :
                  isSelected ? 'bg-emerald-500 text-white' :
                  isToday ? isDark ? 'bg-white/10' : 'bg-emerald-50' :
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                {day && (
                  <>
                    <span className="font-medium">{day}</span>
                    {dayData && dayData.count > 0 && (
                      <div className="flex gap-0.5">
                        {dayData.income > 0 && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                        {dayData.expenses > 0 && <div className="w-1 h-1 rounded-full bg-red-400" />}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-emerald-500 text-white'
                : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Day transactions */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
        >
          <h3 className="font-semibold mb-3">{selectedDay} de {MONTH_NAMES[month]}</h3>
          {selectedDayTxs.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Nenhuma movimentação neste dia</p>
          ) : (
            <div className="space-y-3">
              {selectedDayTxs.map(tx => {
                const cat = data.categories.find(c => c.id === tx.categoryId);
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    {tx.type === 'income' ? <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> : <ArrowDownCircle className="w-4 h-4 text-red-500" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{cat ? `${cat.icon} ${cat.name}` : ''}</p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}