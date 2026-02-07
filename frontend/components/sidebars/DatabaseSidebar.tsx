import { TableCellsIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface DatabaseSidebarProps {
  collapsed: boolean
}

export default function DatabaseSidebar({ collapsed }: DatabaseSidebarProps) {
  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 transition-colors">
            Database Tools
          </h2>
        )}
      </div>

      {/* Database Content */}
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        {!collapsed && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <button className="group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 transition-colors">
                    <TableCellsIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">View Tables</span>
                </button>

                <button className="group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 transition-colors">
                    <FunnelIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Filter Data</span>
                </button>

                <button className="group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Export Data</span>
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center transition-colors">
                Database browser tools and filters will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
