interface FractalControlsProps {
  width: number
  height: number
  onWidthChange: (width: number) => void
  onHeightChange: (height: number) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
  centerX?: number
  centerY?: number
  onCenterXChange?: (x: number) => void
  onCenterYChange?: (y: number) => void
  maxIterations?: number
  onMaxIterationsChange?: (iterations: number) => void
  recursionDepth?: number
  onRecursionDepthChange?: (depth: number) => void
  disabled?: boolean
}

export default function FractalControls({
  width,
  height,
  onWidthChange,
  onHeightChange,
  zoom,
  onZoomChange,
  centerX,
  centerY,
  onCenterXChange,
  onCenterYChange,
  maxIterations,
  onMaxIterationsChange,
  recursionDepth,
  onRecursionDepthChange,
  disabled,
}: FractalControlsProps) {
  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Width</label>
          <input
            type="number"
            value={width}
            onChange={(e) => onWidthChange(parseInt(e.target.value) || 800)}
            min={400}
            max={2048}
            disabled={disabled}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Height</label>
          <input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(parseInt(e.target.value) || 600)}
            min={400}
            max={2048}
            disabled={disabled}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Zoom (for iterative fractals) */}
      {zoom !== undefined && onZoomChange && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Zoom: {zoom.toFixed(2)}
          </label>
          <input
            type="range"
            value={Math.log10(zoom)}
            onChange={(e) => onZoomChange(Math.pow(10, parseFloat(e.target.value)))}
            min={0}
            max={6}
            step={0.1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1x</span>
            <span>1M x</span>
          </div>
        </div>
      )}

      {/* Center coordinates (for iterative fractals) */}
      {centerX !== undefined && centerY !== undefined && onCenterXChange && onCenterYChange && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Center X</label>
            <input
              type="number"
              value={centerX}
              onChange={(e) => onCenterXChange(parseFloat(e.target.value) || 0)}
              step={0.1}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Center Y</label>
            <input
              type="number"
              value={centerY}
              onChange={(e) => onCenterYChange(parseFloat(e.target.value) || 0)}
              step={0.1}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Max iterations (for iterative fractals) */}
      {maxIterations !== undefined && onMaxIterationsChange && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Max Iterations: {maxIterations}
          </label>
          <input
            type="range"
            value={maxIterations}
            onChange={(e) => onMaxIterationsChange(parseInt(e.target.value))}
            min={50}
            max={500}
            step={10}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>50</span>
            <span>500</span>
          </div>
        </div>
      )}

      {/* Recursion depth (for geometric fractals) */}
      {recursionDepth !== undefined && onRecursionDepthChange && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Recursion Depth: {recursionDepth}
          </label>
          <input
            type="range"
            value={recursionDepth}
            onChange={(e) => onRecursionDepthChange(parseInt(e.target.value))}
            min={1}
            max={10}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      )}
    </div>
  )
}
