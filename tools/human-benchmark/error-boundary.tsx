'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onBack: () => void
}

interface State {
  hasError: boolean
}

export class TestErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-red-400 text-lg font-medium mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-6">This test encountered an error. Please try again.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              this.props.onBack()
            }}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            Back to Dashboard
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
