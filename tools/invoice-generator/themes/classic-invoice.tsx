'use client'

import type { InvoiceState } from '../invoice-types'
import { calcGroupedTotals, formatCurrency, calcLineItemSubtotal } from '../shared/invoice-calculations'

interface ThemeLayoutProps {
  invoice: InvoiceState
}

function ContactBlock({ contact }: { contact: InvoiceState['sender'] }) {
  if (!contact.name && !contact.email) return null
  return (
    <div className="text-xs leading-relaxed" style={{ color: '#666' }}>
      {contact.address1 && <div>{contact.address1}</div>}
      {contact.address2 && <div>{contact.address2}</div>}
      {(contact.city || contact.state || contact.zip) && (
        <div>
          {[contact.city, contact.state, contact.zip].filter(Boolean).join(', ')}
        </div>
      )}
      {contact.country && <div>{contact.country}</div>}
      {contact.email && <div>{contact.email}</div>}
      {contact.phone && <div>{contact.phone}</div>}
      {contact.taxId && <div>Tax ID: {contact.taxId}</div>}
    </div>
  )
}

export function ClassicInvoice({ invoice }: ThemeLayoutProps) {
  const { sender, client, theme, labels, lineItems, taxPresets, logo } = invoice
  const totals = calcGroupedTotals(lineItems, taxPresets)
  const isMultiCurrency = totals.length > 1

  const logoEl = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="Logo" style={{ maxHeight: 64, maxWidth: 200, objectFit: 'contain' }} />
  ) : null

  const headerJustify =
    theme.logoPosition === 'top-right'
      ? 'space-between'
      : theme.logoPosition === 'top-center'
        ? 'center'
        : 'space-between'

  return (
    <div style={{ color: theme.textColor }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: headerJustify,
          alignItems: 'flex-start',
          marginBottom: 32,
          flexDirection: theme.logoPosition === 'top-center' ? 'column' : 'row',
        }}
      >
        {theme.logoPosition === 'top-left' && logoEl && <div style={{ marginRight: 16 }}>{logoEl}</div>}
        <div style={theme.logoPosition === 'top-center' ? { textAlign: 'center', marginBottom: 16 } : {}}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: theme.primaryColor,
              margin: 0,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {labels.invoice}
          </h1>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            <div style={{ fontWeight: 600, color: theme.textColor }}>{invoice.invoiceNumber}</div>
            <div>
              {labels.date}: {invoice.issueDate}
            </div>
            <div>
              {labels.dueDate}: {invoice.dueDate}
            </div>
            {invoice.reference && <div style={{ color: '#999' }}>Ref: {invoice.reference}</div>}
          </div>
        </div>
        {(theme.logoPosition === 'top-right' || theme.logoPosition === 'top-center') && logoEl}
      </div>

      {/* From / Bill To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#999',
              marginBottom: 4,
            }}
          >
            {labels.from}
          </div>
          {sender.name && (
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{sender.name}</div>
          )}
          <ContactBlock contact={sender} />
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#999',
              marginBottom: 4,
            }}
          >
            {labels.billTo}
          </div>
          {client.name && (
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{client.name}</div>
          )}
          <ContactBlock contact={client} />
        </div>
      </div>

      {/* Line items table */}
      <table style={{ width: '100%', fontSize: 12, marginBottom: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${theme.primaryColor}` }}>
            <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>{labels.description}</th>
            <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 600, width: 60 }}>
              {labels.qty}
            </th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, width: 90 }}>
              {labels.rate}
            </th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, width: 90 }}>
              {labels.amount}
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0' }}>{item.description || '—'}</td>
              <td style={{ textAlign: 'center', padding: '8px 0', color: '#666' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '8px 0', color: '#666' }}>
                {formatCurrency(item.rate, item.currency)}
              </td>
              <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>
                {formatCurrency(calcLineItemSubtotal(item), item.currency)}
              </td>
            </tr>
          ))}
          {lineItems.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#999', fontSize: 11 }}>
                Add line items to see them here
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      {totals.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <div style={{ width: 240, fontSize: 12 }}>
            {totals.map((group, idx) => (
              <div key={group.currency} style={{ marginTop: idx > 0 ? 12 : 0 }}>
                {isMultiCurrency && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      color: '#999',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
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
                    padding: '6px 0 2px',
                    borderTop: '1px solid #ddd',
                    marginTop: 4,
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {labels.total}
                    {isMultiCurrency ? ` (${group.currency})` : ''}
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

      {/* Notes */}
      {invoice.notes && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#999',
              marginBottom: 4,
            }}
          >
            {labels.notes}
          </div>
          <div style={{ fontSize: 11, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {invoice.notes}
          </div>
        </div>
      )}
    </div>
  )
}
