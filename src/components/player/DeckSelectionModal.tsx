import React from 'react'

import { Deck } from '../Deck'
import { Modal } from '../Modal'

const DeckSelectionModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  sortedDecks: Deck[]
  onSelect: (deckId: string) => void
  onCreateDeck: () => void
}> = ({ isOpen, onClose, sortedDecks, onSelect, onCreateDeck }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Choose Deck">
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Select a deck for this player:</p>
        <button
          onClick={onCreateDeck}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create New Deck
        </button>
      </div>

      {sortedDecks.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 items-start">
          {sortedDecks.map(deck => (
            <button
              key={deck.id}
              onClick={() => onSelect(deck.id)}
              className="text-left hover:bg-gray-50 transition p-2 rounded"
            >
              <Deck id={deck.id} />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>No decks available.</p>
          <p className="text-sm">Create a new deck to get started.</p>
        </div>
      )}
    </div>
  </Modal>
)

export default DeckSelectionModal
