from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from .crud import get_user_by_id
from .schema import UserRole
from .security import decode_access_token


# =========================================================
# BEARER TOKEN SECURITY
# =========================================================

bearer_scheme = HTTPBearer(
    auto_error=False
)


# =========================================================
# GET CURRENT LOGGED-IN USER
# =========================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
):

    # Token එක request එකේ නැත්නම්
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # Bearer scheme එක correct ද බලනවා
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    token = credentials.credentials

    # JWT decode කරනවා
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # JWT එකෙන් user ID එක ගන්නවා
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # Database එකෙන් real user එක ගන්නවා
    user = await get_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
        )

    # Account disabled ද?
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    # Admin approve කරලාද?
    if not user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not approved",
        )

    # Role එකක් තියෙනවද?
    if not user.get("role"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role has not been assigned",
        )

    return user


# =========================================================
# ROLE-BASED ACCESS CONTROL
# =========================================================

def require_roles(
    *allowed_roles: UserRole,
):

    async def role_checker(
        current_user=Depends(
            get_current_user
        ),
    ):

        current_role = current_user.get(
            "role"
        )

        # Adminට සියලු modules access කරන්න පුළුවන්
        if current_role == UserRole.ADMIN.value:
            return current_user

        allowed_role_values = {
            role.value
            for role in allowed_roles
        }

        if current_role not in allowed_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to access this resource"
                ),
            )

        return current_user

    return role_checker