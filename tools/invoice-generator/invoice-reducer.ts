import type {
  ContactInfo,
  EditorState,
  InvoiceLabels,
  InvoiceState,
  InvoiceTheme,
  LineItem,
  PaymentTerms,
  TabId,
  TaxPreset,
} from './invoice-types';
import { createDefaultInvoice, PAYMENT_TERMS_DAYS } from './invoice-defaults';

// ─── Action Types ─────────────────────────────────────────────────────────────

export type InvoiceAction =
  | { type: 'SET_TAB'; payload: TabId }
  | { type: 'SET_SENDER'; payload: Partial<ContactInfo> }
  | { type: 'SET_CLIENT'; payload: Partial<ContactInfo> }
  | { type: 'SET_LOGO'; payload: string }
  | { type: 'SET_INVOICE_NUMBER'; payload: string }
  | { type: 'SET_ISSUE_DATE'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string }
  | { type: 'SET_REFERENCE'; payload: string }
  | { type: 'SET_PAYMENT_TERMS'; payload: PaymentTerms }
  | { type: 'ADD_LINE_ITEM'; payload: LineItem }
  | { type: 'UPDATE_LINE_ITEM'; payload: { id: string; changes: Partial<LineItem> } }
  | { type: 'REMOVE_LINE_ITEM'; payload: string }
  | { type: 'REORDER_LINE_ITEMS'; payload: LineItem[] }
  | { type: 'SET_DEFAULT_CURRENCY'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_TAX_PRESET'; payload: TaxPreset }
  | { type: 'UPDATE_TAX_PRESET'; payload: { id: string; changes: Partial<TaxPreset> } }
  | { type: 'REMOVE_TAX_PRESET'; payload: string }
  | { type: 'SET_THEME'; payload: Partial<InvoiceTheme> }
  | { type: 'SET_LABELS'; payload: Partial<InvoiceLabels> }
  | { type: 'LOAD_INVOICE'; payload: InvoiceState }
  | { type: 'RESET_INVOICE' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

function dirtyInvoice(invoice: InvoiceState, patch: Partial<InvoiceState>): InvoiceState {
  return { ...invoice, ...patch, updatedAt: nowISO() };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createDefaultEditorState(): EditorState {
  return {
    invoice: createDefaultInvoice(),
    activeTab: 'details',
    isDirty: false,
    templates: [],
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function invoiceReducer(state: EditorState, action: InvoiceAction): EditorState {
  switch (action.type) {
    // ── Navigation ────────────────────────────────────────────────────────────
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    // ── Contacts ──────────────────────────────────────────────────────────────
    case 'SET_SENDER':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          sender: { ...state.invoice.sender, ...action.payload },
        }),
      };

    case 'SET_CLIENT':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          client: { ...state.invoice.client, ...action.payload },
        }),
      };

    // ── Logo ──────────────────────────────────────────────────────────────────
    case 'SET_LOGO':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { logo: action.payload }),
      };

    // ── Invoice Header Fields ─────────────────────────────────────────────────
    case 'SET_INVOICE_NUMBER':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { invoiceNumber: action.payload }),
      };

    case 'SET_ISSUE_DATE': {
      const issueDate = action.payload;
      const { paymentTerms } = state.invoice;
      const dueDate =
        paymentTerms !== 'custom'
          ? addDays(issueDate, PAYMENT_TERMS_DAYS[paymentTerms])
          : state.invoice.dueDate;
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { issueDate, dueDate }),
      };
    }

    case 'SET_DUE_DATE':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { dueDate: action.payload }),
      };

    case 'SET_REFERENCE':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { reference: action.payload }),
      };

    case 'SET_PAYMENT_TERMS': {
      const paymentTerms = action.payload;
      const dueDate =
        paymentTerms !== 'custom'
          ? addDays(state.invoice.issueDate, PAYMENT_TERMS_DAYS[paymentTerms])
          : state.invoice.dueDate;
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { paymentTerms, dueDate }),
      };
    }

    // ── Line Items ────────────────────────────────────────────────────────────
    case 'ADD_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          lineItems: [...state.invoice.lineItems, action.payload],
        }),
      };

    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          lineItems: state.invoice.lineItems.map((item) =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.changes }
              : item
          ),
        }),
      };

    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          lineItems: state.invoice.lineItems.filter((item) => item.id !== action.payload),
        }),
      };

    case 'REORDER_LINE_ITEMS':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { lineItems: action.payload }),
      };

    // ── Settings ──────────────────────────────────────────────────────────────
    case 'SET_DEFAULT_CURRENCY':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { defaultCurrency: action.payload }),
      };

    case 'SET_NOTES':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, { notes: action.payload }),
      };

    // ── Tax Presets ───────────────────────────────────────────────────────────
    case 'ADD_TAX_PRESET':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          taxPresets: [...state.invoice.taxPresets, action.payload],
        }),
      };

    case 'UPDATE_TAX_PRESET':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          taxPresets: state.invoice.taxPresets.map((preset) =>
            preset.id === action.payload.id
              ? { ...preset, ...action.payload.changes }
              : preset
          ),
        }),
      };

    case 'REMOVE_TAX_PRESET': {
      const removedId = action.payload;
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          taxPresets: state.invoice.taxPresets.filter((p) => p.id !== removedId),
          // Clear taxPresetId from any line items using the removed preset
          lineItems: state.invoice.lineItems.map((item) =>
            item.taxPresetId === removedId ? { ...item, taxPresetId: '' } : item
          ),
        }),
      };
    }

    // ── Theme & Labels ────────────────────────────────────────────────────────
    case 'SET_THEME':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          theme: { ...state.invoice.theme, ...action.payload },
        }),
      };

    case 'SET_LABELS':
      return {
        ...state,
        isDirty: true,
        invoice: dirtyInvoice(state.invoice, {
          labels: { ...state.invoice.labels, ...action.payload },
        }),
      };

    // ── Load / Reset ──────────────────────────────────────────────────────────
    case 'LOAD_INVOICE':
      return {
        ...state,
        isDirty: false,
        invoice: action.payload,
      };

    case 'RESET_INVOICE':
      return {
        ...state,
        isDirty: false,
        invoice: createDefaultInvoice(),
      };

    default:
      return state;
  }
}
