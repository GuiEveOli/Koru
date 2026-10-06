import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import React, { useState, useEffect, useCallback } from 'react';
import { FinanceProvider } from '@/lib/FinanceContext';
import { getDB, updateDB, initDB } from '@/lib/db';
import { seedDefaultData } from '@/lib/seedData';
import PinLock from '@/components/PinLock';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import MonthlyView from '@/pages/MonthlyView';
import PiggyBanks from '@/pages/PiggyBanks';
import Categories from '@/pages/Categories';
import Transactions from '@/pages/Transactions';
import Accounts from '@/pages/Accounts';
import Goals from '@/pages/Goals';
import Statistics from '@/pages/Statistics';
import Planning from '@/pages/Planning';
import SettingsPage from '@/pages/SettingsPage';
import Recurring from '@/pages/Recurring';
import AuthScreen from '@/components/AuthScreen';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const FinanceApp = () => {
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [user, setUser] = useState(isSupabaseConfigured ? null : { local: true });
  const [unlocked, setUnlocked] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [existingPin, setExistingPin] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user || null);
        setAuthReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setAuthReady(true);
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setDbReady(false);
      setUnlocked(false);
      return;
    }

    let mounted = true;
    initDB().then(() => {
      if (mounted) {
        setExistingPin(getDB().pin);
        setDbReady(true);
      }
    });
    return () => { mounted = false; };
  }, [authReady, user]);

  const handleUnlock = useCallback((newPin) => {
    if (newPin) {
      updateDB(d => ({ ...d, pin: newPin }));
      seedDefaultData();
    }
    setUnlocked(true);
  }, []);

  // Auto-lock after inactivity
  useEffect(() => {
    if (!unlocked) return;
    let timeout;
    const data = getDB();
    const minutes = data.settings?.autoLockMinutes || 5;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setUnlocked(false);
        setExistingPin(getDB().pin);
      }, minutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [unlocked]);

  if (!dbReady) {
    if (authReady && !user) return <AuthScreen />;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return <PinLock onUnlock={handleUnlock} existingPin={existingPin} />;
  }

  return (
    <FinanceProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monthly" element={<MonthlyView />} />
          <Route path="/piggy-banks" element={<PiggyBanks />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </FinanceProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <FinanceApp />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App