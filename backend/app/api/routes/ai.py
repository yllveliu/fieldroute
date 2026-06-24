from fastapi import APIRouter, Request

from app.core.limiter import limiter
from app.schemas.ai import ClassificationRequest, ClassificationResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Keyword classifier (no external API calls)
# The Anthropic integration is commented out below. This local classifier
# returns the same response shape so the frontend works identically.
# ---------------------------------------------------------------------------

_RULES: list[tuple[str, list[str]]] = [
    ("plumbing",   ["pipe", "pipes", "leak", "leaking", "drain", "drains", "sink",
                    "toilet", "faucet", "water", "flood", "burst", "sewage",
                    "clog", "clogged", "tap", "plumb", "plumbing", "bathroom",
                    "kitchen sink", "dripping"]),
    ("electrical", ["electric", "electrical", "power", "outlet", "breaker",
                    "light", "lights", "lighting", "wiring", "wire", "circuit",
                    "voltage", "socket", "switch", "fuse", "blown", "flicker",
                    "flickering", "sparks", "short", "panel"]),
    ("hvac",       ["hvac", "heating", "cooling", "air conditioning", "ac",
                    "furnace", "ventilation", "thermostat", "heat", "cold",
                    "warm", "airflow", "air flow", "refrigerant", "boiler",
                    "duct", "ducts", "fan", "blower"]),
]

_ETA = {
    "plumbing":   "A technician can usually arrive within 2-4 hours.",
    "electrical": "A technician can usually arrive within 2-4 hours.",
    "hvac":       "A technician can usually arrive within 2-4 hours.",
    "general":    "A technician will follow up to schedule a visit.",
}

_EXPLANATIONS = {
    "plumbing":   "The description mentions water or plumbing-related terms.",
    "electrical": "The description mentions electrical or power-related terms.",
    "hvac":       "The description mentions heating, cooling, or ventilation terms.",
    "general":    "No specific service keywords were detected; routed to general support.",
}


def _classify_local(description: str) -> ClassificationResponse:
    text = description.lower()
    for service_type, keywords in _RULES:
        if any(kw in text for kw in keywords):
            return ClassificationResponse(
                service_type=service_type,
                confidence=0.92,
                explanation=_EXPLANATIONS[service_type],
                eta_message=_ETA[service_type],
            )
    return ClassificationResponse(
        service_type="general",
        confidence=0.75,
        explanation=_EXPLANATIONS["general"],
        eta_message=_ETA["general"],
    )


@router.post("/classify", response_model=ClassificationResponse)
@limiter.limit("30/minute")
def classify(request: Request, payload: ClassificationRequest) -> ClassificationResponse:
    return _classify_local(payload.description)


# ---------------------------------------------------------------------------
# Anthropic integration — commented out, ready to re-enable when needed
# ---------------------------------------------------------------------------
# import json
# import os
# import re
# import anthropic
# from fastapi import HTTPException
#
# VALID_SERVICE_TYPES = {"plumbing", "electrical", "hvac", "general"}
#
# SYSTEM_PROMPT = """\
# You are the service classifier for FieldRoute, a home-services dispatch platform.
# ...
# """
#
# def _extract_json(text: str) -> dict:
#     cleaned = re.sub(r"```(?:json)?\s*", "", text).strip()
#     return json.loads(cleaned)
#
# def _classify_anthropic(payload: ClassificationRequest) -> ClassificationResponse:
#     api_key = os.environ.get("ANTHROPIC_API_KEY")
#     if not api_key:
#         raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not configured")
#     client = anthropic.Anthropic(api_key=api_key)
#     try:
#         response = client.messages.create(
#             model="claude-opus-4-8",
#             max_tokens=1024,
#             thinking={"type": "adaptive"},
#             system=SYSTEM_PROMPT,
#             messages=[{"role": "user", "content": payload.description}],
#         )
#     except anthropic.APIError as exc:
#         raise HTTPException(status_code=502, detail="AI service error.") from exc
#     text = next(
#         (block.text for block in response.content if hasattr(block, "text")), ""
#     )
#     try:
#         data = _extract_json(text)
#     except (json.JSONDecodeError, ValueError) as exc:
#         raise HTTPException(status_code=502, detail="AI classifier returned malformed JSON") from exc
#     if data.get("service_type") not in VALID_SERVICE_TYPES:
#         raise HTTPException(status_code=502, detail="AI classifier returned unknown service_type")
#     return ClassificationResponse(**data)
