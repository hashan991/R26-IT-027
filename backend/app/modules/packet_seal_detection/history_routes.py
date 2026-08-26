from fastapi import APIRouter, HTTPException

from app.database import get_database


router = APIRouter(
    prefix="/api/seals/history",
    tags=["Seal Inspection History"]
)


# ==========================================
# GET ALL HISTORY
# ==========================================

@router.get("/")
async def get_history():

    db = get_database()

    collection = db["packet_inspection_history"]


    records = []

    cursor = collection.find().sort(
        "created_at",
        -1
    )


    async for item in cursor:

        item["_id"] = str(
            item["_id"]
        )

        records.append(item)


    return {

        "message": "Inspection history loaded",

        "count": len(records),

        "history": records

    }



# ==========================================
# DELETE HISTORY ITEM
# ==========================================

@router.delete("/{record_id}")
async def delete_history(record_id: str):

    from bson import ObjectId


    db = get_database()

    collection = db["packet_inspection_history"]


    result = await collection.delete_one(
        {
            "_id": ObjectId(record_id)
        }
    )


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="History record not found"
        )


    return {

        "message":
        "History deleted successfully"

    }