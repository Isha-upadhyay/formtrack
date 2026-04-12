import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FormActions from './FormActions'

export default async function FormsPage() {
  const supabase = await createClient()

  const { data: formsRaw } = await supabase
    .from('forms')
    .select('*') as any

  const forms = (formsRaw ?? []) as Array<{
    id: string
    name: string
    description: string
    is_active: boolean
    created_at: string
    fields: any[]
  }>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your lead capture forms</p>
        </div>
        <Link href="/dashboard/forms/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No forms yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Create your first form and start capturing leads with source tracking
          </p>
          <Link href="/dashboard/forms/new"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{form.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    form.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {form.description && (
                  <p className="text-sm text-gray-500 mb-2">{form.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {form.fields?.length ?? 0} fields · Created {new Date(form.created_at).toLocaleDateString()}
                </p>
              </div>
              <FormActions formId={form.id} isActive={form.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}