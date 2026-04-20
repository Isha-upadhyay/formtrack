import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FormActions from './FormActions'

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: formsRaw } = await supabase.from('forms').select('*') as any
  const forms = (formsRaw ?? []) as Array<{
    id: string; name: string; description: string; is_active: boolean; created_at: string; fields: any[]
  }>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forms</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Create and manage your lead capture forms</p>
        </div>
        <Link href="/dashboard/forms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-500/20">
          + New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No forms yet</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            Create your first form and start capturing leads with source tracking
          </p>
          <Link href="/dashboard/forms/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-sm shadow-blue-500/20">
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id}
              className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5 flex items-center justify-between hover:shadow-md dark:hover:shadow-black/20 hover:border-gray-200 dark:hover:border-white/12 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{form.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    form.is_active
                      ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-slate-400'
                  }`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {form.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{form.description}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-slate-500">
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