import React from 'react'

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
    // Optionally log error to an error reporting service
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: '#fee', color: '#900', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>

          {this.state.error && <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</pre>}

          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{this.state.errorInfo.componentStack}</details>
          )}

          <button
            style={{
              marginTop: 24,
              padding: '8px 16px',
              fontSize: 16,
              background: '#900',
              color: '#fff',
              border: 'none',
              borderRadius: 4
            }}
            onClick={this.handleReload}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
