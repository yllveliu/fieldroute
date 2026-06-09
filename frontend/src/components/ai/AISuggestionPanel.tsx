import React from "react";
import type { ClassificationResponse } from "../../services/aiApi";

interface AISuggestionPanelProps {
  result: ClassificationResponse | null;
  loading?: boolean;
  error?: string | null;
  isMock?: boolean;
}

const KNOWN_SERVICE_TYPES = ["plumbing", "electrical", "hvac", "general"];

function confidenceLevel(c: number): "high" | "medium" | "low" {
  if (c >= 0.7) return "high";
  if (c >= 0.5) return "medium";
  return "low";
}

function serviceClass(serviceType: string): string {
  return KNOWN_SERVICE_TYPES.includes(serviceType) ? serviceType : "general";
}

export default function AISuggestionPanel({
  result,
  loading = false,
  error = null,
  isMock = false,
}: AISuggestionPanelProps): React.ReactElement {
  const isLowConfidence = result !== null && result.confidence < 0.5;
  const confLevel = result ? confidenceLevel(result.confidence) : "high";
  const confPct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-panel-title">AI Classification</span>
        <span className="ai-assisted-badge">&#10022; AI Assisted</span>
      </div>

      {result && isLowConfidence && (
        <div className="ai-fallback-banner">
          <span>&#9888;</span>
          Low confidence &mdash; manual dispatcher review recommended.
        </div>
      )}

      {loading && <div className="ai-panel-loading">Classifying&hellip;</div>}

      {!loading && error && (
        <div className="ai-panel-error">Classification failed: {error}</div>
      )}

      {!loading && !error && result === null && (
        <div className="ai-panel-empty">
          Enter a service description above and click{" "}
          <strong>Classify</strong> to see AI suggestions.
        </div>
      )}

      {!loading && !error && result !== null && (
        <div className="ai-panel-body">
          <div className="ai-field">
            <span className="ai-field-label">Service Type</span>
            <span
              className={`ai-service-badge ai-service-badge--${serviceClass(result.service_type)}`}
            >
              {result.service_type}
            </span>
          </div>

          <div className="ai-field">
            <span className="ai-field-label">
              Confidence &mdash; {confPct}%
            </span>
            <div className="ai-confidence-bar">
              <div
                className={`ai-confidence-fill ai-confidence-fill--${confLevel}`}
                style={{ width: `${confPct}%` }}
              />
            </div>
          </div>

          <div className="ai-field">
            <span className="ai-field-label">Explanation</span>
            <span className="ai-field-value">{result.explanation}</span>
          </div>

          <div className="ai-field">
            <span className="ai-field-label">ETA Draft</span>
            <span className="ai-field-value">{result.eta_message}</span>
          </div>
        </div>
      )}

      {isMock && result !== null && !loading && (
        <div className="ai-mock-notice">
          Showing demo data &mdash; submit a description for live classification
        </div>
      )}
    </div>
  );
}
