import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TransactionModal({ open, onClose, editTransaction }) {
  const { data, addTransaction, updateTransaction, addInstallmentPurchase } = useFinance();
  const isDark = data.settings.theme === 'dark';

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    accountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
    paymentMethod: '',
    tags: '',
    isInstallment: false,
    installmentCount: 2,
  });

  useEffect(() => {
    if (editTransaction) {
      setForm({
        type: editTransaction.type || 'expense',
        amount: String(editTransaction.amount || ''),
        description: editTransaction.description || '',
        categoryId: editTransaction.categoryId || '',
        accountId: editTransaction.accountId || '',
        toAccountId: editTransaction.toAccountId || '',
        date: editTransaction.date || new Date().toISOString().split('T')[0],
        time: editTransaction.time || '12:00',
        notes: editTransaction.notes || '',
        paymentMethod: editTransaction.paymentMethod || '',
        tags: (editTransaction.tags || []).join(', '),
        isInstallment: false,
        installmentCount: editTransaction.installmentTotal || 2,
      });
    } else {
      setForm({
        type: 'expense', amount: '', description: '', categoryId: '',
        accountId: data.accounts[0]?.id || '', toAccountId: '', 
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: '', paymentMethod: '', tags: '',
        isInstallment: false, installmentCount: 2,
      });
    }
  }, [editTransaction, open, data.accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const txData = {
      ...form,
      amount: parseFloat(form.amount) || 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    delete txData.isInstallment;
    delete txData.installmentCount;

    if (editTransaction) {
      updateTransaction(editTransaction.id, txData);
    } else if (form.isInstallment && form.type === 'expense' && parseInt(form.installmentCount) > 1) {
      addInstallmentPurchase(txData, parseInt(form.installmentCount));
    } else {
      addTransaction(txData);
    }
    onClose();
  };

  const types = [
    { value: 'income', label: 'Receita', icon: ArrowUpCircle, color: 'text-emerald-500' },
    { value: 'expense', label: 'Despesa', icon: ArrowDownCircle, color: 'text-red-500' },
    { value: 'transfer', label: 'Transferência', icon: ArrowLeftRight, color: 'text-blue-500' },
  ];

  const filteredCategories = data.categories.filter(c => 
    form.type === 'transfer' ? true : c.type === form.type
  );

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
            <h2 className="text-xl font-bold">{editTransaction ? 'Editar' : 'Nova'} Movimentação</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {types.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.type === t.value
                      ? t.value === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : t.value === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Amount */}
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
                autoFocus
              />
            </div>

            {/* Installment option - only for expenses */}
            {form.type === 'expense' && !editTransaction && (
              <div className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isInstallment}
                    onChange={e => setForm(f => ({ ...f, isInstallment: e.target.checked }))}
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <span className="text-sm font-medium">Compra parcelada</span>
                </label>
                {form.isInstallment && (
                  <div className="mt-3 flex items-center gap-3">
                    <Label className="whitespace-nowrap text-xs">Nº de parcelas</Label>
                    <Input
                      type="number"
                      min="2"
                      max="48"
                      value={form.installmentCount}
                      onChange={e => setForm(f => ({ ...f, installmentCount: e.target.value }))}
                      className="h-9 w-24"
                    />
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                      {form.amount && parseInt(form.installmentCount) > 1
                        ? `${data.settings.currencySymbol} ${(parseFloat(form.amount) / parseInt(form.installmentCount)).toFixed(2)}/mês`
                        : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Almoço, Salário..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
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

              {/* Account */}
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

            {form.type === 'transfer' && (
              <div>
                <Label>Para conta</Label>
                <Select value={form.toAccountId} onValueChange={v => setForm(f => ({ ...f, toAccountId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Conta destino" /></SelectTrigger>
                  <SelectContent>
                    {data.accounts.filter(a => a.id !== form.accountId).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Hora</Label>
                <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Forma de pagamento</Label>
              <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observação</Label>
              <Textarea
                placeholder="Detalhes adicionais..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base">
              {editTransaction ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}