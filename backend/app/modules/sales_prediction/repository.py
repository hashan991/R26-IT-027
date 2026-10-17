from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pymongo import ASCENDING

from app.database import get_database


COLLECTION_NAME = "monthly_sales"


def _collection():
    return get_database()[COLLECTION_NAME]


async def ensure_sales_indexes() -> None:
    await _collection().create_index(
        [("year", ASCENDING), ("month", ASCENDING)],
        unique=True,
        name="uniq_year_month",
    )


def _public_document(document: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if document is None:
        return None

    return {
        "id": str(document.get("_id")) if document.get("_id") else None,
        "year": int(document["year"]),
        "month": int(document["month"]),
        "sales_count": int(document["sales_count"]),
        "created_at": document.get("created_at"),
        "updated_at": document.get("updated_at"),
    }


async def upsert_sales_entry(year: int, month: int, sales_count: int) -> Dict[str, Any]:
    await ensure_sales_indexes()
    now = datetime.now(timezone.utc)

    await _collection().update_one(
        {"year": int(year), "month": int(month)},
        {
            "$set": {
                "sales_count": int(sales_count),
                "updated_at": now,
            },
            "$setOnInsert": {
                "year": int(year),
                "month": int(month),
                "created_at": now,
            },
        },
        upsert=True,
    )

    document = await _collection().find_one({"year": int(year), "month": int(month)})
    return _public_document(document)


async def get_sales_entry(year: int, month: int) -> Optional[Dict[str, Any]]:
    document = await _collection().find_one({"year": int(year), "month": int(month)})
    return _public_document(document)


async def list_sales_entries(limit: int = 120) -> List[Dict[str, Any]]:
    cursor = (
        _collection()
        .find({})
        .sort([("year", -1), ("month", -1)])
        .limit(limit)
    )
    documents = await cursor.to_list(length=limit)
    return [_public_document(document) for document in documents]


async def delete_sales_entry(year: int, month: int) -> bool:
    result = await _collection().delete_one({"year": int(year), "month": int(month)})
    return result.deleted_count == 1
