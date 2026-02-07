import { FractalPreset, FractalTypeInfo } from '../types/fractal'

// Mandelbrot presets - famous locations
export const mandelbrotPresets: FractalPreset[] = [
  {
    name: 'Overview',
    description: 'Full view of the Mandelbrot set',
    params: {
      type: 'mandelbrot',
      zoom: 1.0,
      centerX: -0.5,
      centerY: 0.0,
      maxIterations: 100,
    },
  },
  {
    name: 'Seahorse Valley',
    description: 'Intricate seahorse-like structures',
    params: {
      type: 'mandelbrot',
      zoom: 200.0,
      centerX: -0.745,
      centerY: 0.186,
      maxIterations: 150,
    },
  },
  {
    name: 'Elephant Valley',
    description: 'Elephant-shaped bulbs',
    params: {
      type: 'mandelbrot',
      zoom: 100.0,
      centerX: 0.282,
      centerY: -0.01,
      maxIterations: 150,
    },
  },
  {
    name: 'Spiral',
    description: 'Beautiful spiral patterns',
    params: {
      type: 'mandelbrot',
      zoom: 500.0,
      centerX: -0.7746,
      centerY: 0.1102,
      maxIterations: 200,
    },
  },
  {
    name: 'Mini Mandelbrot',
    description: 'Tiny copy of the main set',
    params: {
      type: 'mandelbrot',
      zoom: 1000.0,
      centerX: -0.1592,
      centerY: 1.0317,
      maxIterations: 250,
    },
  },
  {
    name: 'Triple Spiral',
    description: 'Three intertwined spirals',
    params: {
      type: 'mandelbrot',
      zoom: 800.0,
      centerX: -0.761,
      centerY: 0.0865,
      maxIterations: 200,
    },
  },
]

// Julia set presets - interesting c values
export const juliaPresets: FractalPreset[] = [
  {
    name: 'Classic Julia',
    description: 'Classic Julia set shape',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: -0.7,
      juliaCImag: 0.27,
      maxIterations: 100,
    },
  },
  {
    name: 'Dendrite',
    description: 'Tree-like fractal structure',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: 0.0,
      juliaCImag: 1.0,
      maxIterations: 100,
    },
  },
  {
    name: 'San Marco Dragon',
    description: 'Dragon-like appearance',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: -0.75,
      juliaCImag: 0.11,
      maxIterations: 100,
    },
  },
  {
    name: 'Siegel Disk',
    description: 'Circular fractal disk',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: -0.391,
      juliaCImag: -0.587,
      maxIterations: 100,
    },
  },
  {
    name: 'Douady Rabbit',
    description: 'Rabbit-like shape',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: -0.123,
      juliaCImag: 0.745,
      maxIterations: 100,
    },
  },
  {
    name: 'Spiral Julia',
    description: 'Spiral pattern',
    params: {
      type: 'julia',
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      juliaCReal: 0.285,
      juliaCImag: 0.01,
      maxIterations: 100,
    },
  },
]

// Sierpinski presets
export const sierpinskiPresets: FractalPreset[] = [
  {
    name: 'Low Detail',
    description: 'Basic Sierpinski triangle',
    params: {
      type: 'sierpinski',
      recursionDepth: 4,
    },
  },
  {
    name: 'Medium Detail',
    description: 'Moderate detail level',
    params: {
      type: 'sierpinski',
      recursionDepth: 6,
    },
  },
  {
    name: 'High Detail',
    description: 'Maximum detail level',
    params: {
      type: 'sierpinski',
      recursionDepth: 8,
    },
  },
]

// Koch snowflake presets
export const kochPresets: FractalPreset[] = [
  {
    name: 'Low Detail',
    description: 'Basic Koch snowflake',
    params: {
      type: 'koch',
      recursionDepth: 3,
    },
  },
  {
    name: 'Medium Detail',
    description: 'Moderate detail level',
    params: {
      type: 'koch',
      recursionDepth: 4,
    },
  },
  {
    name: 'High Detail',
    description: 'High detail level',
    params: {
      type: 'koch',
      recursionDepth: 5,
    },
  },
  {
    name: 'Maximum Detail',
    description: 'Maximum detail (may be slow)',
    params: {
      type: 'koch',
      recursionDepth: 6,
    },
  },
]

export const getPresetsForType = (type: string): FractalPreset[] => {
  switch (type) {
    case 'mandelbrot':
      return mandelbrotPresets
    case 'julia':
      return juliaPresets
    case 'sierpinski':
      return sierpinskiPresets
    case 'koch':
      return kochPresets
    default:
      return []
  }
}

// Fractal type information
export const fractalTypes: FractalTypeInfo[] = [
  {
    id: 'mandelbrot',
    name: 'Mandelbrot Set',
    description: 'The iconic fractal discovered by Benoit Mandelbrot',
    category: 'iterative',
    supportsZoom: true,
    supportsColorSchemes: true,
    defaultParams: {
      type: 'mandelbrot',
      width: 800,
      height: 600,
      zoom: 1.0,
      centerX: -0.5,
      centerY: 0.0,
      maxIterations: 100,
      colorScheme: 'default',
    },
  },
  {
    id: 'julia',
    name: 'Julia Set',
    description: 'Beautiful fractal sets with varying complex parameters',
    category: 'iterative',
    supportsZoom: true,
    supportsColorSchemes: true,
    defaultParams: {
      type: 'julia',
      width: 800,
      height: 600,
      zoom: 1.0,
      centerX: 0.0,
      centerY: 0.0,
      maxIterations: 100,
      colorScheme: 'default',
      juliaCReal: -0.7,
      juliaCImag: 0.27,
    },
  },
  {
    id: 'sierpinski',
    name: 'Sierpinski Triangle',
    description: 'Classic geometric fractal with self-similar triangles',
    category: 'geometric',
    supportsZoom: false,
    supportsColorSchemes: true,
    defaultParams: {
      type: 'sierpinski',
      width: 800,
      height: 600,
      recursionDepth: 6,
      colorScheme: 'default',
    },
  },
  {
    id: 'koch',
    name: 'Koch Snowflake',
    description: 'Snowflake-like fractal curve',
    category: 'geometric',
    supportsZoom: false,
    supportsColorSchemes: false,
    defaultParams: {
      type: 'koch',
      width: 800,
      height: 600,
      recursionDepth: 4,
      colorScheme: 'default',
    },
  },
]

export const getFractalTypeInfo = (type: string): FractalTypeInfo | undefined => {
  return fractalTypes.find((t) => t.id === type)
}
