import { Skeleton } from "@/components/ui/Skeleton"

export default function LeadsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Graph Skeleton */}
      <div className="bg-white dark:bg-[#0d1117] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3 mb-8">
           <Skeleton className="w-10 h-10 rounded-2xl" />
           <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>

      {/* Search & List Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
