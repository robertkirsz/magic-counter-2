import React from 'react'
import pkg from '../../package.json' assert { type: 'json' }
const APP_VERSION = pkg.version

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-2 bg-red-50 text-red-900 font-sans p-8 relative">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
         
          {this.state.error && (
            <pre className="whitespace-pre-wrap text-sm bg-red-100 rounded p-2 border border-red-200 max-w-xl overflow-x-auto">
              {this.state.error.toString()}
            </pre>
          )}
          
          {this.state.errorInfo && (
            <details className="whitespace-pre-wrap text-xs bg-red-100 rounded p-2 border border-red-200 max-w-xl overflow-x-auto">
              {this.state.errorInfo.componentStack}
            </details>
          )}
          
          <button
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition text-base font-semibold"
            onClick={this.handleReload}
          >
            Reload Page
          </button>
          
          <div className="text-xs text-gray-500">v{APP_VERSION}</div>
        </div>
      )
    }
    
    return this.props.children
  }
}

export default ErrorBoundary
