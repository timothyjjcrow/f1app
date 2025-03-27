import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A React Error Boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call the optional onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // If a custom fallback is provided, render it
      if (fallback) {
        return fallback;
      }

      // Otherwise, render a default error UI
      return (
        <div className="f1-error p-6 rounded-lg bg-red-900/50 border border-red-800 text-center">
          <h3 className="text-xl font-bold mb-2 text-white">
            {componentName
              ? `Error in ${componentName}`
              : "Something went wrong"}
          </h3>
          <p className="text-red-200 mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="f1-button bg-red-700 hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      );
    }

    // If no error, render children normally
    return children;
  }
}

export default ErrorBoundary;
