from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    BEAN_QUALITY_INSPECTOR = "BEAN_QUALITY_INSPECTOR"
    POWDER_QUALITY_INSPECTOR = "POWDER_QUALITY_INSPECTOR"
    PACKAGING_QUALITY_INSPECTOR = "PACKAGING_QUALITY_INSPECTOR"
    SALES_ANALYST = "SALES_ANALYST"


class RegistrationRole(str, Enum):
    BEAN_QUALITY_INSPECTOR = "BEAN_QUALITY_INSPECTOR"
    POWDER_QUALITY_INSPECTOR = "POWDER_QUALITY_INSPECTOR"
    PACKAGING_QUALITY_INSPECTOR = "PACKAGING_QUALITY_INSPECTOR"
    SALES_ANALYST = "SALES_ANALYST"


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)

    email: EmailStr

    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    requested_role: RegistrationRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str

    first_name: str
    last_name: str

    email: EmailStr

    role: UserRole

    is_active: bool
    is_approved: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# =========================================================
# PROFILE RESPONSE
# =========================================================

class ProfileResponse(BaseModel):
    id: str

    first_name: str
    last_name: str

    # Email is displayed in My Profile but cannot be
    # changed by the logged-in user.
    email: EmailStr

    # Role is displayed in My Profile but remains under
    # administrator control.
    role: UserRole

    is_active: bool
    is_approved: bool

    requested_role: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# =========================================================
# UPDATE OWN PROFILE
# =========================================================
#
# IMPORTANT:
# email and role are intentionally NOT present here.
# Therefore the self-profile API cannot update them.
# =========================================================

class UpdateProfileRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)

    @field_validator(
        "first_name",
        "last_name",
    )
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()

        if len(cleaned) < 2:
            raise ValueError(
                "Name must contain at least 2 characters"
            )

        return cleaned


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        min_length=1,
        max_length=128,
    )

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )

    confirm_password: str = Field(
        min_length=8,
        max_length=128,
    )


# =========================================================
# SIMPLE MESSAGE RESPONSE
# =========================================================

class MessageResponse(BaseModel):
    message: str
