import React from 'react'

import { MANA_COLORS } from '../constants/mana'
import { cn } from '../utils/cn'

interface ColorBadgesProps extends React.HTMLAttributes<HTMLDivElement> {
  colors: string[]
  className?: string
}

export const ColorBadges: React.FC<ColorBadgesProps> = ({ colors, className, ...props }) => {
  if (colors.length === 0) return null

  return (
    <div className={cn('flex gap-0.5', className)} {...props}>
      {colors.map(color => {
        const colorInfo = MANA_COLORS.find(c => [c.value, c.label].includes(color))

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
