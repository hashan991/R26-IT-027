from datetime import datetime
import uuid

from app.database import get_database


# ==================================================
# GENERATE UNIQUE PACKET ID
# ==================================================

def generate_packet_id():

    timestamp = datetime.now().strftime("%Y%m%d")

    unique = uuid.uuid4().hex[:4].upper()

    return f"PKT-{timestamp}-{unique}"


# ==================================================
# CREATE CAMERA INSPECTION HISTORY
# ==================================================

def create_camera_history(result, image_path=None):

    packet_id = generate_packet_id()

    history = {

        "packet_id": packet_id,

        "inspection_id": packet_id,

        "inspection_stage": "camera",

        "result_type": (
            "PASS"
            if result.get("final_status") == "NO_OVERHEAT_DETECTED"
            else "DEFECT"
        ),

        # ------------------------------------------
        # SEAL RESULT
        # ------------------------------------------

        "seal_result": {

            "seal_count": result.get(
                "seal_count",
                0
            ),

            "seals": result.get(
                "seals",
                []
            )

        },

        # ------------------------------------------
        # OVERHEAT RESULT
        # ------------------------------------------

        "overheat_result": {

            "detected": result.get(
                "overheat_detected",
                False
            ),

            "confidence": result.get(
                "highest_overheat_confidence",
                0
            ),

            "validation": result.get(
                "validation",
                {}
            )

        },

        # ------------------------------------------
        # FINAL STATUS
        # ------------------------------------------

        "final_status": result.get(
            "final_status"
        ),

        # ------------------------------------------
        # ANNOTATED INSPECTION IMAGE
        # ------------------------------------------

        "image_path": image_path,

        # ------------------------------------------
        # CREATED TIME
        # ------------------------------------------

        "created_at": datetime.utcnow()

    }

    return history


# ==================================================
# SAVE CAMERA INSPECTION HISTORY
# ==================================================

async def save_camera_history(history):

    db = get_database()

    collection = db["packet_inspection_history"]

    result = await collection.insert_one(
        history
    )

    return str(
        result.inserted_id
    )


# ==================================================
# GET LATEST CAMERA INSPECTION HISTORY
# ==================================================

async def get_camera_history(limit=50):

    db = get_database()

    collection = db["packet_inspection_history"]

    # ------------------------------------------
    # GET NEWEST RECORDS FIRST
    # ------------------------------------------

    cursor = (
        collection
        .find({})
        .sort(
            "created_at",
            -1
        )
        .limit(limit)
    )

    records = await cursor.to_list(
        length=limit
    )

    # ------------------------------------------
    # CONVERT MONGODB OBJECT ID TO STRING
    # ------------------------------------------

    for record in records:

        if "_id" in record:

            record["_id"] = str(
                record["_id"]
            )

    return records