import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "coffee_quality_ai")

client = AsyncIOMotorClient(MONGODB_URI)
database = client[MONGODB_DB_NAME]


def get_database():
    return database