import {
  AppState,
  BluetoothPaperWidth,
  DocPreviewData,
  PrinterMode,
  ServiceTicket,
  StandardPaperSize,
  TransactionRecord,
} from '../types/ipos';
import { formatNum, formatRp } from './storage';

interface BleWritableCharacteristic {
  properties?: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValueWithResponse?: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
  writeValue?: (value: BufferSource) => Promise<void>;
}

interface BleService {
  getCharacteristics(): Promise<BleWritableCharacteristic[]>;
}

interface BleGattServer {
  connected: boolean;
  connect(): Promise<BleGattServer>;
  getPrimaryServices(): Promise<BleService[]>;
}

interface BleDevice {
  name?: string;
  gatt?: BleGattServer;
}

interface NavigatorWithBluetooth {
  bluetooth?: {
    requestDevice(options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }): Promise<BleDevice>;
  };
}

let cachedBtDevice: BleDevice | null = null;
let cachedBtChar: BleWritableCharacteristic | null = null;

const COMMON_THERMAL_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
];

export const PAPER_LABELS: Record<StandardPaperSize, string> = {
  A4: 'A4 (210 × 297 mm)',
  F4: 'F4 (215 × 330 mm)',
  FOLIO: 'Polio / Folio (216 × 330 mm)',
};

export function applyDynamicPageStyle(
  printerMode: PrinterMode,
  paperSize: StandardPaperSize,
  bluetoothWidth: BluetoothPaperWidth
) {
  let styleEl = document.getElementById('donet-dynamic-page-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'donet-dynamic-page-style';
    document.head.appendChild(styleEl);
  }

  let pageCss = '@page { size: A4 portrait; margin: 12mm; }';
  if (printerMode === 'BLUETOOTH') {
    pageCss =
      bluetoothWidth === '80mm'
        ? '@page { size: 80mm auto; margin: 2mm; }'
        : '@page { size: 58mm auto; margin: 2mm; }';
  } else if (paperSize === 'F4') {
    pageCss = '@page { size: 215mm 330mm portrait; margin: 12mm; }';
  } else if (paperSize === 'FOLIO') {
    pageCss = '@page { size: 216mm 330mm portrait; margin: 12mm; }';
  } else {
    pageCss = '@page { size: A4 portrait; margin: 12mm; }';
  }

  styleEl.textContent = `@media print { ${pageCss} }`;
}

export function triggerSystemPrint(
  mode: 'receipt' | 'doc',
  printerMode: PrinterMode,
  paperSize: StandardPaperSize,
  bluetoothWidth: BluetoothPaperWidth
) {
  applyDynamicPageStyle(printerMode, paperSize, bluetoothWidth);
  document.body.classList.remove('print-mode-receipt', 'print-mode-doc', 'print-thermal-58', 'print-thermal-80');
  if (printerMode === 'BLUETOOTH') {
    document.body.classList.add(bluetoothWidth === '80mm' ? 'print-thermal-80' : 'print-thermal-58');
  }
  document.body.classList.add(mode === 'receipt' ? 'print-mode-receipt' : 'print-mode-doc');
  window.print();
  setTimeout(() => {
    document.body.classList.remove(
      'print-mode-receipt',
      'print-mode-doc',
      'print-thermal-58',
      'print-thermal-80'
    );
  }, 600);
}

function padRight(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

function formatLinePair(left: string, right: string, lineWidth: number): string {
  const maxLeft = Math.max(8, lineWidth - right.length - 1);
  const clippedLeft = left.length > maxLeft ? left.slice(0, maxLeft) : left;
  const spaces = Math.max(1, lineWidth - clippedLeft.length - right.length);
  return `${clippedLeft}${' '.repeat(spaces)}${right}`;
}

function encodeAsciiText(str: string): number[] {
  const normalized = str
    .replace(/[×]/g, 'x')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, ' ');
  const out: number[] = [];
  for (let i = 0; i < normalized.length; i++) {
    out.push(normalized.charCodeAt(i));
  }
  return out;
}

function buildEscPosPayload(lines: { text: string; align?: 'left' | 'center'; bold?: boolean }[]): Uint8Array {
  const bytes: number[] = [0x1b, 0x40]; // ESC @ Initialize
  for (const line of lines) {
    const alignByte = line.align === 'center' ? 0x01 : 0x00;
    const boldByte = line.bold ? 0x01 : 0x00;
    bytes.push(0x1b, 0x61, alignByte);
    bytes.push(0x1b, 0x45, boldByte);
    bytes.push(...encodeAsciiText(`${line.text}\n`));
  }
  bytes.push(0x1b, 0x45, 0x00);
  bytes.push(0x1b, 0x61, 0x00);
  bytes.push(0x0a, 0x0a, 0x0a);
  bytes.push(0x1d, 0x56, 0x42, 0x00); // GS V B 0 (Feed & Cut)
  return new Uint8Array(bytes);
}

async function getBluetoothPrintCharacteristic(): Promise<{
  char: BleWritableCharacteristic;
  deviceName: string;
}> {
  const nav = navigator as unknown as NavigatorWithBluetooth;
  if (!nav.bluetooth) {
    throw new Error(
      'Browser ini belum mendukung Web Bluetooth langsung. Gunakan Chrome/Edge atau klik "Cetak Sistem / Driver".'
    );
  }

  if (cachedBtDevice?.gatt?.connected && cachedBtChar) {
    return { char: cachedBtChar, deviceName: cachedBtDevice.name || 'Printer Bluetooth' };
  }

  const device =
    cachedBtDevice ||
    (await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: COMMON_THERMAL_PRINTER_SERVICES,
    }));

  if (!device.gatt) {
    throw new Error('Perangkat Bluetooth tidak mendukung layanan GATT printer.');
  }

  const server = device.gatt.connected ? device.gatt : await device.gatt.connect();
  const services = await server.getPrimaryServices();

  let foundChar: BleWritableCharacteristic | null = null;
  for (const svc of services) {
    const chars = await svc.getCharacteristics();
    for (const c of chars) {
      if (c.properties?.writeWithoutResponse || c.properties?.write) {
        foundChar = c;
        break;
      }
    }
    if (foundChar) break;
  }

  if (!foundChar) {
    throw new Error('Karakteristik cetak tidak ditemukan di printer Bluetooth.');
  }

  cachedBtDevice = device;
  cachedBtChar = foundChar;
  return { char: foundChar, deviceName: device.name || 'Printer Bluetooth' };
}

async function sendBytesToBluetooth(payload: Uint8Array): Promise<string> {
  const { char, deviceName } = await getBluetoothPrintCharacteristic();
  const chunkSize = 20;
  for (let offset = 0; offset < payload.length; offset += chunkSize) {
    const chunk = payload.slice(offset, offset + chunkSize);
    if (char.properties?.writeWithoutResponse && char.writeValueWithoutResponse) {
      await char.writeValueWithoutResponse(chunk);
    } else if (char.writeValueWithResponse) {
      await char.writeValueWithResponse(chunk);
    } else if (char.writeValue) {
      await char.writeValue(chunk);
    }
    await new Promise((r) => setTimeout(r, 15));
  }
  return deviceName;
}

export function resetBluetoothPrinterCache() {
  cachedBtDevice = null;
  cachedBtChar = null;
}

export async function printReceiptViaBluetooth(
  appState: AppState,
  receiptTrx: TransactionRecord | null,
  receiptServiceTicket: ServiceTicket | null,
  widthMode: BluetoothPaperWidth
): Promise<string> {
  const cols = widthMode === '80mm' ? 42 : 32;
  const sep = '-'.repeat(cols);
  const lines: { text: string; align?: 'left' | 'center'; bold?: boolean }[] = [
    { text: appState.settings.storeName, align: 'center', bold: true },
    { text: appState.settings.storeAddress, align: 'center' },
    { text: `Telp: ${appState.settings.storePhone}`, align: 'center' },
    { text: sep },
  ];

  if (receiptServiceTicket) {
    lines.push({ text: 'TANDA TERIMA SERVICE HP', align: 'center', bold: true });
    lines.push({ text: sep });
    lines.push({ text: formatLinePair('No:', receiptServiceTicket.id, cols) });
    lines.push({ text: formatLinePair('Tgl:', new Date(receiptServiceTicket.date).toLocaleString('id-ID'), cols) });
    lines.push({ text: formatLinePair('Plg:', receiptServiceTicket.customer, cols) });
    lines.push({ text: formatLinePair('HP:', receiptServiceTicket.phone || '-', cols) });
    lines.push({ text: sep });
    lines.push({ text: `Unit: ${receiptServiceTicket.device}`, bold: true });
    lines.push({ text: `Keluhan: ${receiptServiceTicket.issue}` });
    lines.push({ text: sep });
    lines.push({ text: appState.settings.storeFooter, align: 'center' });
  } else if (receiptTrx) {
    lines.push({ text: `No  : ${receiptTrx.id}` });
    lines.push({ text: `Tgl : ${new Date(receiptTrx.date).toLocaleString('id-ID')}` });
    lines.push({ text: `Plg : ${receiptTrx.customer}` });
    lines.push({ text: sep });
    (receiptTrx.items || []).forEach((i) => {
      lines.push({ text: i.name });
      lines.push({
        text: formatLinePair(`  ${i.qty} x ${formatRp(i.price)}`, formatRp(i.price * i.qty), cols),
      });
    });
    lines.push({ text: sep });
    lines.push({
      text: formatLinePair('TOTAL BAYAR', `Rp ${formatRp(receiptTrx.total)}`, cols),
      bold: true,
    });
    if (receiptTrx.cashPaid !== undefined && receiptTrx.cashPaid > 0) {
      lines.push({
        text: formatLinePair('Tunai', `Rp ${formatRp(receiptTrx.cashPaid)}`, cols),
      });
      lines.push({
        text: formatLinePair('Kembali', `Rp ${formatRp(receiptTrx.changeAmount || 0)}`, cols),
      });
    }
    lines.push({ text: sep });
    lines.push({ text: appState.settings.storeFooter, align: 'center' });
  }

  return sendBytesToBluetooth(buildEscPosPayload(lines));
}

export async function printDocViaBluetooth(
  appState: AppState,
  doc: DocPreviewData,
  username: string,
  widthMode: BluetoothPaperWidth
): Promise<string> {
  const cols = widthMode === '80mm' ? 42 : 32;
  const sep = '-'.repeat(cols);
  const title =
    doc.docType === 'SO'
      ? 'PESANAN PENJUALAN (PO)'
      : doc.docType === 'FAKTUR_JUAL'
      ? 'FAKTUR PENJUALAN'
      : doc.docType === 'PO'
      ? 'SURAT PESANAN (PO)'
      : 'FAKTUR PEMBELIAN';

  const isSales = doc.docType === 'SO' || doc.docType === 'FAKTUR_JUAL';
  const totalQty = doc.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const grandTotal = doc.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.cost) || 0), 0);

  const lines: { text: string; align?: 'left' | 'center'; bold?: boolean }[] = [
    { text: appState.settings.storeName, align: 'center', bold: true },
    { text: appState.settings.storeAddress, align: 'center' },
    { text: `Telp: ${appState.settings.storePhone}`, align: 'center' },
    { text: sep },
    { text: title, align: 'center', bold: true },
    { text: `No  : ${doc.docNo}`, bold: true },
    { text: `Tgl : ${(doc.date || '').slice(0, 10)}` },
    { text: `${isSales ? 'Plg' : 'Sup'} : ${doc.supplier}` },
  ];
  if (doc.poRef) lines.push({ text: `Ref : ${doc.poRef}` });
  if (doc.status) lines.push({ text: `Sts : ${doc.status}` });
  if (doc.paymentInfo) lines.push({ text: `Byr : ${doc.paymentInfo}` });
  lines.push({ text: sep });

  // Tanpa kolom Kode Barang — hanya No, Nama Produk, Qty, Harga Satuan, Subtotal
  doc.items.forEach((it, idx) => {
    lines.push({ text: `${idx + 1}. ${padRight(it.name, cols - 4)}` });
    lines.push({
      text: formatLinePair(
        `   ${it.qty} x ${formatRp(it.cost)}`,
        formatRp(it.qty * it.cost),
        cols
      ),
    });
  });

  lines.push({ text: sep });
  lines.push({ text: formatLinePair('Total Qty', `${formatNum(totalQty)} PCS`, cols) });
  lines.push({
    text: formatLinePair('TOTAL', `Rp ${formatRp(grandTotal)}`, cols),
    bold: true,
  });
  if (doc.note && doc.note !== '-') {
    lines.push({ text: `Catatan: ${doc.note}` });
  }
  lines.push({ text: sep });
  lines.push({ text: `Dibuat oleh: ${username}`, align: 'center' });
  lines.push({ text: appState.settings.storeFooter, align: 'center' });

  return sendBytesToBluetooth(buildEscPosPayload(lines));
}
