import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, ArrowLeftRight } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, ACCOUNT_ICONS, COLORS } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Accounts() {
  const { data, addAccount, updateAccount, deleteAccount, addTransaction } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const [showForm, setShowForm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editAcc, setEditAcc] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '💳', color: '#3b82f6', initialBalance: '' });
  const [transfer, setTransfer] = useState({ from: '', to: '', amount: '' });

  const getBalance = (accId) => {
    const acc = data.accounts.find(a => a.id === accId);
    const initial = acc?.initialBalance || 0;
    return data.transactions.reduce((s, t) => {
      if (t.accountId === accId) {
        if (t.type === 'income') return s + t.amount;
        if (t.type === 'expense') return s - t.amount;
        if (t.type === 'transfer') return s - t.amount;
      }
      if (t.type === 'transfer' && t.toAccountId === accId) return s + t.amount;
      return s;
    }, initial);
  };

  const handleSave = () => {
    if (!form.name) return;
    const accData = { ...form, initialBalance: parseFloat(form.initialBalance) || 0 };
    if (editAcc) updateAccount(editAcc.id, accData);
    else addAccount(accData);
    setShowForm(false);
    setEditAcc(null);
    setForm({ name: '', icon: '💳', color: '#3b82f6', initialBalance: '' });
  };

  const handleTransfer = () => {
    if (!transfer.from || !transfer.to || !transfer.amount) return;
    const fromAcc = data.accounts.find(a => a.id === transfer.from);
    const toAcc = data.accounts.find(a => a.id === transfer.to);
    addTransaction({
      type: 'transfer',
      amount: parseFloat(transfer.amount),
      description: `Transferência: ${fromAcc?.name} → ${toAcc?.name}`,
      accountId: transfer.from,
      toAccountId: transfer.to,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    });
    setShowTransfer(false);
    setTransfer({ from: '', to: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contas</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowTransfer(true)} variant="outline" size="sm" className="rounded-xl">
            <ArrowLeftRight className="w-4 h-4 mr-1" /> Transferir
          </Button>
          <Button onClick={() => { setEditAcc(null); setForm({ name: '', icon: '💳', color: '#3b82f6', initialBalance: '' }); setShowForm(true); }} size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
        </div>
      </div>

      {data.accounts.length === 0 ? (
        <div className="text-center py-16">
          <p className={`${isDark ? 'text-white/40' : 'text-slate-400'}`}>Nenhuma conta criada</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.accounts.map((acc, i) => {
            const bal = getBalance(acc.id);
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: acc.color + '20' }}>
                      {acc.icon}
                    </div>
                    <h3 className="font-semibold">{acc.name}</h3>
                  </div>
                  <button onClick={() => { setEditAcc(acc); setForm({ name: acc.name, icon: acc.icon, color: acc.color, initialBalance: String(acc.initialBalance || 0) }); setShowForm(true); }}>
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <p className={`text-2xl font-bold ${bal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(bal, sym)}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Account Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader><DialogTitle>{editAcc ? 'Editar' : 'Nova'} Conta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nubank" className="mt-1" />
            </div>
            <div>
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ACCOUNT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center ${form.icon === icon ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}
                  >{icon}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`} style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Saldo inicial ({sym})</Label>
              <Input type="number" value={form.initialBalance} onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl">Salvar</Button>
              {editAcc && <Button variant="destructive" className="rounded-xl" onClick={() => { deleteAccount(editAcc.id); setShowForm(false); }}><Trash2 className="w-4 h-4" /></Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader><DialogTitle>Transferência entre contas</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>De</Label>
              <Select value={transfer.from} onValueChange={v => setTransfer(t => ({ ...t, from: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Conta origem" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Para</Label>
              <Select value={transfer.to} onValueChange={v => setTransfer(t => ({ ...t, to: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Conta destino" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.filter(a => a.id !== transfer.from).map(a => <SelectItem key={a.id} value={a.id}>{a.icon} {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor ({sym})</Label>
              <Input type="number" value={transfer.amount} onChange={e => setTransfer(t => ({ ...t, amount: e.target.value }))} className="mt-1" />
            </div>
            <Button onClick={handleTransfer} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl">Transferir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}