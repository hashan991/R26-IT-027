# app/modules/packet_seal_detection/history_service.py

from datetime import datetime, timezone

from app.database import get_database

from app.modules.packet_seal_detection import inspection_service


# ==================================================
# CREATE CAMERA INSPECTION HISTORY
# ==================================================
# IMPORTANT FIX:
# Previously this generated a brand-new random packet_id here,
# which meant the saved history record was NEVER the same
# packet_id as the active inspection session (so the leak test
# result could never be matched back to it). Now it uses the
# packet_id that is already inside `result` (set by
# realtime_service via the active session), falling back to a
# fresh id only if no session was active.
# ==================================================

def create_camera_history(result, image_path=None):

    packet_id = (
        result.get("packet_id")
        or inspection_service.get_active_packet_id()
        or inspection_service.generate_packet_id()
    )

    history = {

        "packet_id": packet_id,
        "inspection_id": packet_id,
        "inspection_stage": "camera",

        "result_type": (
            "PASS"
            if result.get("final_status") == "NO_OVERHEAT_DETECTED"
            else "DEFECT"
        ),

        "seal_result": {
            "seal_count": result.get("seal_count", 0),
            "seals": result.get("seals", []),
        },

        "overheat_result": {
            "detected": result.get("overheat_detected", False),
            "confidence": result.get("highest_overheat_confidence", 0),
            "validation": result.get("validation", {}),
        },

        "final_status": result.get("final_status"),

        "image_path": image_path,

        "created_at": datetime.now(timezone.utc),
    }

    return history


# ==================================================
# SAVE CAMERA INSPECTION HISTORY
# ==================================================
async def save_camera_history(history):

    db = get_database()
    collection = db["packet_inspection_history"]

    result = await collection.insert_one(history)

    return str(result.inserted_id)


# ==================================================
# GET LATEST CAMERA INSPECTION HISTORY
# ==================================================
async def get_camera_history(limit=50):

    db = get_database()
    collection = db["packet_inspection_history"]

    cursor = (
        collection
        .find({})
        .sort("created_at", -1)
        .limit(limit)
    )

    records = await cursor.to_list(length=limit)

    for record in records:
        if "_id" in record:
            record["_id"] = str(record["_id"])

    return records