import { X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { ManaColor } from '../constants/mana'
import { useDecks } from '../hooks/useDecks'
import { Button } from './Button'
import { Commander } from './Commander'
import { CommanderSearch } from './CommanderSearch'
import { ManaPicker } from './ManaPicker'

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
  const [selectedOptions, setSelectedOptions] = useState<Deck['options']>(deck?.options || [])
  const [archidektUrl, setArchidektUrl] = useState('')
  const [isLoadingDeckName, setIsLoadingDeckName] = useState(false)

  const updateColors = useCallback(
    (newCommanders: ScryfallCard[]) => {
      const allCommandersColors = newCommanders.map(commander => commander.colors).flat() as ManaColor[]
      const uniqueColors = [...new Set(allCommandersColors)]

      if (newCommanders.length > 0) {
        if (uniqueColors.length > 0) setSelectedColors(uniqueColors)
        else setSelectedColors(['C'])
      } else {
        // Only clear colors if we're in create mode or if the deck has no existing colors
        if (!deck || deck.colors.length === 0) setSelectedColors([])
      }
    },
    [deck]
  )

  useEffect(() => updateColors(commanders), [commanders, updateColors])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleOptionToggle = (option: DeckOption) => {
    setSelectedOptions(prev =>
      (prev || []).includes(option) ? (prev || []).filter(o => o !== option) : [...(prev || []), option]
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (name.trim() && selectedColors.length > 0) {
      if (deckId) {
        updateDeck(deckId, {
          name: name.trim(),
          colors: selectedColors,
          commanders: commanders.length > 0 ? commanders : [],
          options: (selectedOptions || []).length > 0 ? selectedOptions : undefined
        })

        onSave?.(deckId)
        return
      }

      const newDeck = addDeck({
        name: name.trim(),
        colors: selectedColors,
        commanders: commanders.length > 0 ? commanders : [],
        options: (selectedOptions || []).length > 0 ? selectedOptions : undefined,
        createdBy: userId
      })

      onSave?.(newDeck.id)
    }
  }

  const handleCommanderChange = (commander: ScryfallCard) => {
    if (commanders.length >= 2) return

    setCommanders(commanders => [...commanders, commander])

    // Auto-set deck name to commander name if deck name is empty
    if (!name.trim()) {
      setName(commander.name)
    }
  }

  const handleRemoveCommander = (index: number) => {
    const removedCommander = commanders[index]
    setCommanders(commanders => commanders.filter((_, i) => i !== index))

    // Clear deck name if it matches the removed commander's name
    if (name.trim() === removedCommander.name) {
      setName('')
    }
  }

  interface ArchidektDeckData {
    name: string
    cards: Array<{
      card: {
        uid: string
        oracleCard: {
          uid: string
          name: string
          colorIdentity: string[]
          subTypes: string[]
          superTypes: string[]
          types: string[]
        }
        scryfallImageHash: string
      }
    }>
  }

  const extractDeckDataFromArchidekt = async (url: string): Promise<ArchidektDeckData | null> => {
    try {
      // Extract deck ID from Archidekt URL
      const archidektRegex = /archidekt\.com\/decks\/(\d+)/i
      const match = url.match(archidektRegex)

      if (!match) throw new Error('Invalid Archidekt URL format')

      const deckId = match[1]

      // Try multiple approaches to handle CORS
      const approaches = [
        // Approach 1: Direct API call (may fail due to CORS)
        // () => fetch(`https://archidekt.com/api/decks/${deckId}/`),
        // Approach 2: CORS proxy
        // () => fetch(`https://cors-anywhere.herokuapp.com/https://archidekt.com/api/decks/${deckId}/`),
        // Approach 3: Alternative CORS proxy
        () => fetch(`https://api.allorigins.win/raw?url=https://archidekt.com/api/decks/${deckId}/`),
        // Approach 4: Another CORS proxy
        () => fetch(`https://corsproxy.io/?https://archidekt.com/api/decks/${deckId}/`)
      ]

      let response: Response | null = null
      let lastError: Error | null = null

      // Try each approach until one works
      for (const approach of approaches) {
        try {
          response = await approach()
          if (response.ok) break
        } catch (error) {
          lastError = error as Error
          continue
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('Failed to fetch deck data from all sources')
      }

      const deckData = await response.json()
      return deckData
    } catch (error) {
      console.error('Error fetching deck data from Archidekt:', error)
      return null
    }
  }

  const handleFetchDeckData = async () => {
    if (!archidektUrl.trim()) return

    setIsLoadingDeckName(true)

    try {
      const deckData = await extractDeckDataFromArchidekt(archidektUrl.trim())
      console.log('🚀 ~ handleFetchDeckData ~ deckData:', deckData)

      if (deckData) {
        // Set deck name
        setName(deckData.name)

        // TODO: Get Commander insted of first card
        const commanderCards = [deckData.cards[0]]

        const archidektCommanders: ScryfallCard[] = commanderCards.map(cardData => ({
          id: cardData.card.oracleCard.uid,
          name: cardData.card.oracleCard.name,
          type: `${[...cardData.card.oracleCard.superTypes, ...cardData.card.oracleCard.types].join(' ')} — ${cardData.card.oracleCard.subTypes.join(' ')}`,
          colors: cardData.card.oracleCard.colorIdentity as ManaColor[],
          image: cardData.card.scryfallImageHash
            ? // ? `https://cards.scryfall.io/art_crop/front/${cardData.card.scryfallImageHash.slice(0, 2)}/${cardData.card.scryfallImageHash.slice(2, 4)}/${cardData.card.scryfallImageHash}.jpg`
              `https://cards.scryfall.io/art_crop/front/${cardData.card.uid[0]}/${cardData.card.uid[1]}/${cardData.card.uid}.jpg?${cardData.card.scryfallImageHash}`
            : null
        }))

        setCommanders(archidektCommanders)
        setArchidektUrl('') // Clear the URL after successful fetch
      } else {
        // Fallback: try to extract deck name from URL path
        const urlPath = new URL(archidektUrl.trim()).pathname
        const pathParts = urlPath.split('/').filter(part => part.length > 0)

        if (pathParts.length >= 3 && pathParts[0] === 'decks') {
          // URL format: /decks/123456/deck-name
          const potentialName = pathParts[2]
          if (potentialName && potentialName !== pathParts[1]) {
            // Convert URL-friendly name to readable name
            const readableName = potentialName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

            setName(readableName)
            setArchidektUrl('')
            return
          }
        }

        alert('Could not fetch deck data from the provided URL. Please check the URL and try again.')
      }
    } catch {
      alert('Error fetching deck data. Please check the URL and try again.')
    } finally {
      setIsLoadingDeckName(false)
    }
  }

  const mode = deck ? 'edit' : 'create'
  const baseId = `deck-form-${mode}`
  const testIdPrefix = testId ? `${testId}-${baseId}` : baseId

  return (
    <form data-testid={baseId} className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Name Input */}
      <input
        data-testid={`${testIdPrefix}-name`}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Deck name"
        className="form-input"
        autoFocus
      />

      {/* Archidekt URL Import - Only show when creating new deck */}
      {!deck && (
        <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                data-testid={`${testIdPrefix}-archidekt-url`}
                type="url"
                value={archidektUrl}
                onChange={e => setArchidektUrl(e.target.value)}
                placeholder="Paste Archidekt deck URL to get deck name"
                className="form-input"
              />
            </div>

            <Button
              data-testid={`${testIdPrefix}-fetch-name`}
              type="button"
              variant="secondary"
              onClick={handleFetchDeckData}
              disabled={!archidektUrl.trim() || isLoadingDeckName}
            >
              {isLoadingDeckName ? 'Loading...' : 'Get Deck Data'}
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            Paste an Archidekt deck URL to automatically fetch deck name and commanders. If API fails, we'll try to
            extract the name from the URL.
          </p>
        </div>
      )}

      {/* Commanders */}
      {commanders.length > 0 && (
        <div className="flex flex-col gap-1">
          {commanders.map((commander, index) => (
            <div key={index} className="relative">
              <Commander key={index} commander={commander} />

              <Button
                type="button"
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

      {/* Deck Options */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">Deck Options</label>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions?.includes('infect') || false}
              onChange={() => handleOptionToggle('infect')}
              className="form-checkbox"
            />

            <span className="text-sm">Infect</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions?.includes('monarch') || false}
              onChange={() => handleOptionToggle('monarch')}
              className="form-checkbox"
            />

            <span className="text-sm">Monarch</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button data-testid={`${testIdPrefix}-cancel`} type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          data-testid={`${testIdPrefix}-save`}
          variant="primary"
          disabled={!name.trim() || selectedColors.length === 0}
        >
          Save
        </Button>
      </div>
    </form>
  )
}
