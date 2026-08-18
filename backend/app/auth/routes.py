from fastapi import (
    APIRouter,
    Depends,
    status,
)

from .dependencies import (
    get_current_user,
)

from .schema import (
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    ProfileResponse,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
)

from .service import (
    change_my_password,
    delete_my_account,
    get_my_profile,
    login_user,
    register_user,
    update_my_profile,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
async def register(data: RegisterRequest):

    user = await register_user(data)

    return {
        "message": "Registration successful. Waiting for admin approval.",
        "user_id": str(user["_id"]),
        "email": user["email"],
        "requested_role": user["requested_role"],
        "is_approved": user["is_approved"],
    }


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(data: LoginRequest):

    return await login_user(data)


# =========================================================
# GET MY PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=ProfileResponse,
)
async def get_profile(
    current_user=Depends(
        get_current_user
    ),
):

    return await get_my_profile(
        current_user
    )


# =========================================================
# UPDATE MY PROFILE
# =========================================================

@router.patch(
    "/profile",
    response_model=ProfileResponse,
)
async def update_profile(
    data: UpdateProfileRequest,
    current_user=Depends(
        get_current_user
    ),
):

    return await update_my_profile(
        current_user=current_user,
        data=data,
    )


# =========================================================
# CHANGE MY PASSWORD
# =========================================================

@router.post(
    "/change-password",
    response_model=MessageResponse,
)
async def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(
        get_current_user
    ),
):

    return await change_my_password(
        current_user=current_user,
        data=data,
    )


# =========================================================
# DELETE MY ACCOUNT
# =========================================================

@router.delete(
    "/profile",
    response_model=MessageResponse,
)
async def delete_profile(
    current_user=Depends(
        get_current_user
    ),
):

    return await delete_my_account(
        current_user
    )
