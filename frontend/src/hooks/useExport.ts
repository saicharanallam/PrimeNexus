import { useState } from 'react'

interface UseExportProps {
  rustUrl: string
  fractalType: string
  params: Record<string, any>
}

export const useExport = ({ rustUrl, fractalType, params }: UseExportProps) => {
  const [exporting, setExporting] = useState(false)

  const exportHighRes = async () => {
    setExporting(true)
    try {
      // Generate high-res version (2x resolution)
      const highResParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'width') {
          highResParams.append(key, (value * 2).toString())
        } else if (key === 'height') {
          highResParams.append(key, (value * 2).toString())
        } else {
          highResParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${rustUrl}/api/fractal?${highResParams}`)
      if (!response.ok) {
        throw new Error(`Failed to generate high-res image: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Download the image
      const link = document.createElement('a')
      link.href = url
      link.download = `${fractalType}-highres-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting high-res image:', error)
      alert('Failed to export high-res image. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return { exportHighRes, exporting }
}
