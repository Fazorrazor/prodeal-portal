'use client';
import { Component } from 'react';

export class DivisionErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center gap-3 p-8 border border-brand-red/30 rounded-xl bg-brand-red/5">
          <span className="text-brand-red font-heading font-semibold">
            Failed to load section
          </span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm text-brand-blue underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
