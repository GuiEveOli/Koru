import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RecurringForm({ open, onClose, editItem }) {
  const { data, addRecurring, updateRecurring } = useFinance();
  const isDark = data.settings.theme === 'dark';

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    accountId: '',
    frequency: 'monthly',
    dayOfMonth: new Date().getDate(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentMethod: '',
    notes: '',
  });

  useEffect(() => {
    if (editItem) {
      setForm({
        type: editItem.type || 'expense',
        amount: String(editItem.amount || ''),
        description: editItem.description || '',
        categoryId: editItem.categoryId || '',
        accountId: editItem.accountId || '',
        frequency: editItem.frequency || 'monthly',
        dayOfMonth: editItem.dayOfMonth || 1,
        startDate: editItem.startDate || new Date().toISOString().split('T')[0],
        endDate: editItem.endDate || '',
        paymentMethod: editItem.paymentMethod || '',
        notes: editItem.notes || '',
      });
    } else {
      setForm({
        type: 'expense', amount: '', description: '', categoryId: '',
        accountId: data.accounts[0]?.id || '',
        frequency: 'monthly', dayOfMonth: new Date().getDate(),
        startDate: new Date().toISOString().split('T')[0],
        endDate: '', paymentMethod: '', notes: '',
      });
    }
  }, [editItem, open, data.accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rtData = {
      ...form,
      amount: parseFloat(form.amount) || 0,
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
      endDate: form.endDate || null,
    };
    if (editItem) {
      updateRecurring(editItem.id, rtData);
    } else {
      addRecurring(rtData);
    }
    onClose();
  };

  const filteredCategories = data.categories.filter(c => c.type === form.type);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className={`w-full max-w-lg rounded-t-3xl lg:rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{editItem ? 'Editar' : 'Nova'} Transação Recorrente</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {[
                { value: 'expense', label: 'Despesa', color: 'red' },
                { value: 'income', label: 'Receita', color: 'emerald' },
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.type === t.value
                      ? t.value === 'income'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Aluguel, Salário, Netflix..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1"
                required
                autoFocus
              />
            </div>

            <div>
              <Label>Valor ({data.settings.currencySymbol})</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="text-2xl font-bold h-14 mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conta</Label>
                <Select value={form.accountId} onValueChange={v => setForm(f => ({ ...f, accountId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {data.accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Frequência</Label>
                <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.frequency === 'monthly' && (
                <div>
                  <Label>Dia do mês</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dayOfMonth}
                    onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" required />
              </div>
              <div>
                <Label>Término (opcional)</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base">
              {editItem ? 'Salvar alterações' : 'Criar recorrente'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}