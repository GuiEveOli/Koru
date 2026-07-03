const LOCAL_KEY = 'finance_app_data';
const FILE_NAME = 'koru_finance_data.json';

const defaultData = {
  pin: null,
  settings: { theme: 'light', currency: 'BRL', currencySymbol: 'R$', autoLockMinutes: 5, dashboardCards: ['balance', 'income', 'expenses', 'savings'] },
  accounts: [], categories: [], transactions: [], piggyBanks: [], goals: [], budgets: [], recurringTransactions: [], subscriptions: [], tags: [], notifications: [],
};

let cachedData = null;
let googleFileId = null; // Guarda o ID do arquivo no Google Drive
let initialized = false;
let accessToken = null; // Token obtido no login do Google

// Helpers locais
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...defaultData, ...JSON.parse(raw) } : null;
  } catch { return null; }
}

function saveLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

// Configura o token de acesso obtido via fluxo de Login do Google
export function setGoogleToken(token) {
  accessToken = token;
}

// Busca ou cria o arquivo JSON no Google Drive do usuário
async function fetchOrCreateDriveFile() {
  if (!accessToken) throw new Error("Usuário não autenticado no Google");

  // 1. Tenta buscar um arquivo já existente com o nome correto
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false&fields=files(id,name)`;
  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchResult = await response.json();

  if (searchResult.files && searchResult.files.length > 0) {
    googleFileId = searchResult.files[0].id;
    // Baixa o conteúdo do arquivo
    const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${googleFileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await contentResponse.json();
  } else {
    // 2. Se não existir, cria o arquivo inicial
    const metadata = { name: FILE_NAME, mimeType: 'application/json' };
    const initialContent = loadLocal() || { ...defaultData };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(initialContent)], { type: 'application/json' }));

    const createResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    });
    const createdFile = await createResponse.json();
    googleFileId = createdFile.id;
    return initialContent;
  }
}

export async function initDB() {
  try {
    if (accessToken) {
      const cloudData = await fetchOrCreateDriveFile();
      cachedData = { ...defaultData, ...cloudData };
    } else {
      cachedData = loadLocal() || { ...defaultData };
    }
  } catch (e) {
    console.error('Falha ao sincronizar com Google Drive, usando cache local:', e);
    cachedData = loadLocal() || { ...defaultData };
  }
  
  saveLocal(cachedData);
  initialized = true;
  window.dispatchEvent(new Event('db-updated'));
  return cachedData;
}

export function isDBReady() { return initialized; }
export function getDB() {
  if (!cachedData) cachedData = loadLocal() || { ...defaultData };
  return cachedData;
}

// Sincronização em background para o Drive
let syncPromise = Promise.resolve();
function syncToCloud(data) {
  if (!googleFileId || !accessToken) return;
  syncPromise = syncPromise.then(async () => {
    try {
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${googleFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error('Erro na sincronização com o Google Drive:', e);
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
  syncToCloud(cachedData);
}

export function exportDB() { return JSON.stringify(getDB(), null, 2); }
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