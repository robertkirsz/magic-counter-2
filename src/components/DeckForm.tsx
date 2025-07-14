import React, { useState } from 'react'

import type { ManaColor } from '../constants/mana'
import { useDecks } from '../hooks/useDecks'
import { CommanderSearch } from './CommanderSearch'
import { ManaPicker } from './ManaPicker'
import { Modal } from './Modal'

interface DeckFormProps {
  testId?: string
  deckId?: string
  userId?: User['id'] | null
  onSave?: (deckId: string) => void
  onCancel?: () => void
}

export const DeckForm: React.FC<DeckFormProps> = ({ testId = '', deckId, userId = null, onSave, onCancel }) => {
  const { decks, addDeck, updateDeck } = useDecks()
  const deck = decks.find(d => d.id === deckId)
  const [name, setName] = useState(deck?.name || '')
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>(deck?.colors || [])
  const [commanders, setCommanders] = useState<ScryfallCard[]>(deck?.commanders || [])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleSave = () => {
    if (name.trim() && selectedColors.length > 0) {
      if (deckId) {
        updateDeck(deckId, {
          name: name.trim(),
          colors: selectedColors,
          commanders: commanders.length > 0 ? commanders : null
        })

        onSave?.(deckId)
        return
      }

      const newDeck = addDeck({
        name: name.trim(),
        colors: selectedColors,
        commanders: commanders.length > 0 ? commanders : null,
        createdBy: userId
      })

      onSave?.(newDeck.id)
    }
  }

  const handleCommandersChange = (commanders: ScryfallCard[]) => {
    setCommanders(commanders)

    const allCommandersColors = commanders.map(commander => commander.colors).flat() as ManaColor[]
    const uniqueColors = [...new Set(allCommandersColors)]

    if (commanders.length > 0) {
      if (uniqueColors.length > 0) setSelectedColors(uniqueColors)
      else setSelectedColors(['C'])
    } else {
      setSelectedColors([])
    }
  }

  const mode = deck ? 'edit' : 'create'
  const baseId = `deck-form-${mode}`
  const testIdPrefix = testId ? `${testId}-${baseId}` : baseId

  return (
    <Modal
      isOpen={true}
      onClose={() => onCancel?.()}
      title={mode === 'create' ? 'Add New Deck' : 'Edit Deck'}
      testId={testIdPrefix}
    >
      <div className="flex flex-col gap-4">
        {/* Name Input */}
        <input
          data-testid={`${testIdPrefix}-name`}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Deck name"
          className="w-full p-2 border border-gray-300 rounded"
          autoFocus
        />

        {/* Commanders */}
        <CommanderSearch commanders={commanders} onCommandersChange={handleCommandersChange} />

        {/* Mana Colors */}
        <ManaPicker selectedColors={selectedColors} onColorToggle={handleColorToggle} />

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            data-testid={`${testIdPrefix}-save`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!name.trim() || selectedColors.length === 0}
            onClick={handleSave}
          >
            {mode === 'create' ? 'Save Deck' : 'Save Changes'}
          </button>

          <button
            data-testid={`${testIdPrefix}-cancel`}
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
