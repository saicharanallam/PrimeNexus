export default function LoadingSkeleton() {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-48 mx-auto"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
