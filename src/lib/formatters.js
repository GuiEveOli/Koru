export function formatCurrency(value, symbol = 'R$') {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${symbol} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const CATEGORY_ICONS = [
  '🍔', '🚗', '🏠', '💡', '🎮', '💊', '🛍', '💰', '📈', '📚',
  '🎬', '🏋️', '✈️', '🎵', '☕', '🍕', '🎁', '📱', '💻', '🐶',
  '👶', '💇', '🧹', '🔧', '🏦', '💳', '🎓', '⛽', '🅿️', '🍺',
];

export const ACCOUNT_ICONS = ['💳', '🏦', '💰', '📱', '💵', '🪙', '🏧', '💎'];

export const COLORS = [
  '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  '#14b8a6', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
];