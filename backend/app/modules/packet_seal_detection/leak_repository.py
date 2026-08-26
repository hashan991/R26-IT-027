from datetime import datetime

from app.database import get_database


# MongoDB collection
database = get_database()

leak_collection = database["leak_tests"]



# ==========================================
# SAVE LEAK TEST RESULT
# ==========================================

async def save_leak_test(result):

    try:

        document = result.copy()

        document["created_at"] = datetime.utcnow()


        await leak_collection.insert_one(
            document
        )


        return True


    except Exception as error:

        print(
            "MongoDB Leak Save Error:",
            error
        )

        return False



# ==========================================
# GET PREVIOUS LEAK TESTS
# ==========================================

async def get_leak_history(limit=50):

    cursor = (
        leak_collection
        .find({})
        .sort(
            "created_at",
            -1
        )
        .limit(limit)
    )


    history = []


    async for item in cursor:

        item["_id"] = str(
            item["_id"]
        )

        history.append(item)


    return history