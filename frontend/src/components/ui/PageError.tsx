import { AlertTriangle, RefreshCw } from "lucide-react";

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PageError({
  message = "Something went wrong. Please try again.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] text-center p-8">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <p className="font-semibold text-[var(--fr-text)] mb-1">
        Oops! Something went wrong
      </p>
      <p className="text-sm text-[var(--fr-text-muted)] mb-6 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[var(--fr-primary)] hover:bg-[var(--fr-primary-dark)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
