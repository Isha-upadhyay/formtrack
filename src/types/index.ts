export type FormFieldType =
  | 'text' | 'email' | 'phone' | 'textarea'
  | 'select' | 'checkbox' | 'radio' | 'number' | 'date'

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface FormSettings {
  submitLabel: string
  successMessage: string
  redirectUrl?: string
  bgColor: string
  accentColor: string
  fontFamily: string
  borderRadius: string
  autoReplyEnabled: boolean
  autoReplyTemplate?: string
  notificationEmail?: string
}

export interface FormDesign {
  bgColor?: string
  accentColor?: string
  fontFamily?: string
  borderRadius?: string
}

// matches SQL schema: status text, no updated_at
export interface Form {
  id: string
  org_id: string
  name: string
  fields: FormField[]
  settings: FormSettings
  design: FormDesign
  status: 'active' | 'paused'
  created_at: string
}

export interface Lead {
  id: string
  form_id: string
  org_id: string
  data: Record<string, string>
  source_url?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  source_summary?: string | null
  ip_address?: string | null
  created_at: string
  form?: { name: string; fields?: Array<{ id: string; label: string }> }
}

export interface Org {
  id: string
  name: string
  plan: 'free' | 'pro'
  plan_expires_at: string | null
  leads_used_this_month: number
  razorpay_payment_id: string | null
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  email: string
  created_at: string
}

// Plan limits
export const PLAN_LIMITS = {
  free: { forms: 2, leads: 100 },
  pro:  { forms: Infinity, leads: Infinity },
} as const

// Supabase Database type — must match supabase/migrations/ exactly
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          plan: string
          leads_used_this_month: number
          plan_expires_at: string | null
          razorpay_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: string
          leads_used_this_month?: number
          plan_expires_at?: string | null
          razorpay_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: string
          leads_used_this_month?: number
          plan_expires_at?: string | null
          razorpay_payment_id?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          org_id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          org_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          created_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          org_id: string
          name: string
          fields: Json
          settings: Json
          design: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          fields?: Json
          settings?: Json
          design?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          fields?: Json
          settings?: Json
          design?: Json
          status?: string
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          form_id: string
          org_id: string
          data: Json
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          source_url: string | null
          source_summary: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          org_id: string
          data: Json
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          source_url?: string | null
          source_summary?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          org_id?: string
          data?: Json
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          source_url?: string | null
          source_summary?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}