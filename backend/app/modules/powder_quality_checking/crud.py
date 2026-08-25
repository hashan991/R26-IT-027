from datetime import datetime, timezone
from typing import Optional

from app.database import database


# ============================================================
# MONGODB COLLECTIONS
# ============================================================

powder_batches_collection = database[
    "powder_quality_batches"
]

powder_readings_collection = database[
    "powder_quality_readings"
]


# ============================================================
# HELPERS
# ============================================================

def serialize_document(document):
    """
    Convert MongoDB ObjectId to string before
    returning data through FastAPI.
    """

    if not document:
        return None

    document = dict(document)

    if "_id" in document:
        document["_id"] = str(
            document["_id"]
        )

    return document


# ============================================================
# CREATE / GET BATCH
# ============================================================

async def create_batch(batch_id: str):
    """
    Create a powder production batch.

    If the batch already exists, return the
    existing batch instead of creating a duplicate.
    """

    existing_batch = (
        await powder_batches_collection.find_one(
            {
                "batch_id": batch_id
            }
        )
    )

    if existing_batch:
        return serialize_document(
            existing_batch
        )

    now = datetime.now(
        timezone.utc
    )

    batch_document = {
        "batch_id": batch_id,
        "status": "ACTIVE",
        "created_at": now,
        "updated_at": now,
    }

    result = (
        await powder_batches_collection.insert_one(
            batch_document
        )
    )

    created_batch = (
        await powder_batches_collection.find_one(
            {
                "_id": result.inserted_id
            }
        )
    )

    return serialize_document(
        created_batch
    )


async def get_batch_by_id(
    batch_id: str,
):
    batch = (
        await powder_batches_collection.find_one(
            {
                "batch_id": batch_id
            }
        )
    )

    return serialize_document(
        batch
    )


# ============================================================
# SAVE POWDER SENSOR READING
# ============================================================

async def save_sensor_reading(
    batch_id: str,
    sensor_data: dict,
    analysis_result: dict,
):
    """
    Save sensor values and AI quality decision
    for one powder inspection reading.
    """

    now = datetime.now(
        timezone.utc
    )

    document = {
        "batch_id": batch_id,

        "sensor_data": sensor_data,

        "analysis": analysis_result,

        # Useful top-level fields for filtering/dashboard
        "status": analysis_result.get(
            "status"
        ),

        "decision": analysis_result.get(
            "decision"
        ),

        "release_status": analysis_result.get(
            "release_status"
        ),

        "risk_level": analysis_result.get(
            "risk_level"
        ),

        "quality_score": analysis_result.get(
            "quality_score"
        ),

        "confidence": analysis_result.get(
            "confidence"
        ),

        "created_at": now,
    }

    result = (
        await powder_readings_collection.insert_one(
            document
        )
    )

    # Update batch with latest result
    await powder_batches_collection.update_one(
        {
            "batch_id": batch_id
        },
        {
            "$set": {
                "latest_status": (
                    analysis_result.get(
                        "status"
                    )
                ),

                "latest_quality_score": (
                    analysis_result.get(
                        "quality_score"
                    )
                ),

                "latest_risk_level": (
                    analysis_result.get(
                        "risk_level"
                    )
                ),

                "updated_at": now,
            }
        },
        upsert=True,
    )

    saved_document = (
        await powder_readings_collection.find_one(
            {
                "_id": result.inserted_id
            }
        )
    )

    return serialize_document(
        saved_document
    )


# ============================================================
# GET LATEST READING
# ============================================================

async def get_latest_reading(
    batch_id: Optional[str] = None,
):
    query = {}

    if batch_id:
        query["batch_id"] = batch_id

    document = (
        await powder_readings_collection.find_one(
            query,
            sort=[
                (
                    "created_at",
                    -1,
                )
            ],
        )
    )

    return serialize_document(
        document
    )


# ============================================================
# GET SENSOR HISTORY
# ============================================================

async def get_sensor_history(
    batch_id: Optional[str] = None,
    limit: int = 100,
):
    query = {}

    if batch_id:
        query["batch_id"] = batch_id

    readings = []

    cursor = (
        powder_readings_collection
        .find(query)
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    async for document in cursor:
        readings.append(
            serialize_document(
                document
            )
        )

    return readings


# ============================================================
# GET BATCH HISTORY
# ============================================================

async def get_batch_history(
    limit: int = 100,
):
    """
    Return production batch history together with
    the latest AI inspection result for each batch.

    The response fields are kept compatible with
    the CoffeeSense frontend BatchHistoryTable.
    """

    batches = []

    cursor = (
        powder_batches_collection
        .find({})
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    async for document in cursor:

        batch = serialize_document(
            document
        )

        batch_id = batch.get(
            "batch_id"
        )

        # ----------------------------------------------------
        # GET LATEST SENSOR / AI RESULT FOR THIS BATCH
        # ----------------------------------------------------

        latest_reading = (
            await powder_readings_collection.find_one(
                {
                    "batch_id": batch_id
                },
                sort=[
                    (
                        "created_at",
                        -1,
                    )
                ],
            )
        )

        # ----------------------------------------------------
        # MERGE LATEST RESULT INTO BATCH HISTORY RESPONSE
        # ----------------------------------------------------

        if latest_reading:

            latest_reading = serialize_document(
                latest_reading
            )

            analysis = latest_reading.get(
                "analysis",
                {},
            )

            batch["timestamp"] = (
                latest_reading.get(
                    "created_at"
                )
            )

            batch["decision"] = (
                latest_reading.get(
                    "decision"
                )
                or
                latest_reading.get(
                    "status"
                )
            )

            batch["release_status"] = (
                latest_reading.get(
                    "release_status"
                )
                or
                analysis.get(
                    "release_status"
                )
            )

            batch["quality_score"] = (
                latest_reading.get(
                    "quality_score"
                )
            )

            batch["condition_score"] = (
                latest_reading.get(
                    "quality_score"
                )
            )

            batch["confidence"] = (
                latest_reading.get(
                    "confidence"
                )
            )

            batch["risk_level"] = (
                latest_reading.get(
                    "risk_level"
                )
            )

            batch["root_cause"] = (
                analysis.get(
                    "root_cause"
                )
                or
                analysis.get(
                    "root_causes"
                )
                or
                []
            )

            batch["recommended_actions"] = (
                analysis.get(
                    "recommended_actions"
                )
                or
                analysis.get(
                    "recovery_actions"
                )
                or
                []
            )

        else:

            # Batch exists but does not yet have
            # an inspection reading.

            batch["timestamp"] = (
                batch.get(
                    "created_at"
                )
            )

            batch["decision"] = None

            batch["release_status"] = None

            batch["quality_score"] = 0

            batch["condition_score"] = 0

            batch["confidence"] = 0

            batch["risk_level"] = None

            batch["root_cause"] = []

            batch["recommended_actions"] = []

        batches.append(
            batch
        )

    return batches
# ============================================================
# GET COMPLETE BATCH DETAILS
# ============================================================

async def get_batch_details(
    batch_id: str,
):
    batch = await get_batch_by_id(
        batch_id
    )

    if not batch:
        return None

    readings = await get_sensor_history(
        batch_id=batch_id,
        limit=500,
    )

    latest_reading = (
        readings[0]
        if readings
        else None
    )

    return {
        "batch": batch,
        "latest_reading": latest_reading,
        "readings": readings,
        "reading_count": len(
            readings
        ),
    }


# ============================================================
# UPDATE BATCH STATUS
# ============================================================

async def update_batch_status(
    batch_id: str,
    status: str,
):
    now = datetime.now(
        timezone.utc
    )

    result = (
        await powder_batches_collection.update_one(
            {
                "batch_id": batch_id
            },
            {
                "$set": {
                    "status": status,
                    "updated_at": now,
                }
            },
        )
    )

    if result.matched_count == 0:
        return None

    return await get_batch_by_id(
        batch_id
    )


# ============================================================
# GET PRODUCTION SUMMARY
# ============================================================

async def get_production_summary():
    """
    Basic production intelligence summary.
    This supports the latest member project's
    production dashboard feature.
    """

    total_batches = (
        await powder_batches_collection.count_documents(
            {}
        )
    )

    total_readings = (
        await powder_readings_collection.count_documents(
            {}
        )
    )

    pass_count = (
        await powder_readings_collection.count_documents(
            {
                "status": "PASS"
            }
        )
    )

    warn_count = (
        await powder_readings_collection.count_documents(
            {
                "status": "WARN"
            }
        )
    )

    hold_count = (
        await powder_readings_collection.count_documents(
            {
                "status": "HOLD"
            }
        )
    )

    return {
        "total_batches": total_batches,
        "total_readings": total_readings,
        "pass_count": pass_count,
        "warn_count": warn_count,
        "hold_count": hold_count,
    }