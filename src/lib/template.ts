import type { FormField, FormSettings } from '@/types'

export interface FormTemplate {
  id: string
  name: string
  description: string
  icon: string
  fields: FormField[]
  settings: Partial<FormSettings>
}

const defaultSettings: FormSettings = {
  submitLabel: 'Submit',
  successMessage: 'Thank you! We will get back to you soon.',
  bgColor: '#ffffff',
  accentColor: '#2563eb',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '8px',
  autoReplyEnabled: false,
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Us',
    description: 'Simple contact form for general inquiries',
    icon: '📬',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+91 9999999999', required: false },
      { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: true },
    ],
    settings: { submitLabel: 'Send Message', successMessage: 'Thanks! We will reach out within 24 hours.' },
  },
  {
    id: 'lead-gen',
    name: 'Lead Generation',
    description: 'Capture leads with business details',
    icon: '🎯',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Work Email', placeholder: 'you@company.com', required: true },
      { id: 'company', type: 'text', label: 'Company Name', placeholder: 'Acme Inc.', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your phone number', required: true },
      { id: 'budget', type: 'select', label: 'Budget Range', required: false, options: ['Under ₹10,000', '₹10,000 – ₹50,000', '₹50,000 – ₹2,00,000', '₹2,00,000+'] },
    ],
    settings: { submitLabel: 'Get Free Quote', successMessage: 'Great! Our team will contact you within 2 hours.' },
  },
  {
    id: 'demo-request',
    name: 'Demo Request',
    description: 'Let prospects book a product demo',
    icon: '🖥️',
    fields: [
      { id: 'name', type: 'text', label: 'Your Name', placeholder: 'Full name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { id: 'company', type: 'text', label: 'Company', placeholder: 'Company name', required: true },
      { id: 'role', type: 'select', label: 'Your Role', required: false, options: ['CEO / Founder', 'Marketing Manager', 'Sales Manager', 'Developer', 'Other'] },
      { id: 'preferred_time', type: 'text', label: 'Preferred Demo Time', placeholder: 'e.g., Monday afternoon', required: false },
    ],
    settings: { submitLabel: 'Book Demo', successMessage: 'Demo booked! You will receive a calendar invite shortly.' },
  },
  {
    id: 'quote-request',
    name: 'Quote Request',
    description: 'Get service quote requests from clients',
    icon: '💰',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your number', required: true },
      { id: 'service', type: 'select', label: 'Service Required', required: true, options: ['Web Design', 'Mobile App', 'SEO', 'Digital Marketing', 'Other'] },
      { id: 'description', type: 'textarea', label: 'Project Description', placeholder: 'Tell us about your project', required: true },
    ],
    settings: { submitLabel: 'Request Quote', successMessage: 'We will send your custom quote within 24 hours!' },
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Grow your email subscriber list',
    icon: '📧',
    fields: [
      { id: 'name', type: 'text', label: 'First Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
      { id: 'interests', type: 'checkbox', label: 'Topics of Interest', required: false, options: ['Marketing Tips', 'Industry News', 'Product Updates', 'Case Studies'] },
    ],
    settings: { submitLabel: 'Subscribe', successMessage: 'You are subscribed! Check your inbox for a welcome email.' },
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Register attendees for events or webinars',
    icon: '🎪',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your phone', required: false },
      { id: 'attendees', type: 'number', label: 'Number of Attendees', placeholder: '1', required: true },
      { id: 'dietary', type: 'select', label: 'Dietary Requirements', required: false, options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other'] },
    ],
    settings: { submitLabel: 'Register Now', successMessage: 'Registered! A confirmation email is on its way.' },
  },
  {
    id: 'feedback',
    name: 'Customer Feedback',
    description: 'Collect feedback from your customers',
    icon: '⭐',
    fields: [
      { id: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: false },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: false },
      { id: 'rating', type: 'radio', label: 'Overall Rating', required: true, options: ['⭐ 1 – Poor', '⭐⭐ 2 – Fair', '⭐⭐⭐ 3 – Good', '⭐⭐⭐⭐ 4 – Very Good', '⭐⭐⭐⭐⭐ 5 – Excellent'] },
      { id: 'feedback', type: 'textarea', label: 'Your Feedback', placeholder: 'Tell us what you think', required: true },
    ],
    settings: { submitLabel: 'Submit Feedback', successMessage: 'Thank you for your feedback! It means a lot to us.' },
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Collect applications from candidates',
    icon: '💼',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your number', required: true },
      { id: 'position', type: 'text', label: 'Position Applying For', placeholder: 'e.g., Frontend Developer', required: true },
      { id: 'experience', type: 'select', label: 'Years of Experience', required: true, options: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
      { id: 'cover', type: 'textarea', label: 'Cover Letter', placeholder: 'Why do you want to work with us?', required: false },
    ],
    settings: { submitLabel: 'Apply Now', successMessage: 'Application received! We will review and contact you soon.' },
  },
]

export const DEFAULT_SETTINGS: FormSettings = defaultSettings