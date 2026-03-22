from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings

# This tells FastAPI to look for the token in the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_token_payload(token: str = Depends(oauth2_scheme)):
    """Validates the JWT and extracts the payload (including org_id)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        org_id: int = payload.get("org_id")
        if org_id is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception