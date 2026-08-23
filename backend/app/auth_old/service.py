from datetime import datetime, timezone

from fastapi import HTTPException, status

from .crud import (
    create_user,
    get_user_by_email,
)

from .schema import (
    RegisterRequest,
    LoginRequest,
)

from .security import (
    hash_password,
    verify_password,
    create_access_token,
)


# =========================================================
# REGISTER USER
# =========================================================

async def register_user(data: RegisterRequest):

    # Passwords match ද බලනවා
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    # Email එක already register වෙලාද බලනවා
    existing_user = await get_user_by_email(
        data.email
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Password එක hash කරනවා
    password_hash = hash_password(
        data.password
    )

    # MongoDB එකට save කරන user object එක
    user_data = {
        "first_name": data.first_name.strip(),
        "last_name": data.last_name.strip(),

        "email": data.email.lower(),

        "password_hash": password_hash,

        "requested_role": data.requested_role.value,

        "role": None,

        "is_active": True,
        "is_approved": False,

        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),

        "last_login": None,
    }

    user = await create_user(
        user_data
    )

    return user


# =========================================================
# LOGIN USER
# =========================================================

async def login_user(data: LoginRequest):

    # Email එකෙන් user හොයනවා
    user = await get_user_by_email(
        data.email
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Password verify කරනවා
    password_valid = verify_password(
        data.password,
        user["password_hash"],
    )

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Account active ද?
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Admin approve කරලාද?
    if not user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is waiting for admin approval",
        )

    # Role assign කරලා තියෙනවද?
    if not user.get("role"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role has not been assigned",
        )

    # JWT token create කරනවා
    access_token = create_access_token(
        user_id=str(user["_id"]),
        role=user["role"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user["is_active"],
            "is_approved": user["is_approved"],
        },
    }