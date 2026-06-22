from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token containing the given data payload."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token. Returns the payload dict or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def _reset_secret(password_hash: str) -> str:
    """Per-user signing secret for password-reset tokens.

    Mixing in the current password hash makes a reset token single-use: once the
    password is changed the hash changes, so any previously issued token (and any
    duplicate) stops verifying. No extra table needed.
    """
    return f"{SECRET_KEY}:{password_hash}"


def create_password_reset_token(user_id: int, password_hash: str) -> str:
    """Create a short-lived (1 hour) single-use password-reset token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    return jwt.encode(
        {"sub": str(user_id), "purpose": "password_reset", "exp": expire},
        _reset_secret(password_hash),
        algorithm=ALGORITHM,
    )


def unverified_reset_user_id(token: str) -> Optional[int]:
    """Read the user id from a reset token WITHOUT verifying the signature.

    Used only to locate the user so their current password hash can be fetched
    to perform the real verification in ``verify_password_reset_token``.
    """
    try:
        claims = jwt.get_unverified_claims(token)
    except JWTError:
        return None
    sub = claims.get("sub")
    try:
        return int(sub) if sub is not None else None
    except (TypeError, ValueError):
        return None


def verify_password_reset_token(token: str, password_hash: str) -> Optional[int]:
    """Verify a reset token against the user's current hash. Returns the user id
    or None if the token is invalid, expired, already used, or for another user."""
    try:
        payload = jwt.decode(
            token, _reset_secret(password_hash), algorithms=[ALGORITHM]
        )
    except JWTError:
        return None
    if payload.get("purpose") != "password_reset":
        return None
    sub = payload.get("sub")
    return int(sub) if sub is not None else None
