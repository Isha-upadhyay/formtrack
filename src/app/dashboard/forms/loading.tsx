import { Skeleton } from "@/components/ui/Skeleton"

export default function FormsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
           <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl w-full md:w-auto shadow-sm">
              <div className="flex-1 md:w-32">
                 <div className="flex justify-between items-center mb-1.5">
                    <Skeleton className="h-2 w-10" />
                    <Skeleton className="h-2 w-8" />
                 </div>
                 <Skeleton className="h-1 w-full" />
              </div>
              <Skeleton className="w-10 h-10 rounded-xl" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
               <Skeleton className="w-10 h-10 rounded-xl" />
               <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
