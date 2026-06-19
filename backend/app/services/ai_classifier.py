"""Claude-backed AI classification for job service requests (KAN-67).

This module isolates the Claude API call so the route can call it behind a
try/except and fall back to the KAN-31 keyword classifier on any failure
(missing key, API error, timeout, malformed response). It deliberately raises
on every failure path rather than returning a partial result, so the caller
has a single, simple fallback decision to make.

The Claude client is constructed inside ``classify_with_claude`` so tests can
mock ``anthropic.Anthropic`` without a live API call.
"""

from __future__ import annotations

import json
from typing import TypedDict

import anthropic

from app.core import config

# Current, fast Claude model — best fit for a single-call classification task.
# Confirmed against the Anthropic model catalog.
MODEL = "claude-haiku-4-5"

# Request timeout in seconds; on timeout the SDK raises and the route falls back.
REQUEST_TIMEOUT_SECONDS = 12.0

# Service categories must match the KAN-31 keyword classifier so the persisted
# ai_service_type stays consistent regardless of which classifier produced it.
VALID_SERVICE_TYPES = ("Plumbing", "Electrical", "HVAC", "Carpentry", "General")

SYSTEM_PROMPT = """\
You are the service classifier for FieldRoute, a field-service dispatch platform.

Classify the customer's problem description into exactly one service_type:
  Plumbing   — pipes, leaks, drains, water, sinks, toilets, faucets, sewage
  Electrical — wiring, outlets, breakers, power, lights, switches, fuses
  HVAC       — heating, cooling, air conditioning, furnace, ventilation, ducts
  Carpentry  — wood, doors, windows, cabinets, floors, walls, roofs, tiling
  General    — anything that does not clearly fit the categories above

Respond ONLY with a JSON object — no markdown fences, no preamble, no extra text.

Required JSON shape (all four keys required):
{
  "service_type": "<Plumbing|Electrical|HVAC|Carpentry|General>",
  "confidence": <float between 0.0 and 1.0>,
  "explanation": "<one short sentence explaining the category choice>",
  "eta": "<short technician arrival estimate>"
}
"""


class AiClassification(TypedDict):
    """Structured classification result returned by the Claude classifier."""

    service_type: str
    confidence: float
    explanation: str
    eta: str


def _extract_text(response: anthropic.types.Message) -> str:
    """Return the first text block from a Claude response, or ''."""
    for block in response.content:
        if getattr(block, "type", None) == "text":
            return block.text
    return ""


def classify_with_claude(description: str) -> AiClassification:
    """Classify a problem description with Claude.

    Raises on any failure (missing key, API error, timeout, malformed or
    out-of-spec response) so the caller can fall back to the keyword classifier.
    The API key is read from settings only and is never logged.
    """
    api_key = config.ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=api_key, timeout=REQUEST_TIMEOUT_SECONDS)
    response = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": description}],
    )

    data = json.loads(_extract_text(response))

    service_type = data["service_type"]
    if service_type not in VALID_SERVICE_TYPES:
        raise ValueError(f"unknown service_type: {service_type!r}")

    # Clamp confidence into [0.0, 1.0] regardless of what the model returns.
    confidence = max(0.0, min(1.0, float(data["confidence"])))

    return AiClassification(
        service_type=service_type,
        confidence=confidence,
        explanation=str(data["explanation"]),
        eta=str(data["eta"]),
    )
