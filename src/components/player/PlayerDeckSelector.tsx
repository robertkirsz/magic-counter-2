import React from 'react'

import { Deck } from '../Deck'
import { ThreeDotMenu } from '../ThreeDotMenu'

const PlayerDeckSelector: React.FC<{
  player: Player
  onShowDeckSelect: () => void
  onRemoveDeck: () => void
}> = ({ player, onShowDeckSelect, onRemoveDeck }) => {
  if (!player.deckId)
    return (
      <button className={'btn btn-primary'} onClick={onShowDeckSelect}>
        Deck
      </button>
    )

  return (
    <div className="flex items-center gap-1">
      <Deck
        id={player.deckId}
        role="button"
        className="cursor-pointer max-w-20"
        showCreator={false}
        showStats={false}
        onClick={onShowDeckSelect}
      />

      <ThreeDotMenu onClose={onRemoveDeck} asMenu={false} />
    </div>
  )
}

export default PlayerDeckSelector
