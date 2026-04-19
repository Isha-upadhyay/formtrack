/**
 * Send lead notification email via any SMTP-compatible provider.
 * Uses the Resend API (free tier: 3000 emails/month).
 * Set RESEND_API_KEY in .env.local
 * If key not set, silently skips (won't break form submissions).
 */

export async function sendLeadNotification({
  toEmail,
  formName,
  leadData,
  sourceSummary,
}: {
  toEmail: string
  formName: string
  leadData: Record<string, string>
  sourceSummary?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return  // gracefully skip if not configured

  const dataRows = Object.entries(leadData)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">${k}</td><td style="padding:6px 12px;font-weight:600;font-size:13px;">${v}</td></tr>`)
    .join('')

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <div style="background:#2563eb;color:#fff;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="margin:0;font-size:18px;">🎯 New Lead — ${formName}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        ${dataRows}
      </table>
      ${sourceSummary ? `
      <div style="margin-top:16px;padding:12px 16px;background:#eff6ff;border-radius:8px;font-size:13px;color:#1d4ed8;">
        📍 ${sourceSummary}
      </div>` : ''}
      <p style="font-size:12px;color:#9ca3af;margin-top:20px;text-align:center;">Sent by FormTrack</p>
    </div>
  `

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FormTrack <notifications@formtrack.app>',
        to: [toEmail],
        subject: `New lead from ${formName}`,
        html,
      }),
    })
  } catch (err) {
    console.error('Lead notification email failed:', err)
    // Don't throw — email failure should not break form submission
  }
}