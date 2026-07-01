import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PiggyBank, Minus, History, X, Trash2 } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { formatCurrency, COLORS } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const PIGGY_ICONS = ['🐷', '✈️', '🚗', '🏠', '💻', '🎮', '📱', '💎', '🏖️', '🎓', '💰', '🎁'];

export default function PiggyBanks() {
  const { data, addPiggyBank, updatePiggyBank, deletePiggyBank, addPiggyBankEntry } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const sym = data.settings.currencySymbol;

  const [showForm, setShowForm] = useState(false);
  const [editPB, setEditPB] = useState(null);
  const [selectedPB, setSelectedPB] = useState(null);
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [entryType, setEntryType] = useState('deposit');

  const [form, setForm] = useState({ name: '', icon: '🐷', color: '#10b981', goal: '' });

  const totalSaved = data.piggyBanks.reduce((s, p) => s + (p.current || 0), 0);

  const handleSave = () => {
    if (!form.name) return;
    const pbData = { ...form, goal: parseFloat(form.goal) || 0, current: editPB ? editPB.current : 0 };
    if (editPB) {
      updatePiggyBank(editPB.id, pbData);
    } else {
      addPiggyBank(pbData);
    }
    setShowForm(false);
    setEditPB(null);
    setForm({ name: '', icon: '🐷', color: '#10b981', goal: '' });
  };

  const handleEntry = () => {
    if (!entryAmount || !selectedPB) return;
    addPiggyBankEntry(selectedPB.id, {
      type: entryType,
      amount: parseFloat(entryAmount),
      note: entryNote,
    });
    setEntryAmount('');
    setEntryNote('');
    // Refresh selectedPB
    setTimeout(() => {
      const updated = data.piggyBanks.find(p => p.id === selectedPB.id);
      if (updated) setSelectedPB(updated);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cofrinhos</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            Total guardado: <span className="font-semibold text-emerald-500">{formatCurrency(totalSaved, sym)}</span>
          </p>
        </div>
        <Button onClick={() => { setEditPB(null); setForm({ name: '', icon: '🐷', color: '#10b981', goal: '' }); setShowForm(true); }} size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      {data.piggyBanks.length === 0 ? (
        <div className="text-center py-16">
          <PiggyBank className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-slate-200'}`} />
          <p className={`${isDark ? 'text-white/40' : 'text-slate-400'}`}>Crie seu primeiro cofrinho</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.piggyBanks.map((pb, i) => {
            const pct = pb.goal > 0 ? Math.min((pb.current / pb.goal) * 100, 100) : 0;
            return (
              <motion.div
                key={pb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPB(pb)}
                className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border border-white/5 hover:bg-white/10' : 'bg-white border border-slate-100 hover:shadow-md'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: pb.color + '20' }}>
                    {pb.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{pb.name}</h3>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      Meta: {formatCurrency(pb.goal, sym)}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setEditPB(pb); setForm({ name: pb.name, icon: pb.icon, color: pb.color, goal: String(pb.goal) }); setShowForm(true); }}>
                    <span className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-300'}`}>✏️</span>
                  </button>
                </div>
                <p className="text-xl font-bold mb-2" style={{ color: pb.color }}>{formatCurrency(pb.current || 0, sym)}</p>
                <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: pb.color }}
                  />
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{pct.toFixed(0)}% da meta</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader>
            <DialogTitle>{editPB ? 'Editar' : 'Novo'} Cofrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Viagem" className="mt-1" />
            </div>
            <div>
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PIGGY_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(f => ({ ...f, icon }))}
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
            <div>
              <Label>Meta ({sym})</Label>
              <Input type="number" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="0,00" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl">Salvar</Button>
              {editPB && (
                <Button variant="destructive" className="rounded-xl" onClick={() => { deletePiggyBank(editPB.id); setShowForm(false); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Piggy Bank Detail */}
      <Dialog open={!!selectedPB} onOpenChange={(open) => { if (!open) setSelectedPB(null); }}>
        <DialogContent className={`rounded-2xl max-h-[80vh] overflow-y-auto ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          {selectedPB && (() => {
            const current = data.piggyBanks.find(p => p.id === selectedPB.id) || selectedPB;
            const pct = current.goal > 0 ? Math.min((current.current / current.goal) * 100, 100) : 0;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{current.icon}</span> {current.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: current.color }}>{formatCurrency(current.current || 0, sym)}</p>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>de {formatCurrency(current.goal, sym)}</p>
                    <div className={`h-3 rounded-full mt-3 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: current.color }} />
                    </div>
                    <p className="text-sm font-medium mt-1">{pct.toFixed(0)}%</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEntryType('deposit')}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${entryType === 'deposit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}
                    >+ Depositar</button>
                    <button
                      onClick={() => setEntryType('withdraw')}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${entryType === 'withdraw' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}
                    >- Retirar</button>
                  </div>

                  <div className="flex gap-2">
                    <Input type="number" placeholder="Valor" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} className="flex-1" />
                    <Input placeholder="Obs." value={entryNote} onChange={e => setEntryNote(e.target.value)} className="flex-1" />
                    <Button onClick={handleEntry} size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">OK</Button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><History className="w-4 h-4" /> Histórico</h4>
                    {(current.history || []).length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Nenhum registro</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...(current.history || [])].reverse().map(h => (
                          <div key={h.id} className="flex items-center justify-between text-sm">
                            <div>
                              <span className={h.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}>
                                {h.type === 'deposit' ? '+' : '-'}{formatCurrency(h.amount, sym)}
                              </span>
                              {h.note && <span className={`ml-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{h.note}</span>}
                            </div>
                            <span className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-300'}`}>
                              {new Date(h.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}