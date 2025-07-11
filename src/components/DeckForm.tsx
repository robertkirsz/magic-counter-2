import React, { useState } from 'react'

import { CommanderSearch } from './CommanderSearch'
import { ManaPicker } from './ManaPicker'
import { Modal } from './Modal'

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

interface DeckFormProps {
  mode: 'create' | 'edit'
  deck?: Deck
  onSave: (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => void
  onCancel: () => void
}

export const DeckForm: React.FC<DeckFormProps> = ({ mode, deck, onSave, onCancel }) => {
  const [name, setName] = useState(deck?.name || '')
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>(deck?.colors || [])
  const [commanders, setCommanders] = useState<ScryfallCard[]>(deck?.commanders || [])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleSave = () => {
    if (name.trim() && selectedColors.length > 0) {
      onSave({
        name: name.trim(),
        colors: selectedColors,
        commanders: commanders.length > 0 ? commanders : undefined
      })
    }
  }

  const handleCommandersChange = (commanders: ScryfallCard[]) => {
    setCommanders(commanders)

    const allCommandersColors = commanders.map(commander => commander.colors).flat() as ManaColor[]
    const uniqueColors = [...new Set(allCommandersColors)]

    if (commanders.length > 0) {
      if (uniqueColors.length > 0) {
        setSelectedColors(uniqueColors)
      } else {
        setSelectedColors(['C'])
      }
    } else {
      setSelectedColors([])
    }
  }

  return (
    <Modal isOpen={true} onClose={onCancel} title={mode === 'create' ? 'Add New Deck' : 'Edit Deck'}>
      <div className="flex flex-col gap-4">
        {/* Name Input */}
        <div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Deck name"
            className="w-full p-2 border border-gray-300 rounded"
            autoFocus
          />
        </div>

        {/* Commanders */}
        <CommanderSearch commanders={commanders} onCommandersChange={handleCommandersChange} />

        {/* Mana Colors */}
        <div>
          <ManaPicker selectedColors={selectedColors} onColorToggle={handleColorToggle} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || selectedColors.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? 'Save Deck' : 'Save Changes'}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
