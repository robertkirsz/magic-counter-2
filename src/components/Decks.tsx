import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'

export const Decks: React.FC = () => {
  const { decks, addDeck, removeDeck, updateDeck } = useDecks()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddDeck = (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    addDeck({
      name: data.name,
      colors: data.colors,
      commanders: data.commanders
    })
    setIsAdding(false)
  }

  const handleSaveEdit = (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
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

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-3xl font-bold text-gray-800">Decks</h1>

        {/* Add Deck Section */}
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Deck
        </button>

        {/* Decks List */}
        <div className="flex flex-col gap-2">
          {decks.length === 0 ? (
            <p className="text-gray-500 italic">No decks yet. Add your first deck!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {decks.map(deck => (
                <Deck key={deck.id} deck={deck} showCreator onEditDeck={setEditingId} onRemoveDeck={removeDeck} />
              ))}
            </div>
          )}
        </div>

        {/* Create Deck Modal */}
        {isAdding && <DeckForm onSave={handleAddDeck} onCancel={() => setIsAdding(false)} />}

        {/* Edit Deck Modal */}
        {editingId !== null && (
          <DeckForm deck={decks.find(d => d.id === editingId)} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
        )}
      </div>
    </>
  )
}
