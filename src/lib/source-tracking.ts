export interface SourceParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  source_url?: string
}

export function buildSourceSummary(params: SourceParams): string {
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content, source_url } = params

  if (!utm_source && !source_url) {
    return 'Direct visit — no campaign tracking detected'
  }

  if (utm_source) {
    const sourceName = formatSourceName(utm_source)
    const mediumName = utm_medium ? formatMediumName(utm_medium) : null
    const campaignName = utm_campaign ? utm_campaign.replace(/_|-/g, ' ') : null

    let summary = `Lead came from ${sourceName}`

    if (mediumName) {
      summary += ` via ${mediumName}`
    }

    if (campaignName) {
      summary += ` — Campaign: "${campaignName}"`
    }

    if (utm_term) {
      summary += ` — Keyword: "${utm_term}"`
    }

    if (utm_content) {
      summary += ` — Ad variant: "${utm_content}"`
    }

    return summary
  }

  if (source_url) {
    try {
      const url = new URL(source_url)
      const domain = url.hostname.replace('www.', '')
      const knownReferrers: Record<string, string> = {
        'google.com': 'Google Search (organic)',
        'facebook.com': 'Facebook (organic)',
        'instagram.com': 'Instagram (organic)',
        'linkedin.com': 'LinkedIn (organic)',
        'twitter.com': 'Twitter / X (organic)',
        'x.com': 'Twitter / X (organic)',
        'youtube.com': 'YouTube',
        'bing.com': 'Bing Search (organic)',
      }
      return `Lead came from ${knownReferrers[domain] || domain}`
    } catch {
      return 'Lead came from an external referral'
    }
  }

  return 'Source unknown'
}

function formatSourceName(source: string): string {
  const map: Record<string, string> = {
    google: 'Google Ads',
    facebook: 'Facebook Ads',
    fb: 'Facebook Ads',
    instagram: 'Instagram Ads',
    ig: 'Instagram Ads',
    linkedin: 'LinkedIn Ads',
    twitter: 'Twitter / X Ads',
    bing: 'Bing Ads',
    email: 'Email Campaign',
    newsletter: 'Newsletter',
    sms: 'SMS Campaign',
    whatsapp: 'WhatsApp',
    organic: 'Organic Search',
    direct: 'Direct',
  }
  return map[source.toLowerCase()] || source
}

function formatMediumName(medium: string): string {
  const map: Record<string, string> = {
    cpc: 'paid search (CPC)',
    ppc: 'pay-per-click',
    email: 'email',
    social: 'social media',
    organic: 'organic search',
    referral: 'referral',
    affiliate: 'affiliate',
    display: 'display advertising',
    banner: 'banner ad',
    video: 'video ad',
  }
  return map[medium.toLowerCase()] || medium
}