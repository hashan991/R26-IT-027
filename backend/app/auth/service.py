from datetime import datetime, timezone

from fastapi import HTTPException, status

from .crud import (
    count_active_approved_admins,
    create_user,
    delete_user_by_id,
    get_user_by_email,
    get_user_by_id,
    update_user_password,
    update_user_profile,
)

from .schema import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    UserRole,
)

from .security import (
    create_access_token,
    hash_password,
    verify_password,
)


# =========================================================
# SERIALIZE PROFILE
# =========================================================


def serialize_profile(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "email": user.get("email", ""),
        "role": user.get("role"),
        "is_active": user.get("is_active", False),
        "is_approved": user.get("is_approved", False),
        "requested_role": user.get("requested_role"),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
        "last_login": user.get("last_login"),
    }


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

    # Last login update කරනවා
    now = datetime.now(timezone.utc)

    user = await update_user_profile(
        str(user["_id"]),
        {
            "last_login": now,
        },
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


# =========================================================
# GET OWN PROFILE
# =========================================================

async def get_my_profile(
    current_user: dict,
):

    return serialize_profile(
        current_user
    )


# =========================================================
# UPDATE OWN PROFILE
# =========================================================
#
# Only first_name and last_name can be changed here.
# Email and role are intentionally excluded.
# =========================================================

async def update_my_profile(
    current_user: dict,
    data: UpdateProfileRequest,
):

    user_id = str(
        current_user["_id"]
    )

    updated_user = await update_user_profile(
        user_id,
        {
            "first_name": data.first_name,
            "last_name": data.last_name,
            "updated_at": datetime.now(timezone.utc),
        },
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )

    return serialize_profile(
        updated_user
    )


# =========================================================
# CHANGE OWN PASSWORD
# =========================================================

async def change_my_password(
    current_user: dict,
    data: ChangePasswordRequest,
):

    current_password_hash = current_user.get(
        "password_hash"
    )

    if not current_password_hash:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password information is unavailable",
        )

    # Current password එක verify කරනවා
    if not verify_password(
        data.current_password,
        current_password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # New passwords දෙක match වෙනවද?
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match",
        )

    # Old password එකම new password එක විදිහට දාන එක block කරනවා
    if verify_password(
        data.new_password,
        current_password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "New password must be different "
                "from the current password"
            ),
        )

    new_password_hash = hash_password(
        data.new_password
    )

    updated = await update_user_password(
        user_id=str(current_user["_id"]),
        password_hash=new_password_hash,
        updated_at=datetime.now(timezone.utc),
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )

    return {
        "message": "Password changed successfully"
    }


# =========================================================
# DELETE OWN ACCOUNT
# =========================================================

async def delete_my_account(
    current_user: dict,
):

    # Last active approved admin account එක delete කරන්න දෙන්නේ නෑ.
    if (
        current_user.get("role")
        == UserRole.ADMIN.value
    ):
        admin_count = await count_active_approved_admins()

        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The only active administrator "
                    "account cannot be deleted"
                ),
            )

    deleted = await delete_user_by_id(
        str(current_user["_id"])
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )

    return {
        "message": "Account deleted successfully"
    }
