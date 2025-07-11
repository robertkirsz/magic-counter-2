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
    <div className={`flex flex-wrap gap-1 justify-center ${className}`} role="group" aria-label="Mana color selection">
      {MANA_COLORS.map(({ value, label, filename }) => {
        const isSelected = selectedColors.includes(value)

        return (
          <label
            key={value}
            className="flex items-center gap-2 cursor-pointer rounded hover:bg-gray-50 p-1"
            tabIndex={0}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`${label} mana (${isSelected ? 'selected' : 'not selected'})`}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onColorToggle(value)
              }
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onColorToggle(value)}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />

            <img
              src={`/mana/${filename}`}
              alt=""
              aria-hidden="true"
              className={`w-8 h-8 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-20'}`}
            />
          </label>
        )
      })}
    </div>
  )
}
