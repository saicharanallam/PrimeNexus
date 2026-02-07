import { ColorScheme, ColorSchemeInfo } from '../types/fractal'

export const colorSchemes: ColorSchemeInfo[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Smooth gradient with vibrant colors',
    preview: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0000FF'],
  },
  {
    id: 'fire',
    name: 'Fire',
    description: 'Hot colors ranging from red to yellow',
    preview: ['#FF0000', '#FF3200', '#FF6400', '#FF9600', '#FFC800'],
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'Cool colors ranging from blue to cyan',
    preview: ['#6496FF', '#64C8FF', '#64DCFF', '#64F0FF', '#64FFFF'],
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Full spectrum of rainbow colors',
    preview: ['#FF0000', '#FFFF00', '#00FF00', '#0000FF', '#FF00FF'],
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Black and white gradient',
    preview: ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
  },
]

export const getColorScheme = (id: ColorScheme): ColorSchemeInfo | undefined => {
  return colorSchemes.find((scheme) => scheme.id === id)
}

export const getColorSchemeName = (id: ColorScheme): string => {
  return getColorScheme(id)?.name || 'Unknown'
}
