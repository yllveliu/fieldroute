// AI classification API client. Mirrors ClassificationRequest / ClassificationResponse in backend/app/schemas/ai.py.
// In dev, Vite proxies "/ai" to the backend (see vite.config.ts).
const API_BASE = "";

export interface ClassificationRequest {
  description: string;
}

export interface ClassificationResponse {
  service_type: string;
  confidence: number;
  explanation: string;
  eta_message: string;
}

export async function classifyServiceRequest(
  payload: ClassificationRequest
): Promise<ClassificationResponse> {
  const res = await fetch(`${API_BASE}/ai/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // no JSON body — keep the status-based message
    }
    throw new Error(detail);
  }

  return (await res.json()) as ClassificationResponse;
}
