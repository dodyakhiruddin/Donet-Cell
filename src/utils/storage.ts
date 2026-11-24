import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AppState,
  Customer,
  InventoryItem,
  OrderItem,
  UserAccount,
  WalletAccount,
} from '../types/ipos';

export const DB_LIST_STORAGE_KEY = 'donet_cell_ipos5_db_list';
export const ACTIVE_DB_STORAGE_KEY = 'donet_cell_ipos5_active_db';
export const LOCAL_STATE_BACKUP_PREFIX = 'donet_cell_ipos5_state_v1_';
export const SUPABASE_CONFIG_BACKUP_KEY = 'donet_cell_ipos5_sb_cfg';
const DB_NAME = 'DonetCell_iPos5_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_store';

export function getDefaultUsersSeed(): UserAccount[] {
  return [
    { username: 'admin', password: 'admin', role: 'ADMIN', location: 'UTM' },
    { username: 'kasir', password: 'kasir', role: 'KASIR', location: 'KSR1' },
  ];
}

export function getDefaultWalletListSeed(): WalletAccount[] {
  return [
    {
      id: 'KAS_TOKO',
      name: 'Kas Tunai Laci Toko',
      type: 'TUNAI',
      color: 'emerald',
      desc: 'Sumber dana uang fisik tunai di laci kasir.',
    },
    {
      id: 'SALDO_BRILINK',
      name: 'Rekening Agen BRILink',
      type: 'BANK',
      color: 'blue',
      desc: 'Sumber dana transfer bank, QRIS & tarik tunai.',
    },
    {
      id: 'SALDO_PULSA',
      name: 'Deposit Server Pulsa & PPOB',
      type: 'SERVER',
      color: 'purple',
      desc: 'Sumber dana pengisian pulsa, kuota, token PLN & e-wallet.',
    },
  ];
}

export function getDefaultCategoriesSeed(): string[] {
  return ['Voucher Fisik', 'Kartu Perdana', 'Aksesoris HP', 'Jasa Servis'];
}

export function createDefaultState(dbLabel = 'GROSIRDONET'): AppState {
  const now = new Date();
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return {
    settings: {
      storeName: `DONET CELL [${dbLabel}]`,
      storeAddress: 'Jl. Raya Utama No. 88 - Agen Resmi BRILink & Grosir Voucher',
      storePhone: '0812-3456-7890',
      storeWebsite: 'www.donetcell.id',
      storeFooter: 'Terima Kasih Telah Bertransaksi di DONET CELL. Simpan Struk Sebagai Bukti Sah.',
      supabaseUrl: '',
      supabaseKey: '',
      printerType: 'STANDARD',
      paperSize: 'A4',
      bluetoothWidth: '58mm',
    },
    categories: getDefaultCategoriesSeed(),
    users: getDefaultUsersSeed(),
    wallets: {
      KAS_TOKO: 8500000,
      SALDO_BRILINK: 15250000,
      SALDO_PULSA: 4320000,
    },
    walletList: getDefaultWalletListSeed(),
    items: [
      { code: 'VCR-ZERO-ALL', name: 'Voucher Zero / Kosong All Operator', category: 'Voucher Fisik', unit: 'PCS', stock: 100, cost: 1000, price: 2000, wholesalePrice: 1500 },
      { code: 'VCR-TRI-10G2H', name: 'Voucher Three 10GB 2 Hari', category: 'Voucher Fisik', unit: 'PCS', stock: 20, cost: 19500, price: 23000, wholesalePrice: 21500 },
      { code: 'VCR-TSEL-3', name: 'Voucher Telkomsel 3GB / 5 Hari', category: 'Voucher Fisik', unit: 'PCS', stock: 45, cost: 11500, price: 14000, wholesalePrice: 12500 },
      { code: 'VCR-TSEL-7', name: 'Voucher Telkomsel 7GB / 7 Hari', category: 'Voucher Fisik', unit: 'PCS', stock: 30, cost: 21500, price: 25000, wholesalePrice: 23000 },
      { code: 'VCR-ISAT-5', name: 'Voucher Indosat Freedom 5GB', category: 'Voucher Fisik', unit: 'PCS', stock: 28, cost: 15000, price: 18000, wholesalePrice: 16500 },
      { code: 'VCR-XL-4', name: 'Voucher XL Xtra Combo 4.5GB', category: 'Voucher Fisik', unit: 'PCS', stock: 22, cost: 16500, price: 20000, wholesalePrice: 18000 },
      { code: 'PRD-TSEL-0', name: 'Kartu Perdana Telkomsel Segel 3GB', category: 'Kartu Perdana', unit: 'PCS', stock: 18, cost: 14000, price: 18000, wholesalePrice: 16000 },
      { code: 'PRD-BYU-0', name: 'Kartu Perdana by.U Kuota 3GB', category: 'Kartu Perdana', unit: 'PCS', stock: 15, cost: 12000, price: 15000, wholesalePrice: 13500 },
      { code: 'AKS-KBL-C', name: 'Kabel Data Fast Charging Type-C 1M', category: 'Aksesoris HP', unit: 'PCS', stock: 25, cost: 12000, price: 25000, wholesalePrice: 18000 },
      { code: 'AKS-CHG-20', name: 'Kepala Charger 20W PD Original OEM', category: 'Aksesoris HP', unit: 'PCS', stock: 12, cost: 35000, price: 55000, wholesalePrice: 45000 },
      { code: 'AKS-TG-ALL', name: 'Tempered Glass Anti Spy All Type', category: 'Aksesoris HP', unit: 'PCS', stock: 40, cost: 6000, price: 15000, wholesalePrice: 10000 },
      { code: 'AKS-HF-01', name: 'Headset Handsfree Bass Stereo', category: 'Aksesoris HP', unit: 'PCS', stock: 20, cost: 10000, price: 20000, wholesalePrice: 15000 },
    ],
    voucherProductions: [],
    suppliers: [
      { code: 'SUP-001', name: 'PT. Mitra Telekomunikasi Indonesia', phone: '0811-2233-4455', address: 'Jl. Gatot Subroto Kav. 21', note: 'Distributor Resmi Telkomsel & By.U' },
      { code: 'SUP-002', name: 'CV. Multi Reload Nusantara', phone: '0812-8899-0011', address: 'Ruko Mega Grosir Blok B4', note: 'Server Pulsa, Kuota & Voucher All Operator' },
      { code: 'SUP-003', name: 'Grosir Aksesoris Pusat Jaya', phone: '0819-7766-5544', address: 'ITC Roxy Mas Lt. 2', note: 'Kabel Data, Charger & Tempered Glass' },
    ],
    customers: [
      { code: 'PLG-001', name: 'UMUM (Pelanggan Retail)', group: 'UMUM', phone: '-', address: 'Transaksi Langsung Konter' },
      { code: 'PLG-002', name: 'Berkah Cell (Reseller)', group: 'RESELLER', phone: '0812-3456-7890', address: 'Jl. Melati No. 10' },
      { code: 'PLG-003', name: 'Bpk. H. Sulaiman', group: 'VIP', phone: '0813-9988-7766', address: 'Perum Griya Asri - Langganan Transfer BRI' },
    ],
    serviceTickets: [
      {
        id: 'SRV-20261122-001',
        date: now.toISOString(),
        customer: 'Bpk. Hendra',
        phone: '0812-4455-6677',
        device: 'Samsung Galaxy A52',
        issue: 'Ganti LCD OLED & Tempered Glass',
        sparepartCode: '',
        sparepartQty: 0,
        cost: 0,
        price: 0,
        destWallet: '',
        status: 'PROSES',
      },
    ],
    debtsReceivables: [
      {
        id: 'PIU-20261123-001',
        type: 'PIUTANG',
        date: now.toISOString(),
        dueDate: sevenDaysLater,
        party: 'Berkah Cell (Reseller)',
        description: 'Kasbon Voucher Telkomsel 3GB (5 PCS)',
        totalAmount: 62500,
        paidAmount: 0,
        status: 'BELUM_LUNAS',
        payments: [],
      },
    ],
    fundTransfers: [],
    purchaseOrders: [],
    purchaseRecords: [],
    purchaseReturns: [],
    salesOrders: [],
    salesReturns: [],
    transactions: [
      {
        id: 'TRX-20261123-001',
        date: now.toISOString(),
        module: 'BRILINK',
        description: 'Transfer BRI ke 0012-01-045821-50-9 (An. Siti Aminah)',
        customer: 'Pelanggan Umum',
        modal: 1500000,
        total: 1505000,
        profit: 5000,
        paymentMethod: 'KAS_TOKO',
        items: [{ name: 'Transfer Bank BRI (Rp 1.500.000 + Admin)', qty: 1, price: 1505000 }],
      },
    ],
    stockLedger: [
      {
        date: now.toISOString(),
        ref: 'SALDO-AWAL',
        code: 'VCR-TSEL-3',
        name: 'Voucher Telkomsel 3GB / 5 Hari',
        type: 'STOK AWAL',
        inQty: 45,
        outQty: 0,
        balance: 45,
      },
    ],
  };
}

export function normalizeAppState(raw: Partial<AppState> | null | undefined, dbLabel: string): AppState {
  const base = createDefaultState(dbLabel);
  if (!raw || typeof raw !== 'object') return base;
  const merged: AppState = {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? [...raw.categories] : base.categories,
    users: Array.isArray(raw.users) && raw.users.length > 0 ? [...raw.users] : base.users,
    walletList: Array.isArray(raw.walletList) && raw.walletList.length > 0 ? [...raw.walletList] : base.walletList,
    wallets: { ...base.wallets, ...(raw.wallets || {}) },
    items: Array.isArray(raw.items) ? [...raw.items] : base.items,
    voucherProductions: Array.isArray(raw.voucherProductions) ? raw.voucherProductions : [],
    suppliers: Array.isArray(raw.suppliers) ? raw.suppliers : base.suppliers,
    customers: Array.isArray(raw.customers) ? raw.customers : base.customers,
    serviceTickets: Array.isArray(raw.serviceTickets) ? raw.serviceTickets : [],
    debtsReceivables: Array.isArray(raw.debtsReceivables) ? raw.debtsReceivables : [],
    fundTransfers: Array.isArray(raw.fundTransfers) ? raw.fundTransfers : [],
    purchaseOrders: Array.isArray(raw.purchaseOrders) ? raw.purchaseOrders : [],
    purchaseRecords: Array.isArray(raw.purchaseRecords) ? raw.purchaseRecords : [],
    purchaseReturns: Array.isArray(raw.purchaseReturns) ? raw.purchaseReturns : [],
    salesOrders: Array.isArray(raw.salesOrders) ? raw.salesOrders : [],
    salesReturns: Array.isArray(raw.salesReturns) ? raw.salesReturns : [],
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
    stockLedger: Array.isArray(raw.stockLedger) ? raw.stockLedger : [],
  };

  merged.items.forEach((it) => {
    if (it.category && !merged.categories.includes(it.category)) {
      merged.categories.push(it.category);
    }
  });
  merged.walletList.forEach((w) => {
    if (merged.wallets[w.id] === undefined) {
      merged.wallets[w.id] = 0;
    }
  });
  return merged;
}

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function saveLocalBackupState(dbName: string, payload: AppState): void {
  try {
    localStorage.setItem(
      `${LOCAL_STATE_BACKUP_PREFIX}${dbName}`,
      JSON.stringify({ updatedAt: new Date().toISOString(), payload })
    );
    if (payload.settings?.supabaseUrl && payload.settings?.supabaseKey) {
      localStorage.setItem(
        SUPABASE_CONFIG_BACKUP_KEY,
        JSON.stringify({
          url: payload.settings.supabaseUrl,
          key: payload.settings.supabaseKey,
        })
      );
    }
  } catch {
    // Ignore localStorage quota exceeded; IndexedDB remains authoritative
  }
}

export function loadLocalBackupState(dbName: string): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STATE_BACKUP_PREFIX}${dbName}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return (parsed.payload || parsed) as Partial<AppState>;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadSavedSupabaseConfig(): { url: string; key: string } | null {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.url && parsed?.key) {
      return { url: String(parsed.url), key: String(parsed.key) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function discoverAllTenantDatabaseNames(): Promise<string[]> {
  const discovered = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LOCAL_STATE_BACKUP_PREFIX)) {
        const name = k.slice(LOCAL_STATE_BACKUP_PREFIX.length).trim();
        if (name) discovered.add(name);
      }
    }
  } catch {
    // ignore
  }
  try {
    const db = await openIndexedDB();
    const keys = await new Promise<IDBValidKey[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    keys.forEach((k) => {
      if (typeof k === 'string' && k.startsWith('tenant_')) {
        const name = k.slice('tenant_'.length).trim();
        if (name) discovered.add(name);
      }
    });
  } catch {
    // ignore
  }
  return Array.from(discovered);
}

export async function loadStateFromIndexedDBForDb(dbName: string): Promise<Partial<AppState> | null> {
  let idbData: Partial<AppState> | null = null;
  try {
    const db = await openIndexedDB();
    idbData = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`tenant_${dbName}`);
      req.onsuccess = () => resolve(req.result ? (req.result.payload as Partial<AppState>) : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    idbData = null;
  }

  if (idbData) {
    return idbData;
  }

  // Fallback otomatis ke mirror localStorage jika IndexedDB belum ada / baru update origin
  const localFallback = loadLocalBackupState(dbName);
  if (localFallback) {
    try {
      const normalized = normalizeAppState(localFallback, dbName);
      await saveStateToIndexedDBForDb(dbName, normalized);
    } catch {
      // ignore
    }
    return localFallback;
  }

  return null;
}

export async function saveStateToIndexedDBForDb(dbName: string, payload: AppState): Promise<void> {
  saveLocalBackupState(dbName, payload);
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id: `tenant_${dbName}`,
        schemaVersion: 2,
        payload,
        updatedAt: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB save warning:', e);
  }
}

export async function deleteStateFromIndexedDBForDb(dbName: string): Promise<void> {
  try {
    localStorage.removeItem(`${LOCAL_STATE_BACKUP_PREFIX}${dbName}`);
  } catch {
    // ignore
  }
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(`tenant_${dbName}`);
      tx.oncomplete = () => resolve();
    });
  } catch {
    // ignore
  }
}

export function createSupabaseClientSafe(url: string, key: string): SupabaseClient | null {
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export async function pushStateToSupabase(client: SupabaseClient, dbName: string, payload: AppState): Promise<boolean> {
  try {
    const { error } = await client.from('donet_cell_state').upsert({
      id: `tenant_${dbName}`,
      payload,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function pullStateFromSupabase(
  client: SupabaseClient,
  dbName: string
): Promise<Partial<AppState> | null> {
  try {
    const { data, error } = await client
      .from('donet_cell_state')
      .select('payload')
      .eq('id', `tenant_${dbName}`)
      .maybeSingle();
    if (error || !data || !data.payload) return null;
    return data.payload as Partial<AppState>;
  } catch {
    return null;
  }
}

export function formatNum(n: number | string | undefined): string {
  return Math.round(Number(n) || 0).toLocaleString('id-ID');
}

export function formatRp(n: number | string | undefined): string {
  return formatNum(n);
}

export function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInvoiceId(prefix = 'TRX'): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = String(Math.floor(100 + Math.random() * 900));
  return `${prefix}-${ymd}-${rnd}`;
}

export function getPhysicalStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter((i) => {
    const cat = (i.category || '').toLowerCase();
    return cat !== 'jasa servis' && cat !== 'jasa' && cat !== 'layanan';
  });
}

export function getTotalPhysicalStockAssetValue(items: InventoryItem[]): number {
  return getPhysicalStockItems(items).reduce(
    (sum, item) => sum + (Number(item.stock) || 0) * (Number(item.cost) || 0),
    0
  );
}

export function getWalletNameById(id: string | undefined, walletList: WalletAccount[]): string {
  if (!id) return '-';
  if (id === 'ASET_BARANG_FISIK' || id === 'ASET_VOUCHER') return 'Total Nilai Stok Barang Fisik';
  if (id === 'MODAL_LUAR' || id === 'MODAL_OWNER') return 'Setoran Modal Pemilik';
  if (id === 'PRIVE_OWNER') return 'Penarikan / Prive Pemilik';
  if (id === 'PIUTANG_TEMPO') return 'Tempo / Kasbon (Piutang)';
  if (id === 'UTANG_TEMPO') return 'Tempo / Hutang Supplier';
  if (id === 'POTONG_UTANG') return 'Potong Utang Supplier';
  if (id === 'POTONG_PIUTANG') return 'Potong Piutang Pelanggan';
  const found = walletList.find((w) => w.id === id);
  return found ? found.name : id;
}

export function normalizeOrderItems(rec: { items?: OrderItem[]; itemCode?: string; itemName?: string; qty?: number; cost?: number; total?: number }): OrderItem[] {
  if (Array.isArray(rec.items) && rec.items.length > 0) {
    return rec.items;
  }
  if (rec.itemCode) {
    const qty = Number(rec.qty) || 1;
    const cost = Number(rec.cost) || 0;
    return [
      {
        code: rec.itemCode,
        name: rec.itemName || rec.itemCode,
        qty,
        cost,
        subtotal: Number(rec.total) || qty * cost,
      },
    ];
  }
  return [];
}

export function getEffectiveItemPrice(item: InventoryItem, customerName: string, customers: Customer[]): number {
  const c = customers.find((x) => x.name === customerName);
  const grp = c ? c.group : 'UMUM';
  if (grp === 'RESELLER' || grp === 'VIP') {
    return Number(item.wholesalePrice) || Number(item.price) || 0;
  }
  return Number(item.price) || 0;
}

export type ImportActionStatus = 'ADD' | 'ADD_PRICE_VARIANT' | 'UPDATE' | 'SKIP';

export interface ImportEvaluationRow {
  item: InventoryItem;
  action: ImportActionStatus;
  reason: string;
}

export function evaluateImportItems(
  existingItems: InventoryItem[],
  importedItems: InventoryItem[],
  replaceExisting: boolean
): {
  rows: ImportEvaluationRow[];
  nextItems: InventoryItem[];
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  appliedItems: InventoryItem[];
} {
  const working: InventoryItem[] = replaceExisting
    ? []
    : existingItems.map((it) => ({ ...it }));
  const rows: ImportEvaluationRow[] = [];
  const appliedItems: InventoryItem[] = [];
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const isPriceOrCostChanged = (a: InventoryItem, b: InventoryItem) =>
    Number(a.cost || 0) !== Number(b.cost || 0) ||
    Number(a.price || 0) !== Number(b.price || 0) ||
    Number(a.wholesalePrice || a.price || 0) !== Number(b.wholesalePrice || b.price || 0);

  importedItems.forEach((rawImp) => {
    const imp: InventoryItem = {
      ...rawImp,
      code: rawImp.code.trim().toUpperCase(),
      name: rawImp.name.trim(),
      category: rawImp.category.trim() || 'Voucher Fisik',
      unit: rawImp.unit.trim().toUpperCase() || 'PCS',
      stock: Math.max(0, Number(rawImp.stock) || 0),
      cost: Math.max(0, Number(rawImp.cost) || 0),
      price: Math.max(0, Number(rawImp.price) || 0),
      wholesalePrice: Math.max(0, Number(rawImp.wholesalePrice || rawImp.price) || 0),
    };

    const idxCode = working.findIndex(
      (x) => x.code.trim().toUpperCase() === imp.code
    );
    const idxName = working.findIndex(
      (x) => x.name.trim().toLowerCase() === imp.name.toLowerCase()
    );

    if (idxCode >= 0) {
      const existing = working[idxCode];
      if (!isPriceOrCostChanged(existing, imp)) {
        skippedCount++;
        rows.push({
          item: imp,
          action: 'SKIP',
          reason: 'Duplikat Kode & Modal/Harga sama',
        });
      } else {
        const updatedItem: InventoryItem = {
          ...imp,
          stock: imp.stock > 0 ? imp.stock : existing.stock,
        };
        working[idxCode] = updatedItem;
        updatedCount++;
        appliedItems.push(updatedItem);
        rows.push({
          item: updatedItem,
          action: 'UPDATE',
          reason: 'Update Modal / Harga Jual',
        });
      }
      return;
    }

    if (idxName >= 0) {
      const existing = working[idxName];
      if (!isPriceOrCostChanged(existing, imp)) {
        skippedCount++;
        rows.push({
          item: imp,
          action: 'SKIP',
          reason: 'Duplikat Nama & Modal/Harga sama',
        });
      } else {
        working.unshift(imp);
        addedCount++;
        appliedItems.push(imp);
        rows.push({
          item: imp,
          action: 'ADD_PRICE_VARIANT',
          reason: 'Nama sama, Modal/Harga berbeda (Masuk)',
        });
      }
      return;
    }

    working.unshift(imp);
    addedCount++;
    appliedItems.push(imp);
    rows.push({
      item: imp,
      action: 'ADD',
      reason: 'Barang Baru',
    });
  });

  return {
    rows,
    nextItems: working,
    addedCount,
    updatedCount,
    skippedCount,
    appliedItems,
  };
}
