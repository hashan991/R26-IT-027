from fastapi import APIRouter, status

from .schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
)

from .service import (
    register_user,
    login_user,
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