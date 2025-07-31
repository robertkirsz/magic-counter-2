/**
 * Event Logger Component
 *
 * This component demonstrates how to use the typed event system.
 * It listens to all application events and logs them to the console.
 * This is useful for debugging and understanding the event flow.
 */
import React, { useState } from 'react'

import {
  useGameDeleteListener,
  useGameStateChangeListener,
  useLifeChangeListener,
  useSwordAttackListener,
  useTurnChangeListener
} from '../utils/eventDispatcher'

interface LogEntry {
  id: string
  timestamp: Date
  type: string
  data: unknown
}

export const EventLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Listen to sword attack events
  useSwordAttackListener(event => {
    const logEntry: LogEntry = {
      id: `sword-${Date.now()}`,
      timestamp: new Date(),
      type: 'Sword Attack',
      data: event.detail
    }
    setLogs(prev => [logEntry, ...prev.slice(0, 9)]) // Keep last 10 entries
    console.log('🗡️ Sword Attack Event:', event.detail)
  })

  // Listen to game state change events
  useGameStateChangeListener(event => {
    const logEntry: LogEntry = {
      id: `state-${Date.now()}`,
      timestamp: new Date(),
      type: 'Game State Change',
      data: event.detail
    }
    setLogs(prev => [logEntry, ...prev.slice(0, 9)])
    console.log('🎮 Game State Change Event:', event.detail)
  })

  // Listen to turn change events
  useTurnChangeListener(event => {
    const logEntry: LogEntry = {
      id: `turn-${Date.now()}`,
      timestamp: new Date(),
      type: 'Turn Change',
      data: event.detail
    }
    setLogs(prev => [logEntry, ...prev.slice(0, 9)])
    console.log('🔄 Turn Change Event:', event.detail)
  })

  // Listen to life change events
  useLifeChangeListener(event => {
    const logEntry: LogEntry = {
      id: `life-${Date.now()}`,
      timestamp: new Date(),
      type: 'Life Change',
      data: event.detail
    }
    setLogs(prev => [logEntry, ...prev.slice(0, 9)])
    console.log('❤️ Life Change Event:', event.detail)
  })

  // Listen to game delete events
  useGameDeleteListener(event => {
    const logEntry: LogEntry = {
      id: `delete-${Date.now()}`,
      timestamp: new Date(),
      type: 'Game Delete',
      data: event.detail
    }
    setLogs(prev => [logEntry, ...prev.slice(0, 9)])
    console.log('🗑️ Game Delete Event:', event.detail)
  })

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        Show Event Logger
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Event Logger</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-400"
            title="Clear all logs"
          >
            Clear
          </button>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-xs">No events logged yet...</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-2">
              <div className="flex justify-between">
                <span className="font-semibold">{log.type}</span>
                <span className="text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
              </div>
              <pre className="text-gray-300 mt-1 text-xs overflow-x-auto">{JSON.stringify(log.data, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
