from fastapi import HTTPException, status

from app.auth.schema import UserRole

from .crud import (
    get_all_users,
    get_pending_users,
    get_admin_user_by_id,
    approve_user,
    disable_user,
    enable_user,
    change_user_role,
    delete_user,
)


# =========================================================
# FORMAT USER RESPONSE
# =========================================================

def format_user(user: dict) -> dict:

    return {
        "id": str(user["_id"]),

        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email": user["email"],

        "requested_role": user.get("requested_role"),
        "role": user.get("role"),

        "is_active": user.get("is_active", False),
        "is_approved": user.get("is_approved", False),

        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
        "last_login": user.get("last_login"),
    }


# =========================================================
# LIST ALL USERS
# =========================================================

async def list_all_users():

    users = await get_all_users()

    return [
        format_user(user)
        for user in users
    ]


# =========================================================
# LIST PENDING USERS
# =========================================================

async def list_pending_users():

    users = await get_pending_users()

    return [
        format_user(user)
        for user in users
    ]


# =========================================================
# APPROVE USER
# =========================================================

async def approve_registered_user(
    user_id: str,
):

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.get("is_approved"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already approved",
        )

    requested_role = user.get(
        "requested_role"
    )

    allowed_roles = {
        UserRole.BEAN_QUALITY_INSPECTOR.value,
        UserRole.POWDER_QUALITY_INSPECTOR.value,
        UserRole.PACKAGING_QUALITY_INSPECTOR.value,
        UserRole.SALES_ANALYST.value,
    }

    if requested_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid requested role",
        )

    updated_user = await approve_user(
        user_id
    )

    return {
        "message": "User approved successfully",
        "user": format_user(updated_user),
    }


# =========================================================
# DISABLE USER
# =========================================================

async def disable_registered_user(
    user_id: str,
    current_admin: dict,
):

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admin තමන්ගේ account එක disable කිරීම block කරනවා
    if str(user["_id"]) == str(
        current_admin["_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot disable your own administrator account",
        )

    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is already disabled",
        )

    updated_user = await disable_user(
        user_id
    )

    return {
        "message": "User disabled successfully",
        "user": format_user(updated_user),
    }


# =========================================================
# ENABLE USER
# =========================================================

async def enable_registered_user(
    user_id: str,
):

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is already active",
        )

    updated_user = await enable_user(
        user_id
    )

    return {
        "message": "User enabled successfully",
        "user": format_user(updated_user),
    }


# =========================================================
# UPDATE USER ROLE
# =========================================================

async def update_registered_user_role(
    user_id: str,
    new_role: UserRole,
    current_admin: dict,
):

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admin තමන්ගේ role එක change කිරීම block කරනවා
    if str(user["_id"]) == str(
        current_admin["_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own administrator role",
        )

    # වෙන user කෙනෙක් ADMIN කරන්නත් දැනට block කරනවා
    if new_role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator role cannot be assigned from this endpoint",
        )

    updated_user = await change_user_role(
        user_id=user_id,
        new_role=new_role.value,
    )

    return {
        "message": "User role updated successfully",
        "user": format_user(updated_user),
    }

# =========================================================
# DELETE USER
# =========================================================

async def delete_registered_user(
    user_id: str,
    current_admin: dict,
):

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Logged-in admin cannot delete their own account here.
    if str(user["_id"]) == str(
        current_admin["_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own administrator account from User Management",
        )

    # Administrator accounts are protected in User Management.
    # Admin self-deletion, when allowed by policy, belongs to My Profile.
    if user.get("role") == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts are protected and cannot be deleted from User Management",
        )

    deleted_user = await delete_user(
        user_id
    )

    if not deleted_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "message": "User deleted successfully",
        "user": format_user(deleted_user),
    }
