import React from 'react'

const MANA_COLORS: { value: string; label: string; color: string }[] = [
  { value: 'W', label: 'White', color: 'bg-white text-black' },
  { value: 'U', label: 'Blue', color: 'bg-blue-500 text-white' },
  { value: 'B', label: 'Black', color: 'bg-gray-800 text-white' },
  { value: 'R', label: 'Red', color: 'bg-red-500 text-white' },
  { value: 'G', label: 'Green', color: 'bg-green-500 text-white' },
  { value: 'C', label: 'Colorless', color: 'bg-gray-400 text-white' }
]

interface ColorBadgesProps {
  colors: string[]
  className?: string
}

export const ColorBadges: React.FC<ColorBadgesProps> = ({ colors, className = '' }) => {
  if (colors.length === 0) return null

  return (
    <div className={`flex gap-1 mt-1 ${className}`}>
      {colors.map(color => {
        const colorInfo = MANA_COLORS.find(c => c.value === color)
        return colorInfo ? (
          <span
            key={color}
            className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${colorInfo.color}`}
            title={colorInfo.label}
          >
            {color}
          </span>
        ) : null
      })}
    </div>
  )
}
