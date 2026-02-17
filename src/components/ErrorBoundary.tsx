import React from 'react'

import pkg from '../../package.json'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

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
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-foreground p-8 relative">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {this.state.error && (
                <pre className="whitespace-pre-wrap text-sm bg-secondary rounded p-2 border overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              )}

              {this.state.errorInfo && (
                <details className="whitespace-pre-wrap text-xs bg-secondary rounded p-2 border overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </details>
              )}

              <Button variant="danger" onClick={this.handleReload}>
                Reload Page
              </Button>

              <div className="flex flex-col gap-1">
                {STORAGE_KEYS.map(({ key, label }) => (
                  <Button key={key} variant="secondary" small onClick={() => this.handleClearKey(key)}>
                    {label}
                  </Button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground text-center">v{APP_VERSION}</div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
