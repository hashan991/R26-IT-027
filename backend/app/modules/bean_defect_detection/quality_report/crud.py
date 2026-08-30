from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.database import get_database

from .schema import QualityReportResponse


COLLECTION_NAME = "bean_quality_reports"


# =========================================================
# SAVE QUALITY REPORT
# =========================================================

async def save_quality_report(
    report: QualityReportResponse,
) -> Dict[str, Any]:

    database = get_database()

    collection = database[
        COLLECTION_NAME
    ]

    document = report.model_dump(
        mode="python"
    )

    report_id = document.get(
        "report_id"
    )

    if not report_id:
        raise ValueError(
            "Report ID is required before saving."
        )

    now = datetime.now(
        timezone.utc
    )

    # -----------------------------------------------------
    # Do not create duplicate reports if Save is clicked
    # more than once.
    #
    # Existing report -> update
    # New report      -> insert
    # -----------------------------------------------------

    await collection.update_one(
        {
            "report_id": report_id
        },
        {
            "$set": {
                **document,
                "updated_at": now,
            },
            "$setOnInsert": {
                "saved_at": now,
            },
        },
        upsert=True,
    )

    saved_report = await collection.find_one(
        {
            "report_id": report_id
        },
        {
            "_id": 0
        },
    )

    return saved_report


# =========================================================
# GET ONE SAVED REPORT
# =========================================================

async def get_saved_quality_report(
    report_id: str,
) -> Optional[Dict[str, Any]]:

    database = get_database()

    collection = database[
        COLLECTION_NAME
    ]

    return await collection.find_one(
        {
            "report_id": report_id
        },
        {
            "_id": 0
        },
    )


# =========================================================
# GET REPORT HISTORY
# =========================================================

async def get_quality_report_history(
    limit: int = 50,
) -> List[Dict[str, Any]]:

    database = get_database()

    collection = database[
        COLLECTION_NAME
    ]

    cursor = (
        collection
        .find(
            {},
            {
                "_id": 0,
            },
        )
        .sort(
            "saved_at",
            -1,
        )
        .limit(
            limit
        )
    )

    reports = await cursor.to_list(
        length=limit
    )

    return reports


# =========================================================
# DELETE SAVED QUALITY REPORT
# =========================================================

async def delete_quality_report(
    report_id: str,
) -> bool:

    database = get_database()

    collection = database[
        COLLECTION_NAME
    ]

    result = await collection.delete_one(
        {
            "report_id": report_id
        }
    )

    return result.deleted_count > 0