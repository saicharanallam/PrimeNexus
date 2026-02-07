import { ColorScheme } from '../../src/types/fractal'
import { colorSchemes } from '../../src/utils/colorSchemes'

interface ColorSchemeSelectorProps {
  value: ColorScheme
  onChange: (scheme: ColorScheme) => void
  disabled?: boolean
}

export default function ColorSchemeSelector({ value, onChange, disabled }: ColorSchemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Color Scheme
      </label>
      <div className="grid grid-cols-1 gap-2">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => onChange(scheme.id)}
            disabled={disabled}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              value === scheme.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Color preview */}
            <div className="flex gap-1">
              {scheme.preview.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Scheme info */}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {scheme.name}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {scheme.description}
              </div>
            </div>

            {/* Selected indicator */}
            {value === scheme.id && (
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
