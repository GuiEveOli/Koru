import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, PiggyBank, Tags, BarChart3, Settings, Wallet, Target, ClipboardList, TrendingUp, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '@/lib/FinanceContext';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/monthly', icon: CalendarDays, label: 'Mensal' },
  { path: '/piggy-banks', icon: PiggyBank, label: 'Cofrinho' },
  { path: '/categories', icon: Tags, label: 'Categorias' },
  { path: '/recurring', icon: Repeat, label: 'Recorrentes' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

const sidebarItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/monthly', icon: CalendarDays, label: 'Visão Mensal' },
  { path: '/transactions', icon: ClipboardList, label: 'Movimentações' },
  { path: '/accounts', icon: Wallet, label: 'Contas' },
  { path: '/piggy-banks', icon: PiggyBank, label: 'Cofrinhos' },
  { path: '/categories', icon: Tags, label: 'Categorias' },
  { path: '/recurring', icon: Repeat, label: 'Recorrentes' },
  { path: '/goals', icon: Target, label: 'Metas' },
  { path: '/statistics', icon: BarChart3, label: 'Estatísticas' },
  { path: '/planning', icon: TrendingUp, label: 'Planejamento' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
];

export default function AppLayout() {
  const location = useLocation();
  const { data } = useFinance();
  const isDark = data.settings.theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-40">
        <div className={`h-full flex flex-col ${isDark ? 'bg-slate-900/80 border-r border-white/5' : 'bg-white/80 border-r border-slate-200/50'} backdrop-blur-xl`}>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Finanças</h1>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Controle Pessoal</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1">
            {sidebarItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      : isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pb-24 lg:pb-6">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${isDark ? 'bg-slate-900/90 border-t border-white/5' : 'bg-white/90 border-t border-slate-200/50'} backdrop-blur-xl`}>
        <div className="flex items-center justify-around px-2 py-2 safe-bottom">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 py-1 px-3 relative"
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 w-8 h-1 rounded-full bg-emerald-500"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-emerald-500' : isDark ? 'text-white/40' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-emerald-500' : isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}