import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Plus, Edit2, Copy, Trash2, Filter } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import TransactionModal from '@/components/TransactionModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function Transactions() {
  const { data, deleteTransaction, addTransaction } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const filtered = useMemo(() => {
    let txs = [...data.transactions];

    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(t => t.description?.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') txs = txs.filter(t => t.type === typeFilter);
    if (categoryFilter !== 'all') txs = txs.filter(t => t.categoryId === categoryFilter);

    txs.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return txs;
  }, [data.transactions, search, typeFilter, categoryFilter, sortBy]);

  const handleDuplicate = (tx) => {
    const { id, createdAt, ...rest } = tx;
    addTransaction({ ...rest, date: new Date().toISOString().split('T')[0] });
    toast({ title: 'Movimentação duplicada' });
  };

  const handleDelete = (tx) => {
    deleteTransaction(tx.id);
    toast({ title: 'Movimentação excluída', description: 'Use Ctrl+Z para desfazer' });
  };

  const getTypeIcon = (type) => {
    if (type === 'income') return <ArrowUpCircle className="w-5 h-5 text-emerald-500" />;
    if (type === 'expense') return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    return <ArrowLeftRight className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimentações</h1>
        <button onClick={() => { setEditTx(null); setShowModal(true); }} className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar movimentações..."
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'income', 'expense', 'transfer'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === t ? 'bg-emerald-500 text-white' : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'income' ? 'Receitas' : t === 'expense' ? 'Despesas' : 'Transferências'}
            </button>
          ))}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Mais recente</SelectItem>
              <SelectItem value="date-asc">Mais antigo</SelectItem>
              <SelectItem value="amount-desc">Maior valor</SelectItem>
              <SelectItem value="amount-asc">Menor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className={`${isDark ? 'text-white/40' : 'text-slate-400'}`}>Nenhuma movimentação encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, i) => {
            const cat = data.categories.find(c => c.id === tx.categoryId);
            const acc = data.accounts.find(a => a.id === tx.accountId);
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(tx.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tx.description}</p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      {cat ? `${cat.icon} ${cat.name}` : ''}{acc ? ` · ${acc.icon} ${acc.name}` : ''} · {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                  </span>
                </div>
                <div className="flex gap-1 mt-3 justify-end">
                  <button onClick={() => { setEditTx(tx); setShowModal(true); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDuplicate(tx)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(tx)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <TransactionModal open={showModal} onClose={() => { setShowModal(false); setEditTx(null); }} editTransaction={editTx} />
    </div>
  );
}