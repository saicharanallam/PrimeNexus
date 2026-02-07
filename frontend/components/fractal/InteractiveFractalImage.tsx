import { useRef, useState, MouseEvent } from 'react'
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface InteractiveFractalImageProps {
  imageUrl: string
  alt: string
  onZoomIn: (clickX: number, clickY: number) => void
  onZoomOut: () => void
  onPan: (deltaX: number, deltaY: number) => void
  onReset: () => void
  width: number
  height: number
}

export default function InteractiveFractalImage({
  imageUrl,
  alt,
  onZoomIn,
  onZoomOut,
  onPan,
  onReset,
  width,
  height,
}: InteractiveFractalImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleImageClick = (e: MouseEvent<HTMLImageElement>) => {
    if (isDragging) return // Don't zoom if we were dragging

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) / rect.width
    const clickY = (e.clientY - rect.top) / rect.height

    onZoomIn(clickX, clickY)
  }

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    setIsDragging(false)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      // If moved more than 5 pixels, consider it a drag
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true)
      }
    }
  }

  const handleMouseUp = (e: MouseEvent<HTMLImageElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const deltaX = (e.clientX - dragStart.x) / rect.width
      const deltaY = (e.clientY - dragStart.y) / rect.height

      onPan(deltaX, deltaY)
      setIsDragging(false)
    }
  }

  return (
    <div className="relative">
      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            const rect = imageRef.current?.getBoundingClientRect()
            if (rect) {
              onZoomIn(0.5, 0.5) // Zoom to center
            }
          }}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          title="Zoom In (center)"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>
        <button
          onClick={onReset}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          title="Reset View"
        >
          <ArrowPathIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Interactive image */}
      <div className="relative group">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className={`max-w-full h-auto rounded-lg shadow-lg ${
            isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          draggable={false}
        />

        {/* Hint overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all pointer-events-none rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
            Click to zoom | Drag to pan
          </div>
        </div>
      </div>
    </div>
  )
}
