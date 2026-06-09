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

// Assigned technician summary (KAN-14 JobTechnicianStatus). Null when unassigned.
export interface JobTechnicianStatus {
  name: string;
  status: string;
}

// Shape returned by the KAN-14 status endpoint (JobStatusResponse).
export interface JobStatus {
  job_id: number;
  status: string;
  eta_message: string | null;
  service: string | null;
  technician: JobTechnicianStatus | null;
}

// Raised when the backend reports the job does not exist (404).
export class JobNotFoundError extends Error {}

// Fetch the current status of a job for customer tracking (KAN-14:
// GET /jobs/{job_id}/status). Same-origin in dev via the Vite "/jobs" proxy.
export async function getJobStatus(jobId: number): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/status`);

  if (res.status === 404) {
    throw new JobNotFoundError(`Job #${jobId} was not found.`);
  }

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

  return (await res.json()) as JobStatus;
}
