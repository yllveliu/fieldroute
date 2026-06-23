import math
import time

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def _retry_after_seconds(request: Request) -> int:
    current_limit = getattr(request.state, "view_rate_limit", None)
    if current_limit is None:
        return 60

    try:
        reset_at, _remaining = request.app.state.limiter.limiter.get_window_stats(
            current_limit[0],
            *current_limit[1],
        )
    except Exception:  # noqa: BLE001 - fall back to a clear, conservative retry hint
        return 60

    return max(1, math.ceil((reset_at + 1) - time.time()))


def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,  # noqa: ARG001 - required by FastAPI/slowapi handler API
) -> JSONResponse:
    retry_after = _retry_after_seconds(request)
    response = JSONResponse(
        status_code=429,
        content={
            "error": f"Rate limit exceeded. Try again in {retry_after} seconds.",
        },
    )
    response.headers["Retry-After"] = str(retry_after)
    return response
