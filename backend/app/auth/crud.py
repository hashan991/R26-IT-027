from bson import ObjectId

from app.database import database


users_collection = database["users"]


# =========================================================
# FIND USER BY EMAIL
# =========================================================

async def get_user_by_email(email: str):
    return await users_collection.find_one(
        {
            "email": email.lower()
        }
    )


# =========================================================
# FIND USER BY ID
# =========================================================

async def get_user_by_id(user_id: str):

    if not ObjectId.is_valid(user_id):
        return None

    return await users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )


# =========================================================
# CREATE USER
# =========================================================

async def create_user(user_data: dict):

    result = await users_collection.insert_one(
        user_data
    )

    return await get_user_by_id(
        str(result.inserted_id)
    )


# =========================================================
# UPDATE USER PROFILE
# =========================================================

async def update_user_profile(
    user_id: str,
    update_data: dict,
):

    if not ObjectId.is_valid(user_id):
        return None

    await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": update_data
        },
    )

    return await get_user_by_id(
        user_id
    )


# =========================================================
# UPDATE USER PASSWORD
# =========================================================

async def update_user_password(
    user_id: str,
    password_hash: str,
    updated_at,
):

    if not ObjectId.is_valid(user_id):
        return False

    result = await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "password_hash": password_hash,
                "updated_at": updated_at,
                "password_changed_at": updated_at,
            }
        },
    )

    return result.matched_count > 0


# =========================================================
# DELETE USER
# =========================================================

async def delete_user_by_id(
    user_id: str,
) -> bool:

    if not ObjectId.is_valid(user_id):
        return False

    result = await users_collection.delete_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    return result.deleted_count > 0


# =========================================================
# COUNT ACTIVE APPROVED ADMINS
# =========================================================

async def count_active_approved_admins() -> int:

    return await users_collection.count_documents(
        {
            "role": "ADMIN",
            "is_active": True,
            "is_approved": True,
        }
    )
