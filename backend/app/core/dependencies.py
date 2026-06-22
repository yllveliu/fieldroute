from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

# Tells FastAPI where clients send their token.
# auto_error=False so we can return a clean 401 ourselves instead of a framework error.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer token from the Authorization header.
    Returns the authenticated User object.
    Raises 401 if token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Please log in.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None:
        raise credentials_exception

    return user


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but returns None instead of raising when there is
    no/invalid token. Used by endpoints that are public but behave differently
    for an authenticated user (e.g. a technician submitting a service request)."""
    if token is None:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    email = payload.get("sub")
    if email is None:
        return None
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def require_role(*roles: str):
    """
    Factory that returns a FastAPI dependency enforcing role-based access.

    Usage in a route:
        @router.get("/admin-only")
        def admin_route(user: User = Depends(require_role("admin"))):
            ...

    Raises 403 if the authenticated user's role is not in the allowed list.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(roles)}.",
            )
        return current_user
    return role_checker


def require_approved_technician(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency for technician-only features.

    A technician whose application is still pending (or was rejected) can log in
    and see their status, but must not reach technician functionality. This
    enforces that gate: 403 unless the user is a technician with an approved,
    active record.
    """
    technician = current_user.technician
    if (
        current_user.role != "technician"
        or technician is None
        or not technician.is_active
        or technician.application_status != "approved"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your technician application has not been approved yet.",
        )
    return current_user
