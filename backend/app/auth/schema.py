from enum import Enum

from pydantic import BaseModel, EmailStr, Field


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