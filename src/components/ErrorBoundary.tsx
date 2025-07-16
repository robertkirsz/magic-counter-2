import React from 'react'

import pkg from '../../package.json'
import { Button } from './Button'

const APP_VERSION = pkg.version

const STORAGE_KEYS = [
  { key: 'games', label: 'Clear Games Data' },
  { key: 'decks', label: 'Clear Decks Data' },
  { key: 'users', label: 'Clear Users Data' }
]

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true, error, errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearKey = (key: string) => {
    localStorage.removeItem(key)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-2 bg-red-50 dark:bg-gray-900 text-red-900 dark:text-red-200 font-sans p-8 relative">
          <h1 className="text-2xl font-bold">Something went wrong</h1>

          {this.state.error && (
            <pre className="whitespace-pre-wrap text-sm bg-red-100 dark:bg-gray-800 rounded p-2 border border-red-200 dark:border-red-700 max-w-xl overflow-x-auto">
              {this.state.error.toString()}
            </pre>
          )}

          {this.state.errorInfo && (
            <details className="whitespace-pre-wrap text-xs bg-red-100 dark:bg-gray-800 rounded p-2 border border-red-200 dark:border-red-700 max-w-xl overflow-x-auto">
              {this.state.errorInfo.componentStack}
            </details>
          )}

          <Button variant="danger" onClick={this.handleReload}>
            Reload Page
          </Button>

          <div className="flex flex-col gap-1 mt-2">
            {STORAGE_KEYS.map(({ key, label }) => (
              <Button key={key} variant="secondary" onClick={() => this.handleClearKey(key)}>
                {label}
              </Button>
            ))}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">v{APP_VERSION}</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
