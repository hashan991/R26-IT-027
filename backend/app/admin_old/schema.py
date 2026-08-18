from datetime import datetime

from pydantic import BaseModel

from app.auth.schema import UserRole


# =========================================================
# ADMIN USER RESPONSE
# =========================================================

class AdminUserResponse(BaseModel):
    id: str

    first_name: str
    last_name: str
    email: str

    requested_role: UserRole
    role: UserRole | None

    is_active: bool
    is_approved: bool

    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_login: datetime | None = None


# =========================================================
# CHANGE USER ROLE
# =========================================================

class ChangeUserRoleRequest(BaseModel):
    role: UserRole


# =========================================================
# GENERAL ADMIN ACTION RESPONSE
# =========================================================

class AdminActionResponse(BaseModel):
    message: str
    user: AdminUserResponse