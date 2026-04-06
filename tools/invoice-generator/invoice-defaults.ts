import type {
  ContactInfo,
  InvoiceLabels,
  InvoiceState,
  InvoiceTheme,
  LineItem,
  PaymentTerms,
  TaxPreset,
} from './invoice-types';

// ─── Labels ───────────────────────────────────────────────────────────────────

export const DEFAULT_LABELS: InvoiceLabels = {
  invoice: 'Invoice',
  billTo: 'Bill To',
  from: 'From',
  date: 'Date',
  dueDate: 'Due Date',
  description: 'Description',
  qty: 'Qty',
  rate: 'Rate',
  amount: 'Amount',
  subtotal: 'Subtotal',
  tax: 'Tax',
  discount: 'Discount',
  total: 'Total',
  notes: 'Notes',
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const DEFAULT_THEME: InvoiceTheme = {
  templateId: 'classic',
  primaryColor: '#3D6AF2',
  accentColor: '#32A9D9',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  fontFamily: 'system',
  fontSize: 'md',
  logoPosition: 'top-left',
};

// ─── Empty Contact ────────────────────────────────────────────────────────────

export const EMPTY_CONTACT: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  taxId: '',
};

// ─── Tax Presets ──────────────────────────────────────────────────────────────

export const DEFAULT_TAX_PRESETS: TaxPreset[] = [
  { id: 'gst-15', name: 'GST', rate: 0.15 },
  { id: 'vat-20', name: 'VAT', rate: 0.20 },
];

// ─── Payment Terms ────────────────────────────────────────────────────────────

export const PAYMENT_TERMS_DAYS: Record<Exclude<PaymentTerms, 'custom'>, number> = {
  net7: 7,
  net14: 14,
  net30: 30,
  net60: 60,
  net90: 90,
};

// ─── Currencies ───────────────────────────────────────────────────────────────

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

// ─── Color Presets ────────────────────────────────────────────────────────────

export interface ColorPreset {
  name: string;
  primary: string;
  accent: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Blue', primary: '#3D6AF2', accent: '#32A9D9' },
  { name: 'Teal', primary: '#32A9D9', accent: '#10B981' },
  { name: 'Red', primary: '#EF4444', accent: '#F97316' },
  { name: 'Dark', primary: '#1a1a1a', accent: '#333333' },
  { name: 'Mono', primary: '#6B7280', accent: '#9CA3AF' },
];

// ─── Factory Functions ────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createDefaultInvoice(): InvoiceState {
  const now = new Date().toISOString();
  const issueDate = todayISO();
  const dueDate = addDays(issueDate, PAYMENT_TERMS_DAYS.net14);

  return {
    id: crypto.randomUUID(),
    invoiceNumber: 'INV-0001',
    issueDate,
    dueDate,
    paymentTerms: 'net14',
    reference: '',
    sender: { ...EMPTY_CONTACT },
    client: { ...EMPTY_CONTACT },
    logo: '',
    lineItems: [],
    taxPresets: DEFAULT_TAX_PRESETS,
    defaultCurrency: 'USD',
    notes: '',
    theme: { ...DEFAULT_THEME },
    labels: { ...DEFAULT_LABELS },
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyLineItem(currency: string): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    rate: 0,
    currency,
    taxPresetId: '',
    discountType: 'none',
    discountValue: 0,
  };
}
