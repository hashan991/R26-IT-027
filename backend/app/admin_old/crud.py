from datetime import datetime, timezone

from bson import ObjectId

from app.database import database


users_collection = database["users"]


# =========================================================
# GET ALL USERS
# =========================================================

async def get_all_users():

    users = []

    cursor = users_collection.find(
        {}
    ).sort(
        "created_at",
        -1,
    )

    async for user in cursor:
        users.append(user)

    return users


# =========================================================
# GET PENDING USERS
# =========================================================

async def get_pending_users():

    users = []

    cursor = users_collection.find(
        {
            "is_approved": False
        }
    ).sort(
        "created_at",
        -1,
    )

    async for user in cursor:
        users.append(user)

    return users


# =========================================================
# GET USER BY ID
# =========================================================

async def get_admin_user_by_id(
    user_id: str,
):

    if not ObjectId.is_valid(user_id):
        return None

    return await users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )


# =========================================================
# APPROVE USER
# =========================================================

async def approve_user(
    user_id: str,
):

    if not ObjectId.is_valid(user_id):
        return None

    user = await get_admin_user_by_id(
        user_id
    )

    if not user:
        return None

    requested_role = user.get(
        "requested_role"
    )

    await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "role": requested_role,
                "is_approved": True,
                "is_active": True,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    return await get_admin_user_by_id(
        user_id
    )


# =========================================================
# DISABLE USER
# =========================================================

async def disable_user(
    user_id: str,
):

    if not ObjectId.is_valid(user_id):
        return None

    await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    return await get_admin_user_by_id(
        user_id
    )


# =========================================================
# ENABLE USER
# =========================================================

async def enable_user(
    user_id: str,
):

    if not ObjectId.is_valid(user_id):
        return None

    await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "is_active": True,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    return await get_admin_user_by_id(
        user_id
    )


# =========================================================
# CHANGE USER ROLE
# =========================================================

async def change_user_role(
    user_id: str,
    new_role: str,
):

    if not ObjectId.is_valid(user_id):
        return None

    await users_collection.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "role": new_role,
                "is_approved": True,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    return await get_admin_user_by_id(
        user_id
    )