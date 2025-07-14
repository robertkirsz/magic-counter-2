import React, { useEffect, useState } from 'react'

import { Commander } from './Commander'

interface CommanderSearchProps {
  onChange: (commander: ScryfallCard) => void
}

interface ScryfallCardRaw {
  id: string
  name: string
  type_line: string
  color_identity?: string[]
  colors?: string[]
  card_faces?: Array<{ image_uris?: { art_crop?: string } }>
  image_uris?: { art_crop?: string }
}

export const CommanderSearch: React.FC<CommanderSearchProps> = ({ onChange }) => {
  const [newCommander, setNewCommander] = useState('')
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fetchCommanderSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      // Search for legendary creatures that could be commanders
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`${query} is:commander`)}&unique=cards`
      )

      if (response.ok) {
        const data = await response.json()

        // Only keep properties that exist in ScryfallCard type
        const scryfallCards: ScryfallCard[] = (data.data || []).map((card: ScryfallCardRaw) => ({
          id: card.id,
          name: card.name,
          type: card.type_line,
          colors: card.color_identity || card.colors,
          image: card.card_faces?.[0]?.image_uris?.art_crop || card.image_uris?.art_crop
        }))

        setSuggestions(scryfallCards)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error fetching commander suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newCommander.trim()) fetchCommanderSuggestions(newCommander)
      else setSuggestions([])
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [newCommander])

  const handleSuggestionClick = (card: ScryfallCard) => {
    onChange(card)
    setNewCommander('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search Commander Input */}
      <div>
        <input
          type="text"
          value={newCommander}
          onChange={e => setNewCommander(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for commanders..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="flex flex-col gap-1 p-1 border border-gray-300 rounded-md max-h-67 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {!isLoading && suggestions.length === 0 && newCommander.trim().length >= 2 && (
            <div className="p-3 text-center text-gray-500">No commanders found. Try a different search term.</div>
          )}

          {!isLoading &&
            suggestions.map((card, index) => (
              <Commander key={index} commander={card} onClick={() => handleSuggestionClick(card)} />
            ))}
        </div>
      )}
    </div>
  )
}
