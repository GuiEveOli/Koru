import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '@/lib/FinanceContext';
import { MONTH_NAMES } from '@/lib/formatters';

export default function DashboardChart() {
  const { data } = useFinance();
  const isDark = data.settings.theme === 'dark';

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const txs = data.transactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });
      months.push({
        name: MONTH_NAMES[m].substring(0, 3),
        receitas: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        despesas: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [data.transactions]);

  return (
    <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
      <h3 className="font-semibold mb-4">Receitas x Despesas</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#ffffff60' : '#64748b' }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: 'none',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                color: isDark ? '#fff' : '#000',
              }}
              formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
            />
            <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}