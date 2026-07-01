import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trash2, Edit2 } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, COLORS } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Goals() {
  const { data, addGoal, updateGoal, deleteGoal } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#8b5cf6' });

  const handleSave = () => {
    if (!form.name) return;
    const goalData = { ...form, targetAmount: parseFloat(form.targetAmount) || 0, currentAmount: parseFloat(form.currentAmount) || 0 };
    if (editGoal) updateGoal(editGoal.id, goalData);
    else addGoal(goalData);
    setShowForm(false);
    setEditGoal(null);
    setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#8b5cf6' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas Financeiras</h1>
        <Button onClick={() => { setEditGoal(null); setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#8b5cf6' }); setShowForm(true); }} size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-1" /> Nova
        </Button>
      </div>

      {data.goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-slate-200'}`} />
          <p className={`${isDark ? 'text-white/40' : 'text-slate-400'}`}>Crie sua primeira meta</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.goals.map((goal, i) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const deadlineDays = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{goal.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditGoal(goal); setForm({ name: goal.name, targetAmount: String(goal.targetAmount), currentAmount: String(goal.currentAmount), deadline: goal.deadline || '', color: goal.color }); setShowForm(true); }}>
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <p className="text-2xl font-bold" style={{ color: goal.color }}>{formatCurrency(goal.currentAmount, sym)}</p>
                  <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>de {formatCurrency(goal.targetAmount, sym)}</p>
                </div>

                <div className={`h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                    className="h-full rounded-full" style={{ backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between mt-3 text-xs">
                  <span className={isDark ? 'text-white/40' : 'text-slate-400'}>{pct.toFixed(0)}% concluída</span>
                  <span className={isDark ? 'text-white/40' : 'text-slate-400'}>Faltam {formatCurrency(remaining, sym)}</span>
                </div>

                {deadlineDays !== null && (
                  <p className={`text-xs mt-1 ${deadlineDays < 0 ? 'text-red-500' : isDark ? 'text-white/30' : 'text-slate-300'}`}>
                    {deadlineDays < 0 ? `Prazo expirado há ${Math.abs(deadlineDays)} dias` : `${deadlineDays} dias restantes`}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader><DialogTitle>{editGoal ? 'Editar' : 'Nova'} Meta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juntar R$ 5.000" className="mt-1" /></div>
            <div><Label>Valor alvo ({sym})</Label><Input type="number" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} className="mt-1" /></div>
            <div><Label>Valor atual ({sym})</Label><Input type="number" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} className="mt-1" /></div>
            <div><Label>Prazo</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl">Salvar</Button>
              {editGoal && <Button variant="destructive" className="rounded-xl" onClick={() => { deleteGoal(editGoal.id); setShowForm(false); }}><Trash2 className="w-4 h-4" /></Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}