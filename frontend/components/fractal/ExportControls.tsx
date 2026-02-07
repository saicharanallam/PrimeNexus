import { useState } from 'react'
import { ArrowDownTrayIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface ExportControlsProps {
  imageUrl: string | null
  params: Record<string, any>
  fractalType: string
  onExportHighRes: () => void
  disabled?: boolean
}

export default function ExportControls({
  imageUrl,
  params,
  fractalType,
  onExportHighRes,
  disabled,
}: ExportControlsProps) {
  const [exportingHighRes, setExportingHighRes] = useState(false)

  const handleDownloadCurrent = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${fractalType}-fractal-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadHighRes = async () => {
    setExportingHighRes(true)
    try {
      await onExportHighRes()
    } finally {
      setExportingHighRes(false)
    }
  }

  const handleExportParams = () => {
    const paramsJson = JSON.stringify(params, null, 2)
    const blob = new Blob([paramsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${fractalType}-params-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50 flex items-center gap-2">
        <ArrowDownTrayIcon className="h-4 w-4" />
        Export Options
      </h3>
      <div className="space-y-2">
        {/* Download Current Image */}
        <button
          onClick={handleDownloadCurrent}
          disabled={!imageUrl || disabled}
          className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <PhotoIcon className="h-4 w-4" />
          Download PNG
        </button>

        {/* Download High-Res */}
        <button
          onClick={handleDownloadHighRes}
          disabled={!imageUrl || disabled || exportingHighRes}
          className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <PhotoIcon className="h-4 w-4" />
          {exportingHighRes ? 'Generating...' : 'Export High-Res (2x)'}
        </button>

        {/* Export Parameters */}
        <button
          onClick={handleExportParams}
          disabled={disabled}
          className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <DocumentTextIcon className="h-4 w-4" />
          Export Parameters (JSON)
        </button>
      </div>
    </div>
  )
}
