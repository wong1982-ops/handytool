// ─── Line Item ────────────────────────────────────────────────────────────────

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  currency: string;
  taxPresetId: string; // '' means no tax
  discountType: 'none' | 'percent' | 'fixed';
  discountValue: number;
}

// ─── Tax Preset ───────────────────────────────────────────────────────────────

export interface TaxPreset {
  id: string;
  name: string;
  rate: number; // decimal, e.g. 0.15 = 15%
}

// ─── Union Types ──────────────────────────────────────────────────────────────

export type InvoiceTemplateId = 'classic' | 'modern' | 'minimal';
export type FontFamily = 'system' | 'serif' | 'mono';
export type FontSize = 'sm' | 'md' | 'lg';
export type LogoPosition = 'top-left' | 'top-right' | 'top-center';
export type PaymentTerms = 'net7' | 'net14' | 'net30' | 'net60' | 'net90' | 'custom';

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface InvoiceTheme {
  templateId: InvoiceTemplateId;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  logoPosition: LogoPosition;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export interface InvoiceLabels {
  invoice: string;
  billTo: string;
  from: string;
  date: string;
  dueDate: string;
  description: string;
  qty: string;
  rate: string;
  amount: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes: string;
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
}

// ─── Invoice State ────────────────────────────────────────────────────────────

export interface InvoiceState {
  id: string;
  invoiceNumber: string;
  issueDate: string; // ISO date string
  dueDate: string;   // ISO date string
  paymentTerms: PaymentTerms;
  reference: string;
  sender: ContactInfo;
  client: ContactInfo;
  logo: string; // base64 or URL
  lineItems: LineItem[];
  taxPresets: TaxPreset[];
  defaultCurrency: string;
  notes: string;
  theme: InvoiceTheme;
  labels: InvoiceLabels;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ─── Invoice Template ─────────────────────────────────────────────────────────

export interface InvoiceTemplate {
  id: string;
  name: string;
  sender: ContactInfo;
  logo: string;
  taxPresets: TaxPreset[];
  defaultCurrency: string;
  notes: string;
  theme: InvoiceTheme;
  labels: InvoiceLabels;
  invoicePrefix: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export type TabId = 'details' | 'items' | 'styling' | 'settings';

export interface EditorState {
  invoice: InvoiceState;
  activeTab: TabId;
  isDirty: boolean;
  templates: InvoiceTemplate[];
}

// ─── Currency Totals ──────────────────────────────────────────────────────────

export interface CurrencyTotal {
  currency: string;
  subtotal: number;
  taxBreakdown: {
    name: string;
    amount: number;
  }[];
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
}
