import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDB, updateDB, generateId } from '@/lib/db';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [data, setData] = useState(getDB);
  const [undoStack, setUndoStack] = useState([]);

  useEffect(() => {
    const handler = () => setData(getDB());
    window.addEventListener('db-updated', handler);
    return () => window.removeEventListener('db-updated', handler);
  }, []);

  const update = useCallback((updater) => {
    setUndoStack(prev => [...prev.slice(-9), getDB()]);
    const result = updateDB(updater);
    setData(result);
    return result;
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    updateDB(() => prev);
    setData(prev);
    return true;
  }, [undoStack]);

  // Transaction helpers
  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
    update(d => ({ ...d, transactions: [...d.transactions, newTx] }));
    return newTx;
  }, [update]);

  const updateTransaction = useCallback((id, changes) => {
    update(d => ({
      ...d,
      transactions: d.transactions.map(t => t.id === id ? { ...t, ...changes } : t)
    }));
  }, [update]);

  const deleteTransaction = useCallback((id) => {
    update(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) }));
  }, [update]);

  // Account helpers
  const addAccount = useCallback((acc) => {
    const newAcc = { ...acc, id: generateId() };
    update(d => ({ ...d, accounts: [...d.accounts, newAcc] }));
    return newAcc;
  }, [update]);

  const updateAccount = useCallback((id, changes) => {
    update(d => ({
      ...d,
      accounts: d.accounts.map(a => a.id === id ? { ...a, ...changes } : a)
    }));
  }, [update]);

  const deleteAccount = useCallback((id) => {
    update(d => ({ ...d, accounts: d.accounts.filter(a => a.id !== id) }));
  }, [update]);

  // Category helpers
  const addCategory = useCallback((cat) => {
    const newCat = { ...cat, id: generateId() };
    update(d => ({ ...d, categories: [...d.categories, newCat] }));
    return newCat;
  }, [update]);

  const updateCategory = useCallback((id, changes) => {
    update(d => ({
      ...d,
      categories: d.categories.map(c => c.id === id ? { ...c, ...changes } : c)
    }));
  }, [update]);

  const deleteCategory = useCallback((id) => {
    update(d => ({ ...d, categories: d.categories.filter(c => c.id !== id) }));
  }, [update]);

  // Piggy bank helpers
  const addPiggyBank = useCallback((pb) => {
    const newPB = { ...pb, id: generateId(), history: [] };
    update(d => ({ ...d, piggyBanks: [...d.piggyBanks, newPB] }));
    return newPB;
  }, [update]);

  const updatePiggyBank = useCallback((id, changes) => {
    update(d => ({
      ...d,
      piggyBanks: d.piggyBanks.map(p => p.id === id ? { ...p, ...changes } : p)
    }));
  }, [update]);

  const deletePiggyBank = useCallback((id) => {
    update(d => ({ ...d, piggyBanks: d.piggyBanks.filter(p => p.id !== id) }));
  }, [update]);

  const addPiggyBankEntry = useCallback((pbId, entry) => {
    const newEntry = { ...entry, id: generateId(), date: new Date().toISOString() };
    update(d => ({
      ...d,
      piggyBanks: d.piggyBanks.map(p =>
        p.id === pbId
          ? { ...p, current: (p.current || 0) + (entry.type === 'deposit' ? entry.amount : -entry.amount), history: [...(p.history || []), newEntry] }
          : p
      )
    }));
  }, [update]);

  // Goal helpers
  const addGoal = useCallback((goal) => {
    const newGoal = { ...goal, id: generateId() };
    update(d => ({ ...d, goals: [...d.goals, newGoal] }));
    return newGoal;
  }, [update]);

  const updateGoal = useCallback((id, changes) => {
    update(d => ({
      ...d,
      goals: d.goals.map(g => g.id === id ? { ...g, ...changes } : g)
    }));
  }, [update]);

  const deleteGoal = useCallback((id) => {
    update(d => ({ ...d, goals: d.goals.filter(g => g.id !== id) }));
  }, [update]);

  // Budget helpers
  const setBudget = useCallback((month, categoryId, amount) => {
    update(d => {
      const key = `${month}-${categoryId}`;
      const existing = d.budgets.find(b => b.key === key);
      if (existing) {
        return { ...d, budgets: d.budgets.map(b => b.key === key ? { ...b, amount } : b) };
      }
      return { ...d, budgets: [...d.budgets, { key, month, categoryId, amount, id: generateId() }] };
    });
  }, [update]);

  // Settings
  const updateSettings = useCallback((changes) => {
    update(d => ({ ...d, settings: { ...d.settings, ...changes } }));
  }, [update]);

  const setPin = useCallback((pin) => {
    update(d => ({ ...d, pin }));
  }, [update]);

  // Recurring transaction helpers
  const addRecurring = useCallback((rt) => {
    const newRT = {
      ...rt,
      id: generateId(),
      active: true,
      lastPostedDate: null,
      nextDueDate: rt.startDate,
      createdAt: new Date().toISOString(),
    };
    update(d => ({ ...d, recurringTransactions: [...(d.recurringTransactions || []), newRT] }));
    return newRT;
  }, [update]);

  const updateRecurring = useCallback((id, changes) => {
    update(d => ({
      ...d,
      recurringTransactions: (d.recurringTransactions || []).map(r => r.id === id ? { ...r, ...changes } : r)
    }));
  }, [update]);

  const deleteRecurring = useCallback((id) => {
    update(d => ({ ...d, recurringTransactions: (d.recurringTransactions || []).filter(r => r.id !== id) }));
  }, [update]);

  // Installment purchase helper
  const addInstallmentPurchase = useCallback((txData, installmentCount) => {
    const groupId = generateId();
    const count = Math.max(2, parseInt(installmentCount) || 2);
    const totalAmount = parseFloat(txData.amount) || 0;
    const baseInstallment = Math.floor((totalAmount / count) * 100) / 100;
    const lastInstallment = parseFloat((totalAmount - baseInstallment * (count - 1)).toFixed(2));
    const baseDate = new Date(txData.date + 'T00:00:00');
    const newTxs = [];

    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + i);
      const dateStr = d.toISOString().split('T')[0];
      newTxs.push({
        ...txData,
        amount: i === count - 1 ? lastInstallment : baseInstallment,
        date: dateStr,
        description: `${txData.description} (${i + 1}/${count})`,
        installmentGroupId: groupId,
        installmentNumber: i + 1,
        installmentTotal: count,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }
    update(d => ({ ...d, transactions: [...d.transactions, ...newTxs] }));
    return { groupId, transactions: newTxs };
  }, [update]);

  const deleteInstallmentGroup = useCallback((groupId) => {
    update(d => ({ ...d, transactions: d.transactions.filter(t => t.installmentGroupId !== groupId) }));
  }, [update]);

  // Process due recurring transactions
  const processRecurring = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const db = getDB();
    const recurring = db.recurringTransactions || [];
    if (recurring.length === 0) return;

    let newTransactions = [...db.transactions];
    let updatedRecurring = [...recurring];
    let changed = false;

    updatedRecurring = updatedRecurring.map(rt => {
      if (!rt.active) return rt;
      let nextDue = new Date((rt.nextDueDate || rt.startDate) + 'T00:00:00');
      let lastPosted = rt.lastPostedDate;

      while (nextDue <= today) {
        if (rt.endDate && nextDue > new Date(rt.endDate + 'T00:00:00')) break;

        const dateStr = nextDue.toISOString().split('T')[0];
        newTransactions.push({
          type: rt.type,
          amount: rt.amount,
          description: rt.description,
          categoryId: rt.categoryId,
          accountId: rt.accountId,
          date: dateStr,
          time: '12:00',
          notes: rt.notes || '',
          paymentMethod: rt.paymentMethod || '',
          tags: rt.tags || [],
          recurringId: rt.id,
          id: generateId(),
          createdAt: new Date().toISOString(),
        });
        lastPosted = dateStr;
        changed = true;

        const next = new Date(nextDue);
        if (rt.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
        else if (rt.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
        else if (rt.frequency === 'weekly') next.setDate(next.getDate() + 7);
        nextDue = next;
      }

      return { ...rt, lastPostedDate: lastPosted, nextDueDate: nextDue.toISOString().split('T')[0] };
    });

    if (changed) {
      updateDB(d => ({ ...d, transactions: newTransactions, recurringTransactions: updatedRecurring }));
    }
  }, []);

  // Process recurring transactions on mount
  useEffect(() => {
    processRecurring();
  }, [processRecurring]);

  // Computed values
  const getMonthTransactions = useCallback((year, month) => {
    return data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [data.transactions]);

  const getAccountBalance = useCallback((accountId) => {
    return data.transactions
      .filter(t => t.accountId === accountId)
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        if (t.type === 'transfer') {
          if (t.accountId === accountId) return sum - t.amount;
          if (t.toAccountId === accountId) return sum + t.amount;
        }
        return sum;
      }, 0);
  }, [data.transactions]);

  const getTotalBalance = useCallback(() => {
    return data.accounts.reduce((sum, acc) => {
      const bal = data.transactions
        .reduce((s, t) => {
          if (t.accountId === acc.id) {
            if (t.type === 'income') return s + t.amount;
            if (t.type === 'expense') return s - t.amount;
            if (t.type === 'transfer') return s - t.amount;
          }
          if (t.type === 'transfer' && t.toAccountId === acc.id) return s + t.amount;
          return s;
        }, acc.initialBalance || 0);
      return sum + bal;
    }, 0);
  }, [data.accounts, data.transactions]);

  const value = {
    data, update, undo, undoStack,
    addTransaction, updateTransaction, deleteTransaction,
    addAccount, updateAccount, deleteAccount,
    addCategory, updateCategory, deleteCategory,
    addPiggyBank, updatePiggyBank, deletePiggyBank, addPiggyBankEntry,
    addGoal, updateGoal, deleteGoal,
    setBudget, updateSettings, setPin,
    addRecurring, updateRecurring, deleteRecurring,
    addInstallmentPurchase, deleteInstallmentGroup, processRecurring,
    getMonthTransactions, getAccountBalance, getTotalBalance,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}