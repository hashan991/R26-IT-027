import os
import asyncio

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017",
)

MONGODB_DB_NAME = os.getenv(
    "MONGODB_DB_NAME",
    "coffee_quality_ai",
)

client = AsyncIOMotorClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
)

database = client[MONGODB_DB_NAME]


def get_database():
    return database


async def check_database_connection():
    last_error = None

    for attempt in range(1, 5):
        try:
            await client.admin.command("ping")
            print(f"✅ MongoDB connected on attempt {attempt}")
            return True

        except Exception as error:
            last_error = error
            print(
                f"⚠️ MongoDB attempt {attempt}/4 failed: {error}"
            )

            if attempt < 4:
                await asyncio.sleep(2)

    raise last_error


def close_database_connection():
    client.close()