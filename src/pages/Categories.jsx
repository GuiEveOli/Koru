import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, CATEGORY_ICONS, COLORS } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Categories() {
  const { data, addCategory, updateCategory, deleteCategory } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🍔', color: '#10b981', type: 'expense' });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const categoryTotals = useMemo(() => {
    const map = {};
    data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .forEach(t => {
        if (t.categoryId) {
          map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
        }
      });
    return map;
  }, [data.transactions, year, month]);

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editCat) {
      updateCategory(editCat.id, form);
    } else {
      addCategory(form);
    }
    setShowForm(false);
    setEditCat(null);
    setForm({ name: '', icon: '🍔', color: '#10b981', type: 'expense' });
  };

  const incomeCategories = data.categories.filter(c => c.type === 'income');
  const expenseCategories = data.categories.filter(c => c.type === 'expense');

  const renderCategory = (cat, i) => (
    <motion.div
      key={cat.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className={`flex items-center gap-3 p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white border border-slate-100'}`}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + '20' }}>
        {cat.icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{cat.name}</p>
        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
          Este mês: {formatCurrency(categoryTotals[cat.id] || 0, sym)}
        </p>
      </div>
      <button onClick={() => openEdit(cat)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
        <Edit2 className="w-4 h-4" />
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => { setEditCat(null); setForm({ name: '', icon: '🍔', color: '#10b981', type: 'expense' }); setShowForm(true); }} size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-1" /> Nova
        </Button>
      </div>

      {expenseCategories.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Despesas</h3>
          <div className="space-y-2">
            {expenseCategories.map((c, i) => renderCategory(c, i))}
          </div>
        </div>
      )}

      {incomeCategories.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Receitas</h3>
          <div className="space-y-2">
            {incomeCategories.map((c, i) => renderCategory(c, i))}
          </div>
        </div>
      )}

      {data.categories.length === 0 && (
        <div className="text-center py-16">
          <p className={`${isDark ? 'text-white/40' : 'text-slate-400'}`}>Nenhuma categoria. Crie a primeira!</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader>
            <DialogTitle>{editCat ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alimentação" className="mt-1" />
            </div>
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-2 mt-2">
                {['expense', 'income'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      form.type === t
                        ? t === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'
                    }`}
                  >{t === 'expense' ? 'Despesa' : 'Receita'}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORY_ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      form.icon === icon ? 'bg-emerald-100 dark:bg-emerald-500/20 ring-2 ring-emerald-500' : isDark ? 'bg-white/5' : 'bg-slate-100'
                    }`}
                  >{icon}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl">Salvar</Button>
              {editCat && (
                <Button variant="destructive" className="rounded-xl" onClick={() => { deleteCategory(editCat.id); setShowForm(false); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}