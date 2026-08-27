from fastapi import APIRouter, HTTPException

from app.database import get_database


router = APIRouter(
    prefix="/api/seals/history",
    tags=["Seal Inspection History"]
)


# ==========================================
# GET LATEST 50 HISTORY RECORDS
# ==========================================

@router.get("/")
async def get_history():

    db = get_database()

    collection = db["packet_inspection_history"]

    # ------------------------------------------
    # GET ONLY LATEST 50 RECORDS
    # NEWEST FIRST
    # ------------------------------------------

    cursor = (
        collection
        .find({})
        .sort(
            "created_at",
            -1
        )
        .limit(50)
    )

    records = []

    async for item in cursor:

        item["_id"] = str(
            item["_id"]
        )

        records.append(item)

    return {

        "message": "Latest 50 inspection history records loaded",

        "count": len(records),

        "history": records

    }


# ==========================================
# DELETE HISTORY ITEM
# ==========================================

@router.delete("/{record_id}")
async def delete_history(
    record_id: str
):

    from bson import ObjectId

    db = get_database()

    collection = db["packet_inspection_history"]

    # ------------------------------------------
    # DELETE SELECTED RECORD
    # ------------------------------------------

    try:

        result = await collection.delete_one(
            {
                "_id": ObjectId(record_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid history record ID"
        )

    # ------------------------------------------
    # RECORD NOT FOUND
    # ------------------------------------------

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="History record not found"
        )

    return {

        "message":
        "History deleted successfully"

    }