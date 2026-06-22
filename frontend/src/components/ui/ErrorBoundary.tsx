import { Component, ErrorInfo, ReactNode } from "react";
import { PageError } from "./PageError";

interface Props {
  children: ReactNode;
  /** Optional custom fallback — defaults to PageError with a retry button */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console for now; swap for a real logger (Sentry etc.) in production.
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <PageError
          message={this.state.error?.message ?? "An unexpected error occurred."}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
