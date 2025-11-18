import * as React from 'react';
import { Button } from './ui/button';

// FIX: Switched to React.PropsWithChildren for a more standard and robust way of typing component props that accept children.
type Props = React.PropsWithChildren<{}>;

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // The constructor-based state initialization was causing TypeScript errors. Switched to a class property initializer, which is a more modern and reliable pattern for React class components and resolves issues with strict property initialization.
  state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'An unexpected error occurred.' };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-card p-8 rounded-lg shadow-2xl border border-red-800/50 max-w-lg">
            <h1 className="text-3xl font-serif text-red-400 mb-4">A thread has snapped...</h1>
            <p className="text-secondary-foreground mb-6">
              The loom has encountered an unexpected tangle in the weave of fate. Please try to refresh the narrative to begin again.
            </p>
            <p className="text-xs text-muted-foreground bg-secondary p-2 rounded mb-6 font-mono">
              <strong>Error Details:</strong> {this.state.errorMessage}
            </p>
            <Button onClick={this.handleReset} className="glow-button z-10 w-full sm:w-1/2">
                Try Weaving Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
