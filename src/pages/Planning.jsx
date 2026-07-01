import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '@/lib/formatters';
import { Input } from '@/components/ui/input';

export default function Planning() {
  const { data, setBudget } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const expenseCategories = data.categories.filter(c => c.type === 'expense');

  const spending = useMemo(() => {
    const map = {};
    data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .forEach(t => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  }, [data.transactions]);

  const getBudget = (catId) => {
    const b = data.budgets.find(b => b.month === monthKey && b.categoryId === catId);
    return b ? b.amount : 0;
  };

  const totalBudget = expenseCategories.reduce((s, c) => s + getBudget(c.id), 0);
  const totalSpent = expenseCategories.reduce((s, c) => s + (spending[c.id] || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planejamento Mensal</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
        </p>
      </div>

      {/* Overview */}
      <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
        <div className="flex justify-between mb-2">
          <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Gasto total</span>
          <span className="text-sm font-bold">{formatCurrency(totalSpent, sym)} / {formatCurrency(totalBudget, sym)}</span>
        </div>
        <div className={`h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: totalBudget > 0 ? `${Math.min((totalSpent / totalBudget) * 100, 100)}%` : '0%' }}
            className={`h-full rounded-full ${totalSpent > totalBudget && totalBudget > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
        </div>
      </div>

      {expenseCategories.length === 0 ? (
        <p className={`text-center py-8 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
          Crie categorias de despesa primeiro
        </p>
      ) : (
        <div className="space-y-3">
          {expenseCategories.map(cat => {
            const budget = getBudget(cat.id);
            const spent = spending[cat.id] || 0;
            const pct = budget > 0 ? (spent / budget) * 100 : 0;
            const over = budget > 0 && spent > budget;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{cat.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      {formatCurrency(spent, sym)} gasto
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {over && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <div className="w-24">
                      <Input
                        type="number"
                        value={budget || ''}
                        onChange={e => setBudget(monthKey, cat.id, parseFloat(e.target.value) || 0)}
                        placeholder="Limite"
                        className="h-8 text-xs text-right"
                      />
                    </div>
                  </div>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {over && (
                  <p className="text-xs text-red-500 mt-1">
                    Ultrapassou {formatCurrency(spent - budget, sym)} do limite!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}