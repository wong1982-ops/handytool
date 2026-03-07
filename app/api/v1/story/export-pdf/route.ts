import { createClient } from '@/lib/supabase/server'
import { API_ERRORS } from '@/lib/api/response'
import { exportPdfRequestSchema } from '@/lib/story/types'
import { generateBookPdf } from '@/lib/story/export-pdf'
import { CREDIT_COSTS } from '@/lib/story/validation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = exportPdfRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.exportPdf,
    p_description: 'Story Studio — PDF export',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const pdfBytes = await generateBookPdf(parsed.data)
    const filename = `${parsed.data.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (err) {
    console.error('story/export-pdf: failed', err)
    try {
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: CREDIT_COSTS.exportPdf,
        p_description: 'Story Studio — PDF export failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }
    return API_ERRORS.INTERNAL()
  }
}
