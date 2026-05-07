/**
 * Utility to send a POST request to an external webhook (Slack/Discord/Custom).
 */
export async function triggerWebhook(url: string, data: {
  formName: string;
  leadData: Record<string, any>;
  sourceSummary?: string;
}) {
  if (!url) return;

  try {
    // Format message for common platforms
    let payload: any = {
      text: `🎯 *New Lead Captured!* (${data.formName})`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎯 *New Lead Captured!* (${data.formName})`
          }
        },
        {
          type: "section",
          fields: Object.entries(data.leadData).map(([k, v]) => ({
            type: "mrkdwn",
            text: `*${k}:*\n${v}`
          })).slice(0, 10) // Limit to 10 fields for Slack compatibility
        }
      ]
    };

    if (data.sourceSummary) {
      payload.blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📍 *Source:* ${data.sourceSummary}`
          }
        ]
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Webhook failed:', await res.text());
    }
  } catch (err) {
    console.error('Webhook Error:', err);
  }
}
