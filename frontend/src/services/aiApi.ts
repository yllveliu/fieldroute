// AI classification API client. Mirrors ClassificationRequest / ClassificationResponse in backend/app/schemas/ai.py.
import { apiPost } from '../api/client'

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
  return apiPost<ClassificationResponse>('/ai/classify', payload)
}
