import { MANA_COLORS } from '../constants/mana'

export const getGradientFromColors = (colors: string[]): React.CSSProperties => {
  if (colors.length === 0) {
    return {
      background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)'
    }
  }

  if (colors.length === 1) {
    const colorInfo = MANA_COLORS.find(c => c.value === colors[0])
    const colorValue = colorInfo?.gradientColor || MANA_COLORS.find(c => c.value === 'C')?.gradientColor || '#f9fafb'

    return {
      background: `linear-gradient(to bottom right, ${colorValue}, ${colorValue})`
    }
  }

  // For multiple colors, create a multi-stop gradient
  const gradientStops = colors
    .map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100
      const colorInfo = MANA_COLORS.find(c => c.value === color)
      const colorValue = colorInfo?.gradientColor || MANA_COLORS.find(c => c.value === 'C')?.gradientColor || '#f9fafb'

      return `${colorValue} ${percentage}%`
    })
    .join(', ')

  return {
    background: `linear-gradient(to bottom right, ${gradientStops})`
  }
}
