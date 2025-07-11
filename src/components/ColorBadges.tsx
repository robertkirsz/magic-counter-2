import React from 'react'

const MANA_COLORS: { value: string; label: string; filename: string }[] = [
  { value: 'W', label: 'White', filename: 'w.svg' },
  { value: 'U', label: 'Blue', filename: 'u.svg' },
  { value: 'B', label: 'Black', filename: 'b.svg' },
  { value: 'R', label: 'Red', filename: 'r.svg' },
  { value: 'G', label: 'Green', filename: 'g.svg' },
  { value: 'C', label: 'Colorless', filename: 'c.svg' }
]

interface ColorBadgesProps {
  colors: string[]
  className?: string
}

export const ColorBadges: React.FC<ColorBadgesProps> = ({ colors, className = '' }) => {
  if (colors.length === 0) return null

  return (
    <div className={`flex gap-1 ${className}`}>
      {colors.map(color => {
        const colorInfo = MANA_COLORS.find(c => c.value === color)

        return colorInfo ? (
          <img
            key={color}
            src={`/mana/${colorInfo.filename}`}
            alt={colorInfo.label}
            title={colorInfo.label}
            className="w-4 h-4"
          />
        ) : null
      })}
    </div>
  )
}
