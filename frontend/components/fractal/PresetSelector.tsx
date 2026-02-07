import { StarIcon } from '@heroicons/react/24/outline'
import { FractalPreset, FractalType } from '../../src/types/fractal'
import { getPresetsForType } from '../../src/utils/fractalPresets'

interface PresetSelectorProps {
  fractalType: FractalType
  onSelectPreset: (preset: FractalPreset) => void
  disabled?: boolean
}

export default function PresetSelector({ fractalType, onSelectPreset, disabled }: PresetSelectorProps) {
  const presets = getPresetsForType(fractalType)

  if (presets.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <StarIcon className="h-4 w-4" />
        Presets
      </label>
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPreset(preset)}
            disabled={disabled}
            className={`p-3 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {preset.name}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
