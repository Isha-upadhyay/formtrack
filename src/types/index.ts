export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'date'

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // for select, radio, checkbox
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
  form?: { name: string }
}

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at'>
        Update: Partial<Omit<Organization, 'id'>>
      }
      forms: {
        Row: Form
        Insert: Omit<Form, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Form, 'id'>>
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at'>
        Update: Partial<Omit<Lead, 'id'>>
      }
    }
  }
}