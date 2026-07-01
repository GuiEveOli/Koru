import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Plus, Trash2, Power, Calendar } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import RecurringForm from '@/components/RecurringForm';

const FREQ_LABELS = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
};

export default function Recurring() {
  const { data, deleteRecurring, updateRecurring } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const recurring = data.recurringTransactions || [];

  const totalIncome = recurring.filter(r => r.active && r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = recurring.filter(r => r.active && r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const net = totalIncome - totalExpense;

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
            <Repeat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Recorrentes</h1>
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Transações automáticas</p>
          </div>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Receitas/mês</p>
          <p className="text-base font-bold text-emerald-500 mt-1">{formatCurrency(totalIncome, data.settings.currencySymbol)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Despesas/mês</p>
          <p className="text-base font-bold text-red-500 mt-1">{formatCurrency(totalExpense, data.settings.currencySymbol)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Saldo/mês</p>
          <p className={`text-base font-bold mt-1 ${net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(net, data.settings.currencySymbol)}
          </p>
        </div>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <Repeat className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
          <p className={`font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Nenhuma transação recorrente</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Crie transações que se repetem automaticamente</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            Criar primeira
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recurring.map((r, idx) => {
            const cat = data.categories.find(c => c.id === r.categoryId);
            const acc = data.accounts.find(a => a.id === r.accountId);
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-2xl p-4 flex items-center gap-3 ${
                  isDark ? 'bg-slate-900' : 'bg-white'
                } ${!r.active ? 'opacity-50' : ''}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}
                >
                  {cat?.icon || '🔁'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.description}</p>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    <span>{FREQ_LABELS[r.frequency]}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {r.nextDueDate ? formatDate(r.nextDueDate) : formatDate(r.startDate)}
                    </span>
                    {acc && <><span>•</span><span>{acc.icon} {acc.name}</span></>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-bold ${r.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount, data.settings.currencySymbol)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <button
                      onClick={() => updateRecurring(r.id, { active: !r.active })}
                      className={`p-1.5 rounded-lg transition-colors ${
                        r.active
                          ? 'text-emerald-500 hover:bg-emerald-500/10'
                          : isDark ? 'text-white/30 hover:bg-white/10' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                      title={r.active ? 'Pausar' : 'Ativar'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(r)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'text-white/40 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title="Editar"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Excluir esta transação recorrente?')) deleteRecurring(r.id); }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <RecurringForm open={showForm} onClose={handleClose} editItem={editItem} />
    </div>
  );
}