"""Claude-backed CV review for technician applications.

When a technician applies, their uploaded CV (PDF) is scored against the
company's required skills (``app.core.roles.SKILLS``). This isolates the Claude
call so the caller can wrap it in try/except and fall back to a neutral,
unscored result on any failure (missing key, API error, malformed response) —
the application is never blocked just because the AI review failed.

Mirrors the structure of ``app.services.ai_classifier``.
"""

from __future__ import annotations

import base64
import json
from typing import TypedDict

import anthropic

from app.core import config
from app.core.roles import SKILLS

# Fast, capable model for a single document-grounded scoring call.
MODEL = "claude-haiku-4-5"

# Request timeout in seconds; on timeout the SDK raises and the caller falls back.
REQUEST_TIMEOUT_SECONDS = 30.0

SYSTEM_PROMPT = f"""\
You are a hiring assistant for FieldRoute, a field-service company.

The company hires technicians for these skills ONLY:
{", ".join(SKILLS)}

You will be given an applicant's CV (as a PDF) and the list of skills they
claim to have. Assess how well the CV evidences suitability for the company's
required skills — weighing relevant experience, certifications, and whether
the claimed skills are actually supported by the CV.

Respond ONLY with a JSON object — no markdown fences, no preamble, no extra text.

Required JSON shape:
{{
  "match_score": <integer 0-100, overall suitability for the company's roles>,
  "summary": "<two or three sentences: strengths, gaps, and which of the required skills are well-evidenced>"
}}
"""


class CvReview(TypedDict):
    """Structured CV-review result."""

    match_score: float
    summary: str


def review_cv(
    cv_bytes: bytes,
    content_type: str,
    claimed_skills: list[str],
) -> CvReview:
    """Score a CV against the company's required skills with Claude.

    Only PDF CVs can be reviewed (Claude document input). Raises on any failure
    (non-PDF, missing key, API error, timeout, malformed/out-of-spec response)
    so the caller can fall back to an unscored application.
    The API key is read from settings only and is never logged.
    """
    api_key = config.ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    if content_type != "application/pdf":
        raise ValueError(f"CV review supports PDF only, got {content_type!r}")

    pdf_b64 = base64.standard_b64encode(cv_bytes).decode("ascii")

    client = anthropic.Anthropic(api_key=api_key, timeout=REQUEST_TIMEOUT_SECONDS)
    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "Skills the applicant claims to have: "
                            + (", ".join(claimed_skills) or "(none stated)")
                        ),
                    },
                ],
            }
        ],
    )

    data = _parse_json_object(_extract_text(response))

    # Clamp the score into [0, 100] regardless of what the model returns.
    score = max(0.0, min(100.0, float(data["match_score"])))

    return CvReview(match_score=score, summary=str(data["summary"]))


def _extract_text(response: anthropic.types.Message) -> str:
    """Return the first text block from a Claude response, or ''."""
    for block in response.content:
        if getattr(block, "type", None) == "text":
            return block.text
    return ""


def _parse_json_object(text: str) -> dict:
    """Parse a JSON object from the model's reply, tolerating markdown fences
    or surrounding prose by extracting the outermost {...} span."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        return json.loads(text[start : end + 1])
    raise ValueError(f"no JSON object in model response: {text[:200]!r}")
