from fastapi import APIRouter, Depends

from app.auth.dependencies import require_roles
from app.auth.schema import UserRole

from .schema import (
    AdminUserResponse,
    ChangeUserRoleRequest,
    AdminActionResponse,
)

from .service import (
    list_all_users,
    list_pending_users,
    approve_registered_user,
    disable_registered_user,
    enable_registered_user,
    update_registered_user_role,
    delete_registered_user,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin User Management"],
)


# =========================================================
# GET ALL USERS
# =========================================================

@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
async def get_users(
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await list_all_users()


# =========================================================
# GET PENDING USERS
# =========================================================

@router.get(
    "/users/pending",
    response_model=list[AdminUserResponse],
)
async def get_pending(
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await list_pending_users()


# =========================================================
# APPROVE USER
# =========================================================

@router.patch(
    "/users/{user_id}/approve",
    response_model=AdminActionResponse,
)
async def approve_user_account(
    user_id: str,
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await approve_registered_user(
        user_id
    )


# =========================================================
# DISABLE USER
# =========================================================

@router.patch(
    "/users/{user_id}/disable",
    response_model=AdminActionResponse,
)
async def disable_user_account(
    user_id: str,
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await disable_registered_user(
        user_id=user_id,
        current_admin=current_admin,
    )


# =========================================================
# ENABLE USER
# =========================================================

@router.patch(
    "/users/{user_id}/enable",
    response_model=AdminActionResponse,
)
async def enable_user_account(
    user_id: str,
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await enable_registered_user(
        user_id
    )


# =========================================================
# CHANGE USER ROLE
# =========================================================

@router.patch(
    "/users/{user_id}/role",
    response_model=AdminActionResponse,
)
async def change_user_role(
    user_id: str,
    data: ChangeUserRoleRequest,
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await update_registered_user_role(
        user_id=user_id,
        new_role=data.role,
        current_admin=current_admin,
    )

# =========================================================
# DELETE USER
# =========================================================

@router.delete(
    "/users/{user_id}",
    response_model=AdminActionResponse,
)
async def delete_user_account(
    user_id: str,
    current_admin=Depends(
        require_roles(
            UserRole.ADMIN
        )
    ),
):

    return await delete_registered_user(
        user_id=user_id,
        current_admin=current_admin,
    )
