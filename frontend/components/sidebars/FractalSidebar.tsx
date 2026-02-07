import { CubeIcon, SwatchIcon, StarIcon } from '@heroicons/react/24/outline'
import { FractalType } from '../../src/types/fractal'
import { fractalTypes } from '../../src/utils/fractalPresets'

interface FractalSidebarProps {
  collapsed: boolean
  fractalType?: FractalType
  onFractalTypeChange?: (type: FractalType) => void
}

export default function FractalSidebar({ collapsed, fractalType, onFractalTypeChange }: FractalSidebarProps) {
  const currentType = fractalType || 'mandelbrot'

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 transition-colors">
            Fractal Explorer
          </h2>
        )}
      </div>

      {/* Fractal Content */}
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        {!collapsed && (
          <div className="space-y-4">
            {/* Fractal Type Selector */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Fractal Type
              </h3>
              <div className="space-y-1">
                {fractalTypes.map((type) => {
                  const isActive = currentType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => onFractalTypeChange?.(type.id)}
                      className={`group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/80 via-sky-500/70 to-emerald-500/60 text-white dark:text-slate-50 shadow-md shadow-sky-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      } transition-colors`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isActive
                            ? 'border-white/0 bg-white/20 dark:bg-slate-950/30'
                            : 'border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60'
                        }`}
                      >
                        <CubeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{type.name}</span>
                        <span className="text-xs opacity-75 block truncate">{type.category}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Info Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800/50">
                {(() => {
                  const info = fractalTypes.find((t) => t.id === currentType)
                  return (
                    <>
                      <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                        {info?.name}
                      </h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        {info?.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {info?.supportsZoom && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                            Zoomable
                          </span>
                        )}
                        {info?.supportsColorSchemes && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                            Color Schemes
                          </span>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Quick Tips
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <StarIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Try presets to explore famous fractal locations</span>
                </div>
                <div className="flex items-start gap-2">
                  <SwatchIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Experiment with different color schemes for stunning visuals</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
