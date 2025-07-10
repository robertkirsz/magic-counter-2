import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { DeckForm } from './DeckForm'

export const Decks: React.FC = () => {
  const { decks, addDeck, removeDeck, updateDeck } = useDecks()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddDeck = (data: { name: string; colors: ManaColor[]; commanders?: string[] }) => {
    addDeck({
      name: data.name,
      colors: data.colors,
      commanders: data.commanders
    })
    setIsAdding(false)
  }

  const handleEditDeck = (deckId: string) => {
    setEditingId(deckId)
  }

  const handleSaveEdit = (data: { name: string; colors: ManaColor[]; commanders?: string[] }) => {
    if (editingId) {
      updateDeck(editingId, {
        name: data.name,
        colors: data.colors,
        commanders: data.commanders
      })
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const getColorLabels = (colors: ManaColor[]) => {
    const colorMap: Record<ManaColor, string> = {
      W: 'White',
      U: 'Blue',
      B: 'Black',
      R: 'Red',
      G: 'Green',
      C: 'Colorless'
    }
    return colors.map(color => colorMap[color]).join(', ')
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">Decks</h1>

      {/* Add Deck Section */}
      <div className="mb-5 p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Add New Deck
        </button>
      </div>

      {/* Decks List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Decks</h2>
        {decks.length === 0 ? (
          <p className="text-gray-500 italic">No decks yet. Add your first deck!</p>
        ) : (
          <div>
            {decks.map(deck => (
              <div key={deck.id} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold mb-1">{deck.name}</h3>
                    <p className="text-gray-500 mb-1">Created: {deck.createdAt.toLocaleDateString()}</p>
                    <p className="mb-1">
                      <span className="font-medium">Colors:</span> {getColorLabels(deck.colors)}
                    </p>
                    {deck.commanders && deck.commanders.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Commanders:</span> {deck.commanders.join(', ')}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditDeck(deck.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeDeck(deck.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Deck Modal */}
      {isAdding && <DeckForm mode="create" onSave={handleAddDeck} onCancel={() => setIsAdding(false)} />}

      {/* Edit Deck Modal */}
      {editingId !== null && (
        <DeckForm
          mode="edit"
          deck={decks.find(d => d.id === editingId)}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  )
}
