import React from 'react'

import { MANA_COLORS } from '../constants/mana'

interface ColorBadgesProps extends React.HTMLAttributes<HTMLDivElement> {
  colors: string[]
  className?: string
}

export const ColorBadges: React.FC<ColorBadgesProps> = ({ colors, className = '', ...props }) => {
  if (colors.length === 0) return null

  return (
    <div className={`flex gap-0.5 ${className}`} {...props}>
      {colors.map(color => {
        const colorInfo = MANA_COLORS.find(c => c.value === color)

        return colorInfo ? (
          <img
            key={color}
            src={`/icons/${colorInfo.filename}`}
            alt={colorInfo.label}
            title={colorInfo.label}
            className="w-3 h-3 max-w-none"
          />
        ) : null
      })}
    </div>
  )
}
