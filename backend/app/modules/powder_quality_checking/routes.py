from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

import os

from .schema import (
    SensorReadingRequest,
    CreateBatchRequest,
)

from .service import analyze_powder_quality

from .serial_service import powder_serial_service

from .batch_manager import (
    start_new_batch,
    complete_active_batch,
    get_active_batch_id,
    get_production_state,
)

from .report.report_service import generate_powder_pdf

from .crud import (
    create_batch as create_batch_record,
    get_batch_by_id,
    save_sensor_reading as save_sensor_reading_record,
    get_latest_reading,
    get_sensor_history as get_sensor_history_records,
    get_batch_history as get_batch_history_records,
    get_batch_details,
    get_production_summary as get_production_summary_data,
)


router = APIRouter()


# ============================================================
# MODULE HEALTH CHECK
# ============================================================

@router.get("/")
async def powder_home():

    return {
        "module": "Coffee Powder Quality Evaluation",
        "status": "running",
    }


# ============================================================
# QUALITY CHECK ONLY
#
# Analyze sensor data without saving it.
# ============================================================

@router.post("/check-quality")
async def check_powder_quality(
    data: SensorReadingRequest,
):

    result = analyze_powder_quality(

        moisture=data.moisture,

        red=data.red,

        green=data.green,

        blue=data.blue,

        temperature=data.temperature,

        humidity=data.humidity,

        arduino_status=data.status,
    )


    return {

        "batch_id":
            data.batch_id,

        "ai_decision":
            result,
    }


# ============================================================
# CREATE BATCH
#
# Existing/manual endpoint kept for compatibility.
# New production flow should use /batch/start.
# ============================================================

@router.post("/batch/create")
async def create_batch(
    data: CreateBatchRequest,
):

    batch = await create_batch_record(
        data.batch_id
    )


    return {

        "message":
            "Batch created successfully",

        "batch_id":
            data.batch_id,

        "status":
            batch.get(
                "status",
                "ACTIVE",
            ),

        "data":
            batch,
    }


# ============================================================
# GET CURRENT ACTIVE PRODUCTION BATCH
# ============================================================

@router.get("/batch/current")
async def get_current_batch():

    state = await get_production_state()


    return {

        "batch_active":
            state.get(
                "batch_active",
                False,
            ),

        "batch_id":
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

        "last_completed_batch_id":
            state.get(
                "last_completed_batch_id"
            ),
    }


# ============================================================
# START NEW PRODUCTION BATCH
#
# Example:
#
# First production cycle
#       ↓
# BATCH-001
#
# Complete it
#       ↓
#
# Next production cycle
#       ↓
# BATCH-002
# ============================================================

@router.post("/batch/start")
async def start_production_batch():

    result = await start_new_batch()


    # --------------------------------------------------------
    # PREVENT TWO ACTIVE BATCHES AT THE SAME TIME
    # --------------------------------------------------------

    if not result.get(
        "created"
    ):

        raise HTTPException(

            status_code=409,

            detail={

                "message":
                    "A production batch is already active",

                "batch_id":
                    result.get(
                        "batch_id"
                    ),

                "code":
                    "BATCH_ALREADY_ACTIVE",
            },
        )


    batch_id = result.get(
        "batch_id"
    )


    # --------------------------------------------------------
    # CREATE MATCHING EXISTING BATCH RECORD
    #
    # This keeps existing batch history/report logic compatible.
    # --------------------------------------------------------

    await create_batch_record(
        batch_id
    )


    return {

        "message":
            "New production batch started",

        "batch_id":
            batch_id,

        "batch_active":
            True,

        "started_at":
            result.get(
                "started_at"
            ),
    }


# ============================================================
# COMPLETE CURRENT PRODUCTION BATCH
# ============================================================

@router.post("/batch/complete")
async def complete_production_batch():

    result = await complete_active_batch()


    if not result.get(
        "completed"
    ):

        raise HTTPException(

            status_code=409,

            detail={

                "message":
                    "There is no active production batch",

                "code":
                    "NO_ACTIVE_BATCH",
            },
        )


    return {

        "message":
            "Production batch completed successfully",

        "batch_id":
            result.get(
                "batch_id"
            ),

        "batch_active":
            False,

        "completed_at":
            result.get(
                "completed_at"
            ),
    }


# ============================================================
# BATCH HISTORY
# ============================================================

@router.get("/batch/history")
async def get_batch_history(

    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
):

    batches = await get_batch_history_records(
        limit=limit
    )


    return {

        "count":
            len(batches),

        "data":
            batches,
    }


# ============================================================
# GET ONE BATCH
#
# IMPORTANT:
# Keep this dynamic route AFTER:
#
# /batch/current
# /batch/start
# /batch/complete
# /batch/history
#
# ============================================================

@router.get("/batch/{batch_id}")
async def get_batch(
    batch_id: str,
):

    batch = await get_batch_details(
        batch_id
    )


    if not batch:

        raise HTTPException(

            status_code=404,

            detail=
                "Powder batch not found",
        )


    return batch


# ============================================================
# SAVE SENSOR READING
#
# Arduino / Frontend
#       ↓
# AI Analysis
#       ↓
# Recommendation
#       ↓
# MongoDB
#
# Existing manual/API endpoint kept unchanged.
# ============================================================

@router.post("/sensor/reading")
async def save_sensor_reading(
    data: SensorReadingRequest,
):

    # --------------------------------------------------------
    # MAKE SURE BATCH EXISTS
    # --------------------------------------------------------

    await create_batch_record(
        data.batch_id
    )


    # --------------------------------------------------------
    # RUN QUALITY ANALYSIS
    # --------------------------------------------------------

    analysis = analyze_powder_quality(

        moisture=data.moisture,

        red=data.red,

        green=data.green,

        blue=data.blue,

        temperature=data.temperature,

        humidity=data.humidity,

        arduino_status=data.status,
    )


    # --------------------------------------------------------
    # PREPARE SENSOR VALUES FOR MONGODB
    # --------------------------------------------------------

    sensor_data = {

        "moisture":
            data.moisture,

        "red":
            data.red,

        "green":
            data.green,

        "blue":
            data.blue,

        "temperature":
            data.temperature,

        "humidity":
            data.humidity,

        "arduino_status":
            data.status,
    }


    # --------------------------------------------------------
    # SAVE RESULT
    # --------------------------------------------------------

    saved_record = (
        await save_sensor_reading_record(

            batch_id=
                data.batch_id,

            sensor_data=
                sensor_data,

            analysis_result=
                analysis,
        )
    )


    return {

        "message":
            (
                "Powder sensor reading analyzed "
                "and saved successfully"
            ),

        "batch_id":
            data.batch_id,

        "saved":
            True,

        # Kept for compatibility with member frontend
        "record": {

            "record_id":
                saved_record.get(
                    "_id"
                ),

            "saved":
                True,
        },

        "ai_decision":
            analysis,
    }


# ============================================================
# GET LATEST SENSOR READING
# ============================================================

@router.get("/sensor/latest")
async def get_latest_sensor(
    batch_id: str | None = None,
):

    record = await get_latest_reading(
        batch_id=batch_id
    )


    if not record:

        return {

            "message":
                "No powder sensor data available",

            "data":
                None,
        }


    sensor_data = record.get(
        "sensor_data",
        {},
    )


    analysis = record.get(
        "analysis",
        {},
    )


    return {

        "record_id":
            record.get(
                "_id"
            ),

        "batch_id":
            record.get(
                "batch_id"
            ),

        "timestamp":
            record.get(
                "created_at"
            ),

        "moisture":
            sensor_data.get(
                "moisture"
            ),

        "red":
            sensor_data.get(
                "red"
            ),

        "green":
            sensor_data.get(
                "green"
            ),

        "blue":
            sensor_data.get(
                "blue"
            ),

        "temperature":
            sensor_data.get(
                "temperature"
            ),

        "humidity":
            sensor_data.get(
                "humidity"
            ),

        "arduino_status":
            sensor_data.get(
                "arduino_status"
            ),

        "ai_decision":
            analysis,
    }


# ============================================================
# SENSOR HISTORY
# ============================================================

@router.get("/sensor/history")
async def get_sensor_history(

    batch_id: str | None = None,

    limit: int = Query(
        default=60,
        ge=1,
        le=500,
    ),
):

    records = await get_sensor_history_records(

        batch_id=batch_id,

        limit=limit,
    )


    history = []


    # MongoDB gives newest first.
    # Reverse for graph/chart chronological order.

    for record in reversed(
        records
    ):

        sensor_data = record.get(
            "sensor_data",
            {},
        )


        history.append({

            "record_id":
                record.get(
                    "_id"
                ),

            "batch_id":
                record.get(
                    "batch_id"
                ),

            "time":
                record.get(
                    "created_at"
                ),

            "moisture":
                sensor_data.get(
                    "moisture"
                ),

            "temperature":
                sensor_data.get(
                    "temperature"
                ),

            "humidity":
                sensor_data.get(
                    "humidity"
                ),

            "red":
                sensor_data.get(
                    "red"
                ),

            "green":
                sensor_data.get(
                    "green"
                ),

            "blue":
                sensor_data.get(
                    "blue"
                ),

            "status":
                record.get(
                    "status"
                ),

            "quality_score":
                record.get(
                    "quality_score"
                ),

            "risk_level":
                record.get(
                    "risk_level"
                ),

            "ai_decision":
                record.get(
                    "analysis",
                    {},
                ),
        })


    return {

        "count":
            len(history),

        "data":
            history,
    }


# ============================================================
# LATEST AI RECOMMENDATION
# ============================================================

@router.get("/sensor/recommendation")
async def get_sensor_recommendation(
    batch_id: str | None = None,
):

    record = await get_latest_reading(
        batch_id=batch_id
    )


    if not record:

        return {

            "message":
                "No powder sensor data available",

            "recommendation":
                None,
        }


    sensor_data = record.get(
        "sensor_data",
        {},
    )


    analysis = record.get(
        "analysis",
        {},
    )


    return {

        "batch_id":
            record.get(
                "batch_id"
            ),

        "timestamp":
            record.get(
                "created_at"
            ),

        "moisture":
            sensor_data.get(
                "moisture"
            ),

        "temperature":
            sensor_data.get(
                "temperature"
            ),

        "humidity":
            sensor_data.get(
                "humidity"
            ),

        "red":
            sensor_data.get(
                "red"
            ),

        "green":
            sensor_data.get(
                "green"
            ),

        "blue":
            sensor_data.get(
                "blue"
            ),

        **analysis,
    }


# ============================================================
# PRODUCTION INTELLIGENCE - SUMMARY
# ============================================================

@router.get("/production/summary")
async def production_summary():

    summary = (
        await get_production_summary_data()
    )


    total_readings = summary.get(
        "total_readings",
        0,
    )


    pass_count = summary.get(
        "pass_count",
        0,
    )


    warn_count = summary.get(
        "warn_count",
        0,
    )


    hold_count = summary.get(
        "hold_count",
        0,
    )


    quality_rate = (

        round(
            (
                pass_count
                / total_readings
            )
            * 100,
            2,
        )

        if total_readings

        else 0
    )


    return {

        "total_batches":
            summary.get(
                "total_batches",
                0,
            ),

        "total_readings":
            total_readings,

        "approved_batches":
            pass_count,

        "review_required":
            warn_count,

        "blocked_batches":
            hold_count,

        "high_risk_batches":
            hold_count,

        "quality_rate":
            quality_rate,

        # Additional compatibility fields

        "pass_count":
            pass_count,

        "warn_count":
            warn_count,

        "hold_count":
            hold_count,
    }


# ============================================================
# PRODUCTION INTELLIGENCE - CURRENT
# ============================================================

@router.get("/production/current")
async def current_production():

    record = await get_latest_reading()


    if not record:

        return {
            "status":
                "NO_DATA"
        }


    sensor_data = record.get(
        "sensor_data",
        {},
    )


    analysis = record.get(
        "analysis",
        {},
    )


    return {

        "batch_id":
            record.get(
                "batch_id"
            ),

        "timestamp":
            record.get(
                "created_at"
            ),

        "decision": {

            "status":
                analysis.get(
                    "status"
                ),

            "quality_score":
                analysis.get(
                    "quality_score"
                ),

            "confidence":
                analysis.get(
                    "confidence"
                ),

            "decision":
                analysis.get(
                    "decision"
                ),

            "release_status":
                analysis.get(
                    "release_status"
                ),

            "risk_level":
                analysis.get(
                    "risk_level"
                ),

            "condition_score":
                analysis.get(
                    "condition_score"
                ),
        },

        "environment": {

            "moisture":
                sensor_data.get(
                    "moisture"
                ),

            "temperature":
                sensor_data.get(
                    "temperature"
                ),

            "humidity":
                sensor_data.get(
                    "humidity"
                ),
        },

        "risk_level":
            analysis.get(
                "risk_level"
            ),

        "root_cause":
            analysis.get(
                "root_cause",
                [],
            ),

        "recommended_actions":
            analysis.get(
                "recommended_actions",
                [],
            ),

        "next_action":
            analysis.get(
                "next_action"
            ),
    }


# ============================================================
# PRODUCTION INTELLIGENCE - TREND
# ============================================================

@router.get("/production/trend")
async def production_trend(

    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):

    records = await get_sensor_history_records(
        limit=limit
    )


    trend = []


    for record in reversed(
        records
    ):

        analysis = record.get(
            "analysis",
            {},
        )


        trend.append({

            "time":
                record.get(
                    "created_at"
                ),

            "score":
                analysis.get(
                    "quality_score",
                    0,
                ),

            "status":
                analysis.get(
                    "decision"
                )
                or
                analysis.get(
                    "status"
                ),

            "risk":
                analysis.get(
                    "risk_level"
                ),
        })


    return trend


# ============================================================
# POWDER SENSOR DEVICE STATUS
# ============================================================

@router.get("/device/status")
def get_device_status():

    return (
        powder_serial_service.get_status()
    )


# ============================================================
# CONNECT DEVICE
# ============================================================

@router.post("/device/connect")
def connect_device():

    connected = (
        powder_serial_service.connect()
    )


    if not connected:

        raise HTTPException(

            status_code=503,

            detail=(
                f"Unable to connect to powder sensor device "
                f"on {powder_serial_service.port}"
            ),
        )


    return {

        "message":
            "Powder sensor device connected",

        **powder_serial_service.get_status(),
    }


# ============================================================
# DISCONNECT DEVICE
# ============================================================

@router.post("/device/disconnect")
def disconnect_device():

    powder_serial_service.disconnect()


    return {

        "message":
            "Powder sensor device disconnected",

        **powder_serial_service.get_status(),
    }


# ============================================================
# READ ONE LIVE SENSOR SAMPLE
#
# Arduino
#     ↓
# Read sensor values
#     ↓
# Find ACTIVE production batch
#     ↓
# AI quality analysis
#     ↓
# Save reading under that batch
#     ↓
# MongoDB
# ============================================================

@router.get("/device/read")
async def read_device():

    # --------------------------------------------------------
    # READ LIVE DATA FROM ARDUINO
    # --------------------------------------------------------

    sensor_data = (
        powder_serial_service.read_sensor_data()
    )


    if sensor_data is None:

        raise HTTPException(

            status_code=503,

            detail=(
                "Unable to read sensor data from "
                "the powder sensor device"
            ),
        )


    # --------------------------------------------------------
    # DETERMINE CURRENT ACTIVE PRODUCTION BATCH
    # --------------------------------------------------------

    batch_id = sensor_data.get(
        "batch_id"
    )


    # Arduino currently does not provide a production batch ID.
    # Therefore use backend lifecycle-managed active batch.

    if not batch_id:

        batch_id = (
            await get_active_batch_id()
        )


    # --------------------------------------------------------
    # SAFETY:
    # DO NOT SAVE NEW SENSOR DATA INTO AN OLD BATCH
    # --------------------------------------------------------

    if not batch_id:

        raise HTTPException(

            status_code=409,

            detail={

                "message":
                    (
                        "No production batch is active. "
                        "Start a new batch before "
                        "collecting sensor data."
                    ),

                "code":
                    "NO_ACTIVE_BATCH",
            },
        )


    # --------------------------------------------------------
    # MAKE SURE ACTIVE BATCH RECORD EXISTS
    # --------------------------------------------------------

    await create_batch_record(
        batch_id
    )


    # --------------------------------------------------------
    # RUN AI QUALITY ANALYSIS
    # --------------------------------------------------------

    analysis = analyze_powder_quality(

        moisture=
            sensor_data.get(
                "moisture",
                0,
            ),

        red=
            sensor_data.get(
                "red",
                0,
            ),

        green=
            sensor_data.get(
                "green",
                0,
            ),

        blue=
            sensor_data.get(
                "blue",
                0,
            ),

        temperature=
            sensor_data.get(
                "temperature",
                0,
            ),

        humidity=
            sensor_data.get(
                "humidity",
                0,
            ),

        arduino_status=
            sensor_data.get(
                "status"
            ),
    )


    # --------------------------------------------------------
    # PREPARE SENSOR DATA FOR MONGODB
    # --------------------------------------------------------

    database_sensor_data = {

        "moisture":
            sensor_data.get(
                "moisture"
            ),

        "red":
            sensor_data.get(
                "red"
            ),

        "green":
            sensor_data.get(
                "green"
            ),

        "blue":
            sensor_data.get(
                "blue"
            ),

        "temperature":
            sensor_data.get(
                "temperature"
            ),

        "humidity":
            sensor_data.get(
                "humidity"
            ),

        "arduino_status":
            sensor_data.get(
                "status"
            ),

        "device_decision":
            sensor_data.get(
                "device_decision"
            ),
    }


    # --------------------------------------------------------
    # SAVE LIVE READING + AI RESULT TO MONGODB
    # --------------------------------------------------------

    saved_record = (
        await save_sensor_reading_record(

            batch_id=batch_id,

            sensor_data=
                database_sensor_data,

            analysis_result=
                analysis,
        )
    )


    # --------------------------------------------------------
    # RETURN LIVE RESULT
    # --------------------------------------------------------

    return {

        "message":
            (
                "Live sensor reading analyzed "
                "and saved successfully"
            ),

        "saved":
            True,

        "record_id":
            saved_record.get(
                "_id"
            ),

        "batch_id":
            batch_id,

        "data": {

            **sensor_data,

            "batch_id":
                batch_id,
        },

        "ai_decision":
            analysis,
    }


# ============================================================
# GENERATE POWDER QUALITY PDF REPORT
# ============================================================

@router.get("/report/pdf/{batch_id}")
async def generate_report_pdf(
    batch_id: str,
):

    batch_data = await get_batch_details(
        batch_id
    )


    if not batch_data:

        raise HTTPException(

            status_code=404,

            detail=
                "Batch not found",
        )


    file_path = generate_powder_pdf(
        batch_data
    )


    return FileResponse(

        path=
            file_path,

        filename=
            os.path.basename(
                file_path
            ),

        media_type=
            "application/pdf",
    )