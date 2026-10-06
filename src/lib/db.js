import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LOCAL_KEY = 'finance_app_data';
const DATA_TABLE = 'finance_data';

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
let initialized = false;
let remoteUserId = null;
let syncPromise = Promise.resolve();

function cloneDefaultData() {
  return {
    ...defaultData,
    settings: { ...defaultData.settings },
  };
}

function mergeData(data) {
  const parsedData = data && typeof data === 'object' ? data : {};
  return {
    ...cloneDefaultData(),
    ...parsedData,
    settings: { ...defaultData.settings, ...(parsedData.settings || {}) },
  };
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? mergeData(JSON.parse(raw)) : null;
  } catch (error) {
    console.error('Não foi possível ler o cache local:', error);
    return null;
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Não foi possível salvar o cache local:', error);
  }
}

function notifyUpdate() {
  window.dispatchEvent(new Event('db-updated'));
}

async function getSupabaseUser() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) {
    throw new Error('Sessão do Supabase não encontrada.');
  }
  return userData.user;
}

async function loadRemoteData(localData) {
  if (!isSupabaseConfigured || !supabase) return null;

  const user = await getSupabaseUser();
  remoteUserId = user.id;

  const { data: record, error } = await supabase
    .from(DATA_TABLE)
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (record) {
    return mergeData(record.data);
  }

  const initialData = localData || cloneDefaultData();
  const { error: insertError } = await supabase
    .from(DATA_TABLE)
    .upsert({ user_id: user.id, data: initialData }, { onConflict: 'user_id' });

  if (insertError) throw insertError;
  return initialData;
}

function syncToSupabase(data) {
  if (!supabase || !remoteUserId) return;

  syncPromise = syncPromise
    .then(async () => {
      const { error } = await supabase
        .from(DATA_TABLE)
        .upsert({ user_id: remoteUserId, data }, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }
    })
    .catch((error) => {
      console.error('Erro ao sincronizar dados com o Supabase:', error);
    });
}

export async function initDB() {
  const localData = loadLocal();

  if (!isSupabaseConfigured) {
    console.warn(
      'Supabase não configurado. Usando armazenamento local; defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar a nuvem.',
    );
    cachedData = localData || cloneDefaultData();
  } else {
    try {
      cachedData = await loadRemoteData(localData);
    } catch (error) {
      console.error('Falha ao carregar o Supabase. Usando o cache local:', error);
      cachedData = localData || cloneDefaultData();
    }
  }

  cachedData = mergeData(cachedData);
  saveLocal(cachedData);
  initialized = true;
  notifyUpdate();
  return cachedData;
}

export function isDBReady() {
  return initialized;
}

export function getDB() {
  if (!cachedData) cachedData = loadLocal() || cloneDefaultData();
  return cachedData;
}

export function updateDB(updater) {
  const current = getDB();
  const updated = typeof updater === 'function'
    ? updater(current)
    : { ...current, ...updater };

  cachedData = mergeData(updated);
  saveLocal(cachedData);
  notifyUpdate();
  syncToSupabase(cachedData);
  return cachedData;
}

export async function resetDB() {
  cachedData = cloneDefaultData();
  saveLocal(cachedData);
  notifyUpdate();
  syncToSupabase(cachedData);
}

export function exportDB() {
  return JSON.stringify(getDB(), null, 2);
}

export function importDB(jsonString) {
  const data = JSON.parse(jsonString);
  cachedData = mergeData(data);
  saveLocal(cachedData);
  notifyUpdate();
  syncToSupabase(cachedData);
}

export function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`;
}
