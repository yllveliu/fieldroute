import React, { useState } from "react";
import AISuggestionPanel from "../components/ai/AISuggestionPanel";
import { classifyServiceRequest } from "../services/aiApi";
import type { ClassificationResponse } from "../services/aiApi";

// MOCK DATA — remove once backend is confirmed connected in this environment.
const MOCK_HIGH_CONF: ClassificationResponse = {
  service_type: "plumbing",
  confidence: 0.91,
  explanation:
    "Customer described a burst pipe under the kitchen sink with visible water damage — a clear plumbing emergency.",
  eta_message: "Plumbing technician will arrive within 2–4 hours.",
};

const MOCK_LOW_CONF: ClassificationResponse = {
  service_type: "general",
  confidence: 0.38,
  explanation:
    "Request is ambiguous and does not match a specific service category. Manual dispatcher review is recommended.",
  eta_message:
    "A dispatcher will review your request and assign the right technician.",
};
// END MOCK DATA

export default function AIPage(): React.ReactElement {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ClassificationResponse | null>(
    MOCK_HIGH_CONF
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(true);

  async function handleClassify(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setIsMock(false);
    try {
      const res = await classifyServiceRequest({
        description: description.trim(),
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Classification failed."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function loadDemo(mock: ClassificationResponse): void {
    setResult(mock);
    setError(null);
    setIsMock(true);
  }

  return (
    <div className="ai-page">
      <h1 className="ai-page-heading">AI Classification</h1>
      <p className="ai-page-subtitle">
        Automatically classify incoming service requests by type, confidence,
        and estimated arrival time.
      </p>

      <div className="ai-input-card">
        <form className="job-form" onSubmit={handleClassify}>
          <div className="form-field">
            <label htmlFor="ai-description">Service description</label>
            <textarea
              id="ai-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder={'Describe the customer\'s problem, e.g. "Burst pipe under kitchen sink…"'}
            />
          </div>
          <button
            type="submit"
            className="button"
            disabled={loading || !description.trim()}
          >
            {loading ? "Classifying…" : "Classify"}
          </button>
        </form>

        <div className="ai-demo-row">
          <button
            type="button"
            className="ai-demo-btn"
            onClick={() => loadDemo(MOCK_HIGH_CONF)}
          >
            Demo: high confidence
          </button>
          <button
            type="button"
            className="ai-demo-btn"
            onClick={() => loadDemo(MOCK_LOW_CONF)}
          >
            Demo: low confidence (fallback)
          </button>
        </div>
      </div>

      <AISuggestionPanel
        result={result}
        loading={loading}
        error={error}
        isMock={isMock}
      />
    </div>
  );
}
