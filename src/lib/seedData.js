import { getDB, updateDB, generateId } from '@/lib/db';

export function seedDefaultData() {
  const data = getDB();
  
  // Only seed if no categories exist yet
  if (data.categories.length > 0) return;

  const categories = [
    { name: 'Alimentação', icon: '🍔', color: '#f97316', type: 'expense' },
    { name: 'Transporte', icon: '🚗', color: '#3b82f6', type: 'expense' },
    { name: 'Moradia', icon: '🏠', color: '#8b5cf6', type: 'expense' },
    { name: 'Contas', icon: '💡', color: '#f59e0b', type: 'expense' },
    { name: 'Lazer', icon: '🎮', color: '#ec4899', type: 'expense' },
    { name: 'Saúde', icon: '💊', color: '#ef4444', type: 'expense' },
    { name: 'Compras', icon: '🛍', color: '#14b8a6', type: 'expense' },
    { name: 'Educação', icon: '📚', color: '#6366f1', type: 'expense' },
    { name: 'Assinaturas', icon: '📱', color: '#a855f7', type: 'expense' },
    { name: 'Salário', icon: '💰', color: '#10b981', type: 'income' },
    { name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income' },
    { name: 'Investimentos', icon: '📈', color: '#0ea5e9', type: 'income' },
    { name: 'Outros', icon: '📦', color: '#94a3b8', type: 'expense' },
  ].map(c => ({ ...c, id: generateId() }));

  const accounts = [
    { name: 'Carteira', icon: '💰', color: '#10b981', initialBalance: 0 },
    { name: 'Banco', icon: '🏦', color: '#3b82f6', initialBalance: 0 },
  ].map(a => ({ ...a, id: generateId() }));

  updateDB(d => ({
    ...d,
    categories,
    accounts,
  }));
}