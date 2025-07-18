import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { ManaColor } from '../constants/mana'
import { useDecks } from '../hooks/useDecks'
import { Button } from './Button'
import { Commander } from './Commander'
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

  const [name, setName] = useState<Deck['name']>(deck?.name || '')
  const [selectedColors, setSelectedColors] = useState<Deck['colors']>(deck?.colors || [])
  const [commanders, setCommanders] = useState<Deck['commanders']>(deck?.commanders || [])

  useEffect(() => updateColors(commanders), [commanders])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleSave = () => {
    if (name.trim() && selectedColors.length > 0) {
      if (deckId) {
        updateDeck(deckId, {
          name: name.trim(),
          colors: selectedColors,
          commanders: commanders.length > 0 ? commanders : []
        })

        onSave?.(deckId)
        return
      }

      const newDeck = addDeck({
        name: name.trim(),
        colors: selectedColors,
        commanders: commanders.length > 0 ? commanders : [],
        createdBy: userId
      })

      onSave?.(newDeck.id)
    }
  }

  const handleCommanderChange = (commander: ScryfallCard) => {
    if (commanders.length >= 2) return

    setCommanders(commanders => [...commanders, commander])
  }

  const handleRemoveCommander = (index: number) => {
    setCommanders(commanders => commanders.filter((_, i) => i !== index))
  }

  const updateColors = (newCommanders: ScryfallCard[]) => {
    const allCommandersColors = newCommanders.map(commander => commander.colors).flat() as ManaColor[]
    const uniqueColors = [...new Set(allCommandersColors)]

    if (newCommanders.length > 0) {
      if (uniqueColors.length > 0) setSelectedColors(uniqueColors)
      else setSelectedColors(['C'])
    } else {
      // Only clear colors if we're in create mode or if the deck has no existing colors
      if (!deck || deck.colors.length === 0) setSelectedColors([])
    }
  }

  const mode = deck ? 'edit' : 'create'
  const baseId = `deck-form-${mode}`
  const testIdPrefix = testId ? `${testId}-${baseId}` : baseId

  return (
    <Modal isOpen hideCloseButton testId={testIdPrefix} onClose={() => onCancel?.()}>
      <div className="flex flex-col gap-4 p-2">
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
        {commanders.length > 0 && (
          <div className="flex flex-col gap-1">
            {commanders.map((commander, index) => (
              <div key={index} className="relative">
                <Commander key={index} commander={commander} />

                <Button
                  variant="secondary"
                  round
                  small
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveCommander(index)}
                >
                  <X size={10} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {commanders.length < 2 && <CommanderSearch onChange={handleCommanderChange} />}

        {/* Mana Colors */}
        <ManaPicker selectedColors={selectedColors} onColorToggle={handleColorToggle} />

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            data-testid={`${testIdPrefix}-save`}
            variant="primary"
            disabled={!name.trim() || selectedColors.length === 0}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button data-testid={`${testIdPrefix}-cancel`} variant="danger" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
