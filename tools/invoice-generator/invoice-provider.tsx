'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { EditorState, InvoiceTemplate } from './invoice-types';
import {
  createDefaultEditorState,
  invoiceReducer,
  type InvoiceAction,
} from './invoice-reducer';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const DRAFT_KEY = 'invoice_draft';
const TEMPLATES_KEY = 'invoice_templates';

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function loadDraft(): EditorState['invoice'] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(invoice: EditorState['invoice']): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  } catch {
    // localStorage may be unavailable (e.g. private browsing / quota exceeded)
  }
}

function loadTemplates(): InvoiceTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: InvoiceTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

// ─── Context Value ────────────────────────────────────────────────────────────

export interface InvoiceContextValue {
  state: EditorState;
  dispatch: React.Dispatch<InvoiceAction>;
  saveTemplate: (name: string) => void;
  loadTemplate: (template: InvoiceTemplate) => void;
  deleteTemplate: (id: string) => void;
  templates: InvoiceTemplate[];
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  // Always start from the deterministic default so SSR and the first client
  // render produce identical HTML. After mount we hydrate from localStorage.
  const [state, dispatch] = useReducer(invoiceReducer, undefined, createDefaultEditorState);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const hydratedRef = useRef(false);

  // Hydrate from localStorage AFTER first client render to avoid hydration mismatch
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      dispatch({ type: 'LOAD_INVOICE', payload: draft });
    }
    setTemplates(loadTemplates());
    hydratedRef.current = true;
  }, []);

  // Auto-save draft whenever the invoice becomes dirty (only after hydration)
  useEffect(() => {
    if (state.isDirty && hydratedRef.current) {
      saveDraft(state.invoice);
    }
  }, [state.isDirty, state.invoice]);

  const saveTemplate = useCallback(
    (name: string) => {
      const { invoice } = state;

      // Derive prefix from invoiceNumber (everything before the trailing digit sequence)
      const prefixMatch = invoice.invoiceNumber.match(/^(.*?)(\d+)$/);
      const invoicePrefix = prefixMatch ? prefixMatch[1] : invoice.invoiceNumber;

      const now = new Date().toISOString();
      const template: InvoiceTemplate = {
        id: crypto.randomUUID(),
        name,
        sender: { ...invoice.sender },
        logo: invoice.logo,
        taxPresets: invoice.taxPresets.map((p) => ({ ...p })),
        defaultCurrency: invoice.defaultCurrency,
        notes: invoice.notes,
        theme: { ...invoice.theme },
        labels: { ...invoice.labels },
        invoicePrefix,
        createdAt: now,
        updatedAt: now,
      };

      setTemplates((prev) => {
        const updated = [...prev, template];
        saveTemplates(updated);
        return updated;
      });
    },
    [state]
  );

  const loadTemplate = useCallback(
    (template: InvoiceTemplate) => {
      const { invoice } = state;
      // Merge template fields into the current invoice;
      // preserve client, lineItems, invoiceNumber, issueDate, dueDate, reference.
      dispatch({
        type: 'LOAD_INVOICE',
        payload: {
          ...invoice,
          sender: { ...template.sender },
          logo: template.logo,
          taxPresets: template.taxPresets.map((p) => ({ ...p })),
          defaultCurrency: template.defaultCurrency,
          notes: template.notes,
          theme: { ...template.theme },
          labels: { ...template.labels },
          updatedAt: new Date().toISOString(),
        },
      });
    },
    [state]
  );

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const value: InvoiceContextValue = {
    state,
    dispatch,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    templates,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvoice(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an <InvoiceProvider>');
  }
  return ctx;
}
