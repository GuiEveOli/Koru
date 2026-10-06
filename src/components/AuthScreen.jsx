import React, { useState } from 'react';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase || !isSupabaseConfigured) {
      setError('Configure o Supabase no arquivo .env.local antes de entrar.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Cadastro realizado. Verifique seu e-mail para confirmar a conta.');
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');
    if (!supabase || !email) {
      setError('Informe seu e-mail para redefinir a senha.');
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Enviamos um link de redefinição para seu e-mail.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500">
            <LockKeyhole className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Finanças Pessoais</h1>
          <p className="mt-2 text-sm text-white/60">
            {mode === 'login' ? 'Entre para acessar seus dados de qualquer lugar' : 'Crie sua conta para sincronizar seus dados'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white">E-mail</Label>
            <Input
              className="mt-1 border-white/10 bg-white/10 text-white placeholder:text-white/40"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
            />
          </div>
          <div>
            <Label className="text-white">Senha</Label>
            <Input
              className="mt-1 border-white/10 bg-white/10 text-white placeholder:text-white/40"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm text-emerald-300">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-500 py-6 hover:bg-emerald-600">
            {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          {mode === 'login' && (
            <button type="button" onClick={handleResetPassword} className="text-white/60 hover:text-white">
              Esqueci minha senha
            </button>
          )}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
            className="text-emerald-300 hover:text-emerald-200"
          >
            {mode === 'login' ? 'Ainda não tenho uma conta' : 'Já tenho uma conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
