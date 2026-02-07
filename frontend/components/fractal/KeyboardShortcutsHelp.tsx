import { useState } from 'react'
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Shortcut {
  key: string
  description: string
}

const shortcuts: Shortcut[] = [
  { key: 'Space', description: 'Generate/Regenerate fractal' },
  { key: 'R', description: 'Reset view to default' },
  { key: 'E', description: 'Export current image' },
  { key: '+', description: 'Zoom in (center)' },
  { key: '-', description: 'Zoom out' },
  { key: '?', description: 'Show this help' },
]

export default function KeyboardShortcutsHelp() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-30 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
        title="Keyboard Shortcuts (Press ?)"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-2">
              {shortcuts.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {shortcut.description}
                  </span>
                  <kbd className="px-3 py-1 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              Press ESC to close this dialog
            </p>
          </div>
        </div>
      )}
    </>
  )
}
