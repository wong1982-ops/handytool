'use client'

import type { InvoiceState } from '../invoice-types'
import { calcGroupedTotals, formatCurrency, calcLineItemSubtotal } from '../shared/invoice-calculations'

interface ThemeLayoutProps {
  invoice: InvoiceState
}

export function ModernInvoice({ invoice }: ThemeLayoutProps) {
  const { sender, client, theme, labels, lineItems, taxPresets, logo } = invoice
  const totals = calcGroupedTotals(lineItems, taxPresets)
  const isMultiCurrency = totals.length > 1

  return (
    <div style={{ color: theme.textColor, margin: -32 }}>
      {/* Bold colored header bar */}
      <div
        style={{
          background: theme.primaryColor,
          color: '#fff',
          padding: '32px 32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: 0,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {labels.invoice}
          </h1>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</div>
            <div>
              {labels.date}: {invoice.issueDate} • {labels.dueDate}: {invoice.dueDate}
            </div>
            {invoice.reference && <div style={{ opacity: 0.75 }}>Ref: {invoice.reference}</div>}
          </div>
        </div>
        {logo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logo}
            alt="Logo"
            style={{
              maxHeight: 64,
              maxWidth: 200,
              objectFit: 'contain',
              background: 'rgba(255,255,255,0.1)',
              padding: 8,
              borderRadius: 6,
            }}
          />
        )}
      </div>

      {/* Body with accent sidebar */}
      <div style={{ display: 'flex', minHeight: 400 }}>
        <div style={{ width: 6, background: theme.accentColor }} />
        <div style={{ flex: 1, padding: 32 }}>
          {/* From / Bill To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: theme.accentColor,
                  marginBottom: 6,
                }}
              >
                {labels.from}
              </div>
              {sender.name && <div style={{ fontSize: 14, fontWeight: 700 }}>{sender.name}</div>}
              <div style={{ fontSize: 11, lineHeight: 1.6, color: '#666' }}>
                {sender.address1 && <div>{sender.address1}</div>}
                {sender.address2 && <div>{sender.address2}</div>}
                {(sender.city || sender.state || sender.zip) && (
                  <div>{[sender.city, sender.state, sender.zip].filter(Boolean).join(', ')}</div>
                )}
                {sender.country && <div>{sender.country}</div>}
                {sender.email && <div>{sender.email}</div>}
                {sender.taxId && <div>Tax ID: {sender.taxId}</div>}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: theme.accentColor,
                  marginBottom: 6,
                }}
              >
                {labels.billTo}
              </div>
              {client.name && <div style={{ fontSize: 14, fontWeight: 700 }}>{client.name}</div>}
              <div style={{ fontSize: 11, lineHeight: 1.6, color: '#666' }}>
                {client.address1 && <div>{client.address1}</div>}
                {client.address2 && <div>{client.address2}</div>}
                {(client.city || client.state || client.zip) && (
                  <div>{[client.city, client.state, client.zip].filter(Boolean).join(', ')}</div>
                )}
                {client.country && <div>{client.country}</div>}
                {client.email && <div>{client.email}</div>}
              </div>
            </div>
          </div>

          {/* Line items table — alternating rows */}
          <table
            style={{
              width: '100%',
              fontSize: 12,
              marginBottom: 24,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ background: theme.primaryColor, color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                  {labels.description}
                </th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 600, width: 60 }}>
                  {labels.qty}
                </th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, width: 90 }}>
                  {labels.rate}
                </th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, width: 100 }}>
                  {labels.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 ? '#f9fafb' : 'transparent' }}>
                  <td style={{ padding: '10px 12px' }}>{item.description || '—'}</td>
                  <td style={{ textAlign: 'center', padding: '10px 8px', color: '#666' }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px 8px', color: '#666' }}>
                    {formatCurrency(item.rate, item.currency)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>
                    {formatCurrency(calcLineItemSubtotal(item), item.currency)}
                  </td>
                </tr>
              ))}
              {lineItems.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                    Add line items to see them here
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals in colored box */}
          {totals.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div
                style={{
                  background: '#f9fafb',
                  border: `1px solid ${theme.primaryColor}20`,
                  borderRadius: 6,
                  padding: 16,
                  width: 260,
                  fontSize: 12,
                }}
              >
                {totals.map((group, idx) => (
                  <div key={group.currency} style={{ marginTop: idx > 0 ? 12 : 0 }}>
                    {isMultiCurrency && (
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: theme.accentColor,
                          marginBottom: 4,
                        }}
                      >
                        {group.currency}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#666' }}>{labels.subtotal}</span>
                      <span>{formatCurrency(group.subtotal, group.currency)}</span>
                    </div>
                    {group.taxBreakdown.map((tax) => (
                      <div
                        key={tax.name}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}
                      >
                        <span style={{ color: '#666' }}>{tax.name}</span>
                        <span>{formatCurrency(tax.amount, group.currency)}</span>
                      </div>
                    ))}
                    {group.totalDiscount > 0 && (
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}
                      >
                        <span style={{ color: '#666' }}>{labels.discount}</span>
                        <span style={{ color: '#dc2626' }}>
                          -{formatCurrency(group.totalDiscount, group.currency)}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0 2px',
                        borderTop: `2px solid ${theme.primaryColor}`,
                        marginTop: 6,
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      <span>{labels.total}</span>
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
            <div
              style={{
                background: '#f9fafb',
                borderLeft: `3px solid ${theme.accentColor}`,
                padding: '12px 16px',
                fontSize: 11,
                color: '#666',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, color: theme.textColor }}>
                {labels.notes}
              </div>
              {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
