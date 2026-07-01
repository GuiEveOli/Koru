import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'finance_app_data';

const defaultData = {
  pin: null,
  settings: {
    theme: 'light',
    currency: 'BRL',
    currencySymbol: 'R$',
    autoLockMinutes: 5,
    dashboardCards: ['balance', 'income', 'expenses', 'savings'],
  },
  accounts: [],
  categories: [],
  transactions: [],
  piggyBanks: [],
  goals: [],
  budgets: [],
  recurringTransactions: [],
  subscriptions: [],
  tags: [],
  notifications: [],
};

let cachedData = null;
let recordId = null;
let initialized = false;

// Local storage helpers (cache + offline fallback)
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

// Initialize from cloud — call after user is authenticated
export async function initDB() {
  try {
    const records = await base44.entities.FinanceData.filter({}, '-created_date', 1);
    if (records.length > 0) {
      recordId = records[0].id;
      const parsed = JSON.parse(records[0].data);
      cachedData = { ...defaultData, ...parsed };
    } else {
      // No cloud record yet — migrate from local storage if data exists
      const localData = loadLocal();
      if (localData && (localData.transactions.length > 0 || localData.accounts.length > 0 || localData.pin)) {
        cachedData = localData;
      } else {
        cachedData = { ...defaultData };
      }
      const created = await base44.entities.FinanceData.create({ data: JSON.stringify(cachedData) });
      recordId = created.id;
    }
  } catch (e) {
    console.error('Cloud load failed, using local cache:', e);
    cachedData = loadLocal() || { ...defaultData };
  }
  saveLocal(cachedData);
  initialized = true;
  window.dispatchEvent(new Event('db-updated'));
  return cachedData;
}

export function isDBReady() {
  return initialized;
}

export function getDB() {
  if (!cachedData) {
    cachedData = loadLocal() || { ...defaultData };
  }
  return cachedData;
}

// Background cloud sync (fire-and-forget)
let syncPromise = Promise.resolve();
function syncToCloud(data) {
  if (!recordId) return;
  syncPromise = syncPromise.then(async () => {
    try {
      await base44.entities.FinanceData.update(recordId, { data: JSON.stringify(data) });
    } catch (e) {
      console.error('Cloud sync failed:', e);
    }
  });
}

export function updateDB(updater) {
  const current = getDB();
  const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  cachedData = updated;
  saveLocal(updated);
  window.dispatchEvent(new Event('db-updated'));
  syncToCloud(updated);
  return updated;
}

export async function resetDB() {
  cachedData = { ...defaultData };
  saveLocal(cachedData);
  window.dispatchEvent(new Event('db-updated'));
  if (recordId) {
    try {
      await base44.entities.FinanceData.update(recordId, { data: JSON.stringify(cachedData) });
    } catch (e) {
      console.error('Cloud reset failed:', e);
    }
  }
}

export function exportDB() {
  return JSON.stringify(getDB(), null, 2);
}

export function importDB(jsonString) {
  const data = JSON.parse(jsonString);
  cachedData = { ...defaultData, ...data };
  saveLocal(cachedData);
  window.dispatchEvent(new Event('db-updated'));
  syncToCloud(cachedData);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}