from datetime import datetime, timezone

from pymongo import ReturnDocument

from app.database import get_database


# ============================================================
# COLLECTION CONFIGURATION
# ============================================================

COUNTER_COLLECTION = "powder_batch_counters"

STATE_COLLECTION = "powder_production_state"

COUNTER_ID = "powder_batch_sequence"

STATE_ID = "powder_active_production"


# ============================================================
# UTC TIME
# ============================================================

def utc_now():

    return datetime.now(timezone.utc)


# ============================================================
# GENERATE NEXT UNIQUE BATCH ID
#
# BATCH-001
# BATCH-002
# BATCH-003
# ...
# ============================================================

async def generate_next_batch_id():

    database = get_database()

    counters = database[
        COUNTER_COLLECTION
    ]


    counter = await counters.find_one_and_update(

        {
            "_id": COUNTER_ID
        },

        {
            "$inc": {
                "sequence": 1
            },

            "$set": {
                "updated_at": utc_now()
            },

            "$setOnInsert": {
                "created_at": utc_now()
            },
        },

        upsert=True,

        return_document=ReturnDocument.AFTER,
    )


    sequence = int(
        counter.get(
            "sequence",
            1,
        )
    )


    return f"BATCH-{sequence:03d}"


# ============================================================
# GET PRODUCTION STATE
# ============================================================

async def get_production_state():

    database = get_database()

    collection = database[
        STATE_COLLECTION
    ]


    state = await collection.find_one(
        {
            "_id": STATE_ID
        }
    )


    if not state:

        return {

            "batch_active": False,

            "active_batch_id": None,

            "started_at": None,

            "completed_at": None,
        }


    return {

        "batch_active":
            bool(
                state.get(
                    "batch_active",
                    False,
                )
            ),

        "active_batch_id":
            state.get(
                "active_batch_id"
            ),

        "started_at":
            state.get(
                "started_at"
            ),

        "completed_at":
            state.get(
                "completed_at"
            ),
    }


# ============================================================
# GET CURRENT ACTIVE BATCH ID
# ============================================================

async def get_active_batch_id():

    state = await get_production_state()


    if not state.get(
        "batch_active"
    ):

        return None


    return state.get(
        "active_batch_id"
    )


# ============================================================
# START NEW BATCH
# ============================================================

async def start_new_batch():

    database = get_database()

    collection = database[
        STATE_COLLECTION
    ]


    current_state = (
        await get_production_state()
    )


    # --------------------------------------------------------
    # DO NOT CREATE A SECOND BATCH WHILE ONE IS ACTIVE
    # --------------------------------------------------------

    if (
        current_state.get(
            "batch_active"
        )
        and
        current_state.get(
            "active_batch_id"
        )
    ):

        return {

            "created": False,

            "reason":
                "BATCH_ALREADY_ACTIVE",

            "batch_id":
                current_state.get(
                    "active_batch_id"
                ),

            "state":
                current_state,
        }


    # --------------------------------------------------------
    # GENERATE NEXT ID
    # --------------------------------------------------------

    batch_id = (
        await generate_next_batch_id()
    )


    started_at = utc_now()


    # --------------------------------------------------------
    # SAVE ACTIVE STATE
    # --------------------------------------------------------

    await collection.update_one(

        {
            "_id": STATE_ID
        },

        {
            "$set": {

                "active_batch_id":
                    batch_id,

                "batch_active":
                    True,

                "started_at":
                    started_at,

                "completed_at":
                    None,

                "updated_at":
                    started_at,
            },

            "$setOnInsert": {

                "created_at":
                    started_at,
            },
        },

        upsert=True,
    )


    return {

        "created": True,

        "batch_id":
            batch_id,

        "batch_active":
            True,

        "started_at":
            started_at,
    }


# ============================================================
# COMPLETE ACTIVE BATCH
# ============================================================

async def complete_active_batch():

    database = get_database()

    collection = database[
        STATE_COLLECTION
    ]


    state = await get_production_state()


    active_batch_id = (
        state.get(
            "active_batch_id"
        )
    )


    if (
        not state.get(
            "batch_active"
        )
        or
        not active_batch_id
    ):

        return {

            "completed": False,

            "reason":
                "NO_ACTIVE_BATCH",

            "batch_id":
                None,
        }


    completed_at = utc_now()


    await collection.update_one(

        {
            "_id": STATE_ID
        },

        {
            "$set": {

                "batch_active":
                    False,

                "active_batch_id":
                    None,

                "last_completed_batch_id":
                    active_batch_id,

                "completed_at":
                    completed_at,

                "updated_at":
                    completed_at,
            }
        },
    )


    return {

        "completed": True,

        "batch_id":
            active_batch_id,

        "batch_active":
            False,

        "completed_at":
            completed_at,
    }