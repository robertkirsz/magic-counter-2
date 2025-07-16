import React from 'react'

import { Button } from '../Button'
import { Deck } from '../Deck'
import { ThreeDotMenu } from '../ThreeDotMenu'

const PlayerDeckSelector: React.FC<{
  player: Player
  onShowDeckSelect: () => void
  onRemoveDeck: () => void
}> = ({ player, onShowDeckSelect, onRemoveDeck }) => (
  <>
    {player.deckId && (
      <div className="flex items-center gap-1">
        <Button variant="secondary" onClick={onShowDeckSelect}>
          <Deck id={player.deckId} />
        </Button>

        <ThreeDotMenu onClose={onRemoveDeck} asMenu={false} />
      </div>
    )}

    {!player.deckId && (
      <Button variant="primary" onClick={onShowDeckSelect}>
        Deck
      </Button>
    )}
  </>
)

export default PlayerDeckSelector
