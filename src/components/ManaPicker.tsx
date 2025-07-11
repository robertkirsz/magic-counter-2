import React from 'react'

import { MANA_COLORS } from '../constants/mana'
import type { ManaColor } from '../constants/mana'

interface ManaPickerProps {
  selectedColors: ManaColor[]
  onColorToggle: (color: ManaColor) => void
  className?: string
}

export const ManaPicker: React.FC<ManaPickerProps> = ({ selectedColors, onColorToggle, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {MANA_COLORS.map(({ value, label, filename }) => {
        const isSelected = selectedColors.includes(value)

        return (
          <label key={value} className="flex items-center gap-2 cursor-pointer rounded hover:bg-gray-50">
            <input type="checkbox" checked={isSelected} onChange={() => onColorToggle(value)} />

            <img
              src={`/mana/${filename}`}
              alt={label}
              title={label}
              className={`w-8 h-8 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-50'}`}
            />
          </label>
        )
      })}
    </div>
  )
}
