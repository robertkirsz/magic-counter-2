import React from 'react'

import { MANA_COLORS } from '../constants/mana'

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
