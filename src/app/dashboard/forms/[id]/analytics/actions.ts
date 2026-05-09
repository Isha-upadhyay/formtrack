'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function generateAIInsights(formId: string) {
  const supabase = await createClient()

  // 1. Verify access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Fetch form and leads
  const { data: form } = await (supabase.from('forms') as any)
    .select('name, fields')
    .eq('id', formId)
    .single()

  if (!form) return { error: 'Form not found' }

  const { data: leads } = await (supabase.from('leads') as any)
    .select('data, utm_source, source_summary, created_at')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(100) // Only analyze last 100 to save tokens

  if (!leads || leads.length === 0) {
    return { error: 'Not enough data yet. Collect some leads to generate insights!' }
  }

  // 3. Prepare prompt
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { error: 'Gemini API key is not configured.' }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
    You are an expert Marketing Data Analyst. 
    Analyze the following form performance data and provide exactly 3 actionable insights in short, crisp bullet points.
    Do not use generic advice; reference the specific form fields and traffic sources.
    
    Form Name: ${form.name}
    Fields: ${JSON.stringify(form.fields.map((f: any) => f.label))}
    Total Leads Provided (sample): ${leads.length}
    
    Lead Data Sample:
    ${JSON.stringify(leads.slice(0, 20))}
    
    Format output as HTML unordered list (<ul><li>...</li></ul>) using Tailwind CSS classes for styling: 'space-y-3 text-sm text-white/90'. Highlight important metrics or keywords using <strong class="text-indigo-300">.
  `

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    
    return { insights: response.text }
  } catch (err: any) {
    console.error('Gemini error:', err)
    return { error: 'Failed to generate insights. ' + (err.message || '') }
  }
}
