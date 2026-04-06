import type { CurrencyTotal, LineItem, TaxPreset } from '../invoice-types';

// ─── Line Item Calculations ───────────────────────────────────────────────────

/** Returns quantity × rate (before discount and tax). */
export function calcLineItemSubtotal(item: LineItem): number {
  return item.quantity * item.rate;
}

/** Returns the discount amount for a line item. */
export function calcLineItemDiscount(item: LineItem): number {
  const subtotal = calcLineItemSubtotal(item);

  switch (item.discountType) {
    case 'percent':
      return subtotal * (item.discountValue / 100);
    case 'fixed':
      return Math.min(item.discountValue, subtotal); // cannot exceed subtotal
    case 'none':
    default:
      return 0;
  }
}

/** Returns the tax amount for a line item (applied to subtotal - discount). */
export function calcLineItemTax(item: LineItem, taxPresets: TaxPreset[]): number {
  if (!item.taxPresetId) return 0;

  const preset = taxPresets.find((p) => p.id === item.taxPresetId);
  if (!preset) return 0;

  const taxableAmount = calcLineItemSubtotal(item) - calcLineItemDiscount(item);
  return taxableAmount * preset.rate;
}

/** Returns the final total for a line item: subtotal - discount + tax. */
export function calcLineItemTotal(item: LineItem, taxPresets: TaxPreset[]): number {
  return (
    calcLineItemSubtotal(item) -
    calcLineItemDiscount(item) +
    calcLineItemTax(item, taxPresets)
  );
}

// ─── Grouped Totals ───────────────────────────────────────────────────────────

/**
 * Groups line items by currency and aggregates subtotals, tax breakdowns,
 * total discounts, total tax, and grand totals.
 */
export function calcGroupedTotals(
  lineItems: LineItem[],
  taxPresets: TaxPreset[],
): CurrencyTotal[] {
  const map = new Map<string, CurrencyTotal>();

  for (const item of lineItems) {
    const currency = item.currency;

    if (!map.has(currency)) {
      map.set(currency, {
        currency,
        subtotal: 0,
        taxBreakdown: [],
        totalTax: 0,
        totalDiscount: 0,
        grandTotal: 0,
      });
    }

    const group = map.get(currency)!;
    const subtotal = calcLineItemSubtotal(item);
    const discount = calcLineItemDiscount(item);
    const tax = calcLineItemTax(item, taxPresets);

    group.subtotal += subtotal;
    group.totalDiscount += discount;
    group.totalTax += tax;
    group.grandTotal += subtotal - discount + tax;

    // Accumulate per-preset tax breakdown
    if (item.taxPresetId && tax > 0) {
      const preset = taxPresets.find((p) => p.id === item.taxPresetId);
      if (preset) {
        const existing = group.taxBreakdown.find((b) => b.name === preset.name);
        if (existing) {
          existing.amount += tax;
        } else {
          group.taxBreakdown.push({ name: preset.name, amount: tax });
        }
      }
    }
  }

  return Array.from(map.values());
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Formats a number as a localised currency string.
 * Falls back to a plain numeric string with the currency code if the
 * runtime does not support the requested currency.
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unsupported currency code — fall back gracefully
    return `${currency} ${amount.toFixed(2)}`;
  }
}
