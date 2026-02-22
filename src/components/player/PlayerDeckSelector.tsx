import React from 'react'

import { Deck } from '../Deck'

const PlayerDeckSelector: React.FC<{
  player: Player
  onShowDeckSelect: () => void
}> = ({ player, onShowDeckSelect }) => {
  if (!player.deckId)
    return (
      <button className="btn btn-primary" onClick={onShowDeckSelect}>
        Deck
      </button>
    )

  return (
    <Deck
      id={player.deckId}
      role="button"
      className="cursor-pointer"
      showCreator={false}
      showStats={false}
      showOptions={false}
      showName={false}
      showTypeLine={false}
      onClick={onShowDeckSelect}
    />
  )
}

export default PlayerDeckSelector
