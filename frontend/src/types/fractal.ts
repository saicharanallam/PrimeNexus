export type FractalType = 'mandelbrot' | 'julia' | 'sierpinski' | 'koch'

export type ColorScheme = 'default' | 'fire' | 'ice' | 'rainbow' | 'grayscale'

export interface BaseFractalParams {
  width: number
  height: number
  zoom: number
  centerX: number
  centerY: number
  maxIterations: number
  colorScheme: ColorScheme
}

export interface MandelbrotParams extends BaseFractalParams {
  type: 'mandelbrot'
}

export interface JuliaParams extends BaseFractalParams {
  type: 'julia'
  juliaCReal: number
  juliaCImag: number
}

export interface SierpinskiParams {
  type: 'sierpinski'
  width: number
  height: number
  recursionDepth: number
  colorScheme: ColorScheme
}

export interface KochParams {
  type: 'koch'
  width: number
  height: number
  recursionDepth: number
  colorScheme: ColorScheme
}

export type FractalParams = MandelbrotParams | JuliaParams | SierpinskiParams | KochParams

export interface FractalPreset {
  name: string
  description: string
  params: Partial<FractalParams>
  thumbnail?: string
}

export interface ColorSchemeInfo {
  id: ColorScheme
  name: string
  description: string
  preview: string[] // Array of color hex codes for preview
}

export interface FractalTypeInfo {
  id: FractalType
  name: string
  description: string
  category: 'iterative' | 'geometric'
  supportsZoom: boolean
  supportsColorSchemes: boolean
  defaultParams: FractalParams
}

export interface RenderState {
  isLoading: boolean
  error: string | null
  imageUrl: string | null
  renderTime: number | null
}
