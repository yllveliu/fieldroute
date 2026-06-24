import json
import os
import re

import anthropic
from fastapi import APIRouter, HTTPException, Request

from app.core.limiter import limiter
from app.schemas.ai import ClassificationRequest, ClassificationResponse

router = APIRouter()

VALID_SERVICE_TYPES = {"plumbing", "electrical", "hvac", "general"}

SYSTEM_PROMPT = """\
You are the service classifier for FieldRoute, a home-services dispatch platform.

Your sole job: read the customer's service request and classify it into exactly one of:
  plumbing   — water leaks, pipes, sinks, toilets, faucets, drains
  electrical — power outages, outlets, breakers, lights, wiring, electricity
  hvac       — heating, cooling, air conditioning, furnace, ventilation
  general    — anything that does not clearly fit the above three

Rules:
- Do NOT answer questions, give advice, or do anything other than classify.
- Do NOT invent company information or services not listed above.
- Respond ONLY with a JSON object — no markdown fences, no preamble, no trailing text.

Required JSON shape (all four keys required):
{
  "service_type": "<plumbing|electrical|hvac|general>",
  "confidence": <float between 0.0 and 1.0>,
  "explanation": "<one sentence explaining why this category fits>",
  "eta_message": "<arrival estimate>"
}

eta_message rules:
  plumbing / electrical / hvac → "A technician can usually arrive within 2-4 hours."
  general                      → "A technician will follow up to schedule a visit."
"""


def _extract_json(text: str) -> dict:
    # Handle cases where the model wraps output in markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text).strip()
    return json.loads(cleaned)


@router.post("/classify", response_model=ClassificationResponse)
@limiter.limit("30/minute")
def classify(request: Request, payload: ClassificationRequest) -> ClassificationResponse:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=1024,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": payload.description}],
        )
    except anthropic.APIError as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}") from exc

    text = next(
        (block.text for block in response.content if hasattr(block, "text")),
        "",
    )

    try:
        data = _extract_json(text)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="AI classifier returned malformed JSON") from exc

    if data.get("service_type") not in VALID_SERVICE_TYPES:
        raise HTTPException(status_code=502, detail="AI classifier returned unknown service_type")

    return ClassificationResponse(**data)
