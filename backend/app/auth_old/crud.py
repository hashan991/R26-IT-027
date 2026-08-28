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