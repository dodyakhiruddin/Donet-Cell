export type TabId =
  | 'dashboard'
  | 'masterdata'
  | 'pembelian'
  | 'kasir'
  | 'ppob'
  | 'servicehp'
  | 'cetakvoucher'
  | 'sumberdana'
  | 'utangpiutang'
  | 'akuntansi'
  | 'laporan'
  | 'petunjuk';

export type MasterSubTab = 'items' | 'suppliers' | 'customers' | 'kartustok';
export type PurchaseSubTab = 'po' | 'pembelian' | 'retur';
export type SalesSubTab = 'po' | 'penjualan' | 'retur';
export type PpobMode = 'pulsa' | 'transfer' | 'tarik' | 'ewallet';
export type SettingsTab = 'general' | 'users' | 'supabase' | 'backup';
export type OcrTargetMode = 'ppob' | 'pembelian' | 'pos';

export type PrinterMode = 'BLUETOOTH' | 'STANDARD';
export type StandardPaperSize = 'A4' | 'F4' | 'FOLIO';
export type BluetoothPaperWidth = '58mm' | '80mm';

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeWebsite: string;
  storeFooter: string;
  supabaseUrl: string;
  supabaseKey: string;
  printerType?: PrinterMode;
  paperSize?: StandardPaperSize;
  bluetoothWidth?: BluetoothPaperWidth;
}

export interface UserAccount {
  username: string;
  password: string;
  role: 'ADMIN' | 'KASIR';
  location: string;
}

export interface SessionUser {
  username: string;
  rawUsername: string;
  role: 'ADMIN' | 'KASIR';
  location: string;
}

export type WalletType = 'TUNAI' | 'BANK' | 'SERVER' | 'EWALLET';
export type WalletColor = 'emerald' | 'blue' | 'sky' | 'purple' | 'orange' | 'teal' | 'rose';

export interface WalletAccount {
  id: string;
  name: string;
  type: WalletType;
  color: WalletColor;
  desc: string;
}

export interface InventoryItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  cost: number;
  price: number;
  wholesalePrice: number;
}

export interface Supplier {
  code: string;
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface Customer {
  code: string;
  name: string;
  group: 'UMUM' | 'RESELLER' | 'VIP';
  phone: string;
  address: string;
}

export interface ServiceTicket {
  id: string;
  date: string;
  customer: string;
  phone: string;
  device: string;
  issue: string;
  sparepartCode: string;
  sparepartQty: number;
  cost: number;
  price: number;
  destWallet: string;
  status: 'PROSES' | 'SELESAI';
}

export interface DebtPayment {
  date: string;
  amount: number;
  wallet: string;
  note: string;
}

export interface DebtRecord {
  id: string;
  type: 'PIUTANG' | 'UTANG';
  date: string;
  dueDate: string;
  party: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  status: 'BELUM_LUNAS' | 'LUNAS';
  payments: DebtPayment[];
}

export interface FundTransfer {
  date: string;
  from: string;
  to: string;
  amount: number;
  note: string;
}

export interface OrderItem {
  code: string;
  name: string;
  qty: number;
  cost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  status: 'DIPESAN' | 'SELESAI' | 'BATAL';
  supplier: string;
  items: OrderItem[];
  qty: number;
  total: number;
  note: string;
  itemCode?: string;
  itemName?: string;
  cost?: number;
}

export interface PurchaseRecord {
  id: string;
  poRef: string;
  date: string;
  supplier: string;
  items: OrderItem[];
  qty: number;
  total: number;
  sourceWallet: string;
  dueDate: string;
  isTempo: boolean;
  itemCode?: string;
  itemName?: string;
  cost?: number;
}

export interface PurchaseReturn {
  id: string;
  date: string;
  supplier: string;
  itemCode: string;
  itemName: string;
  qty: number;
  cost: number;
  total: number;
  wallet: string;
  reason: string;
}

export interface SalesOrder {
  id: string;
  date: string;
  status: 'DIPESAN' | 'SELESAI' | 'BATAL';
  customer: string;
  items: OrderItem[];
  qty: number;
  total: number;
  note: string;
}

export interface SalesReturn {
  id: string;
  date: string;
  customer: string;
  itemCode: string;
  itemName: string;
  qty: number;
  price: number;
  total: number;
  wallet: string;
  reason: string;
}

export interface TransactionItem {
  code?: string;
  name: string;
  qty: number;
  price: number;
}

export interface TransactionRecord {
  id: string;
  soRef?: string;
  date: string;
  module: 'POS' | 'PPOB' | 'BRILINK' | 'SERVICE';
  description: string;
  customer: string;
  modal: number;
  total: number;
  profit: number;
  paymentMethod: string;
  cashPaid?: number;
  changeAmount?: number;
  items: TransactionItem[];
}

export interface StockLedgerEntry {
  date: string;
  ref: string;
  code: string;
  name: string;
  type: string;
  inQty: number;
  outQty: number;
  balance: number;
}

export interface VoucherProduction {
  date: string;
  targetName: string;
  qty: number;
  totalModal: number;
}

export interface PosCartItem {
  code: string;
  name: string;
  unit: string;
  qty: number;
  cost: number;
}

export interface AppState {
  settings: StoreSettings;
  categories: string[];
  users: UserAccount[];
  wallets: Record<string, number>;
  walletList: WalletAccount[];
  items: InventoryItem[];
  voucherProductions: VoucherProduction[];
  suppliers: Supplier[];
  customers: Customer[];
  serviceTickets: ServiceTicket[];
  debtsReceivables: DebtRecord[];
  fundTransfers: FundTransfer[];
  purchaseOrders: PurchaseOrder[];
  purchaseRecords: PurchaseRecord[];
  purchaseReturns: PurchaseReturn[];
  salesOrders: SalesOrder[];
  salesReturns: SalesReturn[];
  transactions: TransactionRecord[];
  stockLedger: StockLedgerEntry[];
}

export interface ToastMessage {
  id: number;
  msg: string;
  type: 'info' | 'success' | 'error';
}

export interface DocPreviewData {
  docType: 'PO' | 'FAKTUR' | 'SO' | 'FAKTUR_JUAL';
  docNo: string;
  poRef?: string;
  date: string;
  supplier: string;
  partyLabel?: string;
  status?: string;
  paymentInfo?: string;
  note?: string;
  items: OrderItem[];
}
