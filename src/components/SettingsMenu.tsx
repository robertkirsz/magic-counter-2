import { List, Maximize2, Minimize2, Move, Settings, Table, Trophy } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '../utils/cn'
import { isFullscreen, toggleFullscreen } from '../utils/fullscreen'
import { Button } from './Button'

interface SettingsMenuProps {
  tableMode: boolean
  dragEnabled: boolean
  gameState: 'setup' | 'active' | 'finished'
  onTableModeChange: (tableMode: boolean) => void
  onDragEnabledChange: (dragEnabled: boolean) => void
  onShowSettings: () => void
  onShowActions: () => void
  onFinishGame: () => void
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  tableMode,
  dragEnabled,
  gameState,
  onTableModeChange,
  onDragEnabledChange,
  onShowSettings,
  onShowActions,
  onFinishGame
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(isFullscreen())
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Set initial state
    setFullscreen(isFullscreen())

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false)
      }
    }

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettingsMenu])

  // Fullscreen toggle handler
  const handleToggleFullscreen = async () => {
    try {
      await toggleFullscreen()
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
    }
  }

  return (
    <div className="absolute top-0 right-0 p-2 z-20" ref={settingsMenuRef}>
      <div className="relative">
        <Button
          round
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          className={cn(showSettingsMenu && 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500')}
          title="Settings"
        >
          <Settings size={24} />
        </Button>

        {showSettingsMenu && (
          <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[200px]">
            <div className="p-2 space-y-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => {
                  onShowSettings()
                  setShowSettingsMenu(false)
                }}
              >
                <Settings size={20} />
                <span>Game Settings</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => {
                  onShowActions()
                  setShowSettingsMenu(false)
                }}
              >
                <List size={20} />
                <span>Game Actions</span>
              </button>

              <div className="border-t border-gray-600 my-1"></div>

              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors',
                  dragEnabled && 'bg-blue-600/90 text-white'
                )}
                onClick={() => {
                  onDragEnabledChange(!dragEnabled)
                  setShowSettingsMenu(false)
                }}
              >
                <Move size={20} />
                <span>Drag Mode</span>
              </button>

              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors',
                  tableMode && 'bg-green-600/90 text-white'
                )}
                onClick={() => {
                  onTableModeChange(!tableMode)
                  setShowSettingsMenu(false)
                }}
              >
                <Table size={20} />
                <span>Table Mode</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => {
                  handleToggleFullscreen()
                  setShowSettingsMenu(false)
                }}
              >
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                <span>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>

              {gameState === 'active' && (
                <>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-400 hover:bg-red-600/20 rounded transition-colors"
                    onClick={() => {
                      onFinishGame()
                      setShowSettingsMenu(false)
                    }}
                  >
                    <Trophy size={20} />
                    <span>Finish Game</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
