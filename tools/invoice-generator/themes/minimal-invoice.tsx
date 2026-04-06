'use client'

import type { InvoiceState } from '../invoice-types'
import { calcGroupedTotals, formatCurrency, calcLineItemSubtotal } from '../shared/invoice-calculations'

interface ThemeLayoutProps {
  invoice: InvoiceState
}

export function MinimalInvoice({ invoice }: ThemeLayoutProps) {
  const { sender, client, theme, labels, lineItems, taxPresets, logo } = invoice
  const totals = calcGroupedTotals(lineItems, taxPresets)
  const isMultiCurrency = totals.length > 1

  return (
    <div style={{ color: theme.textColor, fontWeight: 300 }}>
      {/* Header — minimal */}
      <div style={{ marginBottom: 48 }}>
        {logo && (
          <div style={{ marginBottom: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="Logo" style={{ maxHeight: 56, maxWidth: 180, objectFit: 'contain' }} />
          </div>
        )}
        <h1
          style={{
            fontSize: 36,
            fontWeight: 200,
            color: theme.primaryColor,
            margin: 0,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {labels.invoice}
        </h1>
        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textColor }}>{invoice.invoiceNumber}</span>
          {' · '}
          {labels.date}: {invoice.issueDate}
          {' · '}
          {labels.dueDate}: {invoice.dueDate}
          {invoice.reference && ` · Ref: ${invoice.reference}`}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #eee', marginBottom: 24 }} />

      {/* From / Bill To — stacked */}
      <div style={{ marginBottom: 32 }}>
        {sender.name && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: '#999',
                marginBottom: 4,
              }}
            >
              {labels.from}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{sender.name}</div>
            <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>
              {[sender.address1, sender.city, sender.country].filter(Boolean).join(' · ')}
              {sender.email && <span> · {sender.email}</span>}
            </div>
          </div>
        )}
        {client.name && (
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: '#999',
                marginBottom: 4,
              }}
            >
              {labels.billTo}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{client.name}</div>
            <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>
              {[client.address1, client.city, client.country].filter(Boolean).join(' · ')}
              {client.email && <span> · {client.email}</span>}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderBottom: '1px solid #eee', marginBottom: 24 }} />

      {/* Line items — ultra-clean table */}
      <table style={{ width: '100%', fontSize: 12, marginBottom: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 0 12px',
                fontWeight: 500,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: '#999',
              }}
            >
              {labels.description}
            </th>
            <th
              style={{
                textAlign: 'center',
                padding: '4px 0 12px',
                fontWeight: 500,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: '#999',
                width: 60,
              }}
            >
              {labels.qty}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '4px 0 12px',
                fontWeight: 500,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: '#999',
                width: 90,
              }}
            >
              {labels.rate}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '4px 0 12px',
                fontWeight: 500,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: '#999',
                width: 90,
              }}
            >
              {labels.amount}
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                {item.description || '—'}
              </td>
              <td
                style={{
                  textAlign: 'center',
                  padding: '10px 0',
                  borderTop: '1px solid #f0f0f0',
                  color: '#777',
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '10px 0',
                  borderTop: '1px solid #f0f0f0',
                  color: '#777',
                }}
              >
                {formatCurrency(item.rate, item.currency)}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '10px 0',
                  borderTop: '1px solid #f0f0f0',
                  fontWeight: 500,
                }}
              >
                {formatCurrency(calcLineItemSubtotal(item), item.currency)}
              </td>
            </tr>
          ))}
          {lineItems.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#bbb', fontSize: 11 }}>
                Add line items to see them here
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals — minimal */}
      {totals.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ width: 240, fontSize: 12 }}>
            {totals.map((group, idx) => (
              <div key={group.currency} style={{ marginTop: idx > 0 ? 16 : 0 }}>
                {isMultiCurrency && (
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      color: '#999',
                      marginBottom: 4,
                    }}
                  >
                    {group.currency}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#888' }}>{labels.subtotal}</span>
                  <span>{formatCurrency(group.subtotal, group.currency)}</span>
                </div>
                {group.taxBreakdown.map((tax) => (
                  <div
                    key={tax.name}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}
                  >
                    <span style={{ color: '#888' }}>{tax.name}</span>
                    <span>{formatCurrency(tax.amount, group.currency)}</span>
                  </div>
                ))}
                {group.totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#888' }}>{labels.discount}</span>
                    <span style={{ color: '#dc2626' }}>
                      -{formatCurrency(group.totalDiscount, group.currency)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0 4px',
                    borderTop: '1px solid #ddd',
                    marginTop: 8,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {labels.total}
                  </span>
                  <span style={{ color: theme.primaryColor }}>
                    {formatCurrency(group.grandTotal, group.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.notes && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16 }}>
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: '#999',
              marginBottom: 6,
            }}
          >
            {labels.notes}
          </div>
          <div style={{ fontSize: 11, color: '#777', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {invoice.notes}
          </div>
        </div>
      )}
    </div>
  )
}
