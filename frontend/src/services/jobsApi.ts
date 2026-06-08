// Customer job request API service (KAN-12 endpoint: POST /jobs).

// Relative base: in dev, Vite proxies "/jobs" to the backend (see
// vite.config.ts), so the browser makes a same-origin request and CORS
// does not apply.
const API_BASE = "";

// Shape sent to the backend. Mirrors JobRequestCreate in app/schemas/job.py.
export interface JobRequestPayload {
  customer_name: string;
  phone: string;
  address: string;
  raw_description: string;
}

// Shape returned by the backend on success (JobRequestResponse).
export interface JobRequestResult {
  job_id: number;
  status: string;
  message: string;
}

export async function submitJobRequest(
  payload: JobRequestPayload
): Promise<JobRequestResult> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Try to surface a helpful backend message; fall back to the status code.
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // response had no JSON body — keep the status-based message
    }
    throw new Error(detail);
  }

  return (await res.json()) as JobRequestResult;
}
