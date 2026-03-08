import { Button } from '@react-trace/ui-components'
import type { ErrorInfo, PropsWithChildren } from 'react'
import { Component } from 'react'

export class ErrorBoundary extends Component<
  PropsWithChildren,
  { hasError: boolean; error?: Error }
> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <h1>
          Something went wrong.{' '}
          <Button
            variant="primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </h1>
      )
    }

    return this.props.children
  }
}
