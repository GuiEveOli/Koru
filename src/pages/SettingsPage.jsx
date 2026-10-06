import React, { useState, useRef } from 'react';
import { Moon, Sun, Download, Upload, Trash2, Lock, Info } from 'lucide-react';
import { useFinance } from '@/lib/FinanceContext';
import { exportDB, importDB, resetDB } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { data, updateSettings, setPin } = useFinance();
  const isDark = data.settings.theme === 'dark';
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [showPinDialog, setShowPinDialog] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const handleExport = () => {
    const json = exportDB();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Backup exportado com sucesso!' });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importDB(ev.target.result);
        toast({ title: 'Dados importados com sucesso!' });
        window.location.reload();
      } catch {
        toast({ title: 'Erro ao importar', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetDB();
    toast({ title: 'Aplicativo resetado' });
    window.location.reload();
  };

  const handleChangePin = () => {
    if (newPin.length < 4) {
      toast({ title: 'PIN deve ter pelo menos 4 dígitos', variant: 'destructive' });
      return;
    }
    setPin(newPin);
    setShowPinDialog(false);
    setNewPin('');
    toast({ title: 'PIN alterado com sucesso!' });
  };

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Não foi possível sair', description: error.message, variant: 'destructive' });
    }
  };

  const cardClass = `p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Theme */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <p className="font-medium text-sm">Tema</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{isDark ? 'Escuro' : 'Claro'}</p>
            </div>

          </div>
          <button onClick={toggleTheme}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${isDark ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl">
          Sair da conta
        </Button>
      </div>

      {/* Currency */}
      <div className={cardClass}>
        <Label className="mb-2 block">Moeda</Label>
        <Select value={data.settings.currency} onValueChange={v => {
          const symbols = { BRL: 'R$', USD: '$', EUR: '€', GBP: '£' };
          updateSettings({ currency: v, currencySymbol: symbols[v] || v });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="BRL">R$ - Real Brasileiro</SelectItem>
            <SelectItem value="USD">$ - Dólar</SelectItem>
            <SelectItem value="EUR">€ - Euro</SelectItem>
            <SelectItem value="GBP">£ - Libra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PIN */}
      <div className={cardClass}>
        <button onClick={() => setShowPinDialog(true)} className="flex items-center gap-3 w-full">
          <Lock className="w-5 h-5" />
          <div className="text-left">
            <p className="font-medium text-sm">Alterar PIN</p>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Altere sua senha de acesso</p>
          </div>
        </button>
      </div>

      {/* Backup */}
      <div className={cardClass + ' space-y-3'}>
        <h3 className="font-semibold text-sm">Backup & Dados</h3>
        <Button onClick={handleExport} variant="outline" className="w-full rounded-xl justify-start gap-2">
          <Download className="w-4 h-4" /> Exportar backup (JSON)
        </Button>
        <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full rounded-xl justify-start gap-2">
          <Upload className="w-4 h-4" /> Importar backup (JSON)
        </Button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <Button onClick={() => setConfirmReset(true)} variant="destructive" className="w-full rounded-xl justify-start gap-2">
          <Trash2 className="w-4 h-4" /> Limpar todos os dados
        </Button>
      </div>

      {/* About */}
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5" />
          <div>
            <p className="font-medium text-sm">Finanças Pessoais</p>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Versão 1.0 · Todos os dados armazenados localmente</p>
          </div>
        </div>
      </div>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader><DialogTitle>Alterar PIN</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Novo PIN (4-6 dígitos)</Label>
              <Input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="mt-1" placeholder="••••••" />
            </div>
            <Button onClick={handleChangePin} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className={`rounded-2xl ${isDark ? 'bg-slate-900 text-white border-white/10' : ''}`}>
          <DialogHeader><DialogTitle>Limpar todos os dados?</DialogTitle></DialogHeader>
          <p className="text-sm text-red-500">Esta ação é irreversível. Todos os dados serão apagados permanentemente.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(false)} className="flex-1 rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={handleReset} className="flex-1 rounded-xl">Apagar tudo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}