"""Unit tests for the KAN-67 Claude classifier and the health endpoint.

The Claude client is mocked — no test makes a live API call.
"""

import asyncio
import json
from types import SimpleNamespace
from unittest import mock

from app.core import config
from app.services import ai_classifier


def _fake_response(payload: dict) -> SimpleNamespace:
    """Build a stand-in Claude response carrying one JSON text block."""
    block = SimpleNamespace(type="text", text=json.dumps(payload))
    return SimpleNamespace(content=[block])


def _mock_anthropic(payload: dict) -> mock.MagicMock:
    """Return a mock for anthropic.Anthropic whose client yields `payload`."""
    client = mock.MagicMock()
    client.messages.create.return_value = _fake_response(payload)
    factory = mock.MagicMock(return_value=client)
    return factory


def test_classify_with_claude_parses_structured_result():
    payload = {
        "service_type": "Plumbing",
        "confidence": 0.91,
        "explanation": "Burst pipe flooding the kitchen.",
        "eta": "A technician can arrive within 2-4 hours.",
    }
    factory = _mock_anthropic(payload)

    with mock.patch.object(config, "ANTHROPIC_API_KEY", "test-key"), \
            mock.patch.object(ai_classifier.anthropic, "Anthropic", factory):
        result = ai_classifier.classify_with_claude("My kitchen pipe burst")

    # The mocked client was used — no live call was made.
    factory.assert_called_once()
    factory.return_value.messages.create.assert_called_once()

    assert result["service_type"] == "Plumbing"
    assert result["confidence"] == 0.91
    assert result["explanation"] == "Burst pipe flooding the kitchen."
    assert result["eta"] == "A technician can arrive within 2-4 hours."


def test_confidence_is_clamped_to_unit_interval():
    payload = {
        "service_type": "Electrical",
        "confidence": 4.2,  # out of range — must be clamped to 1.0
        "explanation": "Sparking outlet.",
        "eta": "Within 2-4 hours.",
    }
    factory = _mock_anthropic(payload)

    with mock.patch.object(config, "ANTHROPIC_API_KEY", "test-key"), \
            mock.patch.object(ai_classifier.anthropic, "Anthropic", factory):
        result = ai_classifier.classify_with_claude("Outlet is sparking")

    assert result["confidence"] == 1.0


def test_missing_key_raises_so_route_can_fall_back():
    factory = _mock_anthropic({})

    with mock.patch.object(config, "ANTHROPIC_API_KEY", ""), \
            mock.patch.object(ai_classifier.anthropic, "Anthropic", factory):
        try:
            ai_classifier.classify_with_claude("anything")
        except RuntimeError:
            pass
        else:  # pragma: no cover
            raise AssertionError("expected RuntimeError when key is missing")

    # No client is constructed when the key is absent.
    factory.assert_not_called()


def test_unknown_service_type_raises():
    payload = {
        "service_type": "Telepathy",  # not a valid category
        "confidence": 0.5,
        "explanation": "n/a",
        "eta": "n/a",
    }
    factory = _mock_anthropic(payload)

    with mock.patch.object(config, "ANTHROPIC_API_KEY", "test-key"), \
            mock.patch.object(ai_classifier.anthropic, "Anthropic", factory):
        try:
            ai_classifier.classify_with_claude("something odd")
        except ValueError:
            pass
        else:  # pragma: no cover
            raise AssertionError("expected ValueError for unknown service_type")


def test_health_endpoint_still_works():
    from app.api.routes.health import health

    result = asyncio.run(health())
    assert result == {"status": "ok", "service": "fieldroute-api"}
