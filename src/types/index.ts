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

export interface Form {
  id: string
  org_id: string
  name: string
  description?: string
  fields: FormField[]
  settings: FormSettings
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  form_id: string
  org_id: string
  data: Record<string, string>
  source_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  source_summary?: string
  created_at: string
  form?: { name: string; fields?: Array<{ id: string; label: string }> }
}

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
}

export interface Subscription {
  id: string
  org_id: string
  plan: 'free' | 'pro'
  status: 'active' | 'inactive' | 'cancelled'
  razorpay_payment_id?: string
  razorpay_order_id?: string
  created_at: string
}

// ─── Plan limits ──────────────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  free: { forms: 2, leads: 100 },
  pro:  { forms: Infinity, leads: Infinity },
} as const

// ─── Supabase Database type (must match exact Supabase format) ────────────────
// Supabase uses Json type for jsonb columns — we cast in usage, not here
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          created_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          fields: Json
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          fields?: Json
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          fields?: Json
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          form_id: string
          org_id: string
          data: Json
          source_url: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          source_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          org_id: string
          data: Json
          source_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          source_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          org_id?: string
          data?: Json
          source_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          source_summary?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          org_id: string
          plan: string
          status: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          plan: string
          status: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          plan?: string
          status?: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}