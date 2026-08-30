# app/modules/packet_seal_detection/routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path
import shutil
import uuid

from app.modules.packet_seal_detection.service import predict_seal_image
from app.modules.packet_seal_detection.arduino_service import leak_device
from app.modules.packet_seal_detection.realtime_service import realtime_inspector

from app.modules.packet_seal_detection.report_service import report_service
from app.modules.packet_seal_detection.leak_repository import get_leak_history

from app.modules.packet_seal_detection import inspection_service


router = APIRouter()


UPLOAD_DIR = Path(
    "app/static/uploads/seals"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==================================================
# MODULE HOME
# ==================================================

@router.get("/")
def seal_home():

    return {
        "message":
            "Packet Seal Detection module is working"
    }


# ==================================================
# START NEW INSPECTION SESSION
# ==================================================

@router.post("/inspection/start")
def create_inspection_session():

    try:

        # ------------------------------------------------
        # Do not allow another guided inspection while
        # one is already active.
        # ------------------------------------------------

        existing = (
            inspection_service
            .get_active_inspection()
        )

        if existing:

            raise HTTPException(
                status_code=409,
                detail={
                    "message":
                        "An inspection session is already active.",
                    "packet_id":
                        existing.get("packet_id"),
                    "workflow_state":
                        existing.get("workflow_state")
                }
            )

        inspection = (
            inspection_service
            .start_inspection()
        )

        return {
            "message":
                "New inspection session started",

            "packet_id":
                inspection["packet_id"],

            "status":
                inspection["status"],

            "workflow_state":
                inspection["workflow_state"],

            "created_at":
                inspection["created_at"]
        }

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==================================================
# GET CURRENT ACTIVE INSPECTION
# ==================================================

@router.get("/inspection/current")
def get_current_inspection_session():

    inspection = (
        inspection_service
        .get_active_inspection()
    )

    if not inspection:

        return {
            "active": False,
            "inspection": None,

            "workflow_state":
                inspection_service.IDLE
        }

    return {
        "active": True,

        "inspection":
            inspection,

        "workflow_state":
            inspection.get(
                "workflow_state"
            )
    }


# ==================================================
# NEXT STEP
# ==================================================
#
# This endpoint is called by the frontend when the
# operator presses:
#
#       NEXT STEP
#
# It moves the guided inspection to the next stage.
#
# ==================================================

@router.post("/inspection/next-step")
def inspection_next_step():

    inspection = (
        inspection_service
        .get_active_inspection()
    )

    if not inspection:

        raise HTTPException(
            status_code=400,
            detail=(
                "No active inspection session."
            )
        )

    packet_id = inspection[
        "packet_id"
    ]

    current_state = inspection.get(
        "workflow_state"
    )


    # ==================================================
    # CAMERA → LEAK
    # ==================================================

    if current_state == (
        inspection_service.CAMERA_COMPLETED
    ):

        success = (
            inspection_service
            .complete_camera_step(
                packet_id
            )
        )

        if not success:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Camera inspection "
                    "has not been completed."
                )
            )

        updated = (
            inspection_service
            .get_inspection(
                packet_id
            )
        )

        return {
            "message":
                "Moved to packet leak detection.",

            "packet_id":
                packet_id,

            "workflow_state":
                updated.get(
                    "workflow_state"
                ),

            "inspection":
                updated
        }


    # ==================================================
    # LEAK → REPORT
    # ==================================================

    if current_state == (
        inspection_service.LEAK_COMPLETED
    ):

        success = (
            inspection_service
            .complete_leak_step(
                packet_id
            )
        )

        if not success:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Packet leak test "
                    "has not been completed."
                )
            )

        updated = (
            inspection_service
            .get_inspection(
                packet_id
            )
        )

        return {
            "message":
                "Inspection is ready for final report.",

            "packet_id":
                packet_id,

            "workflow_state":
                updated.get(
                    "workflow_state"
                ),

            "inspection":
                updated
        }


    # ==================================================
    # INVALID NEXT STEP
    # ==================================================

    raise HTTPException(
        status_code=400,
        detail={
            "message":
                "Cannot move to the next step yet.",

            "packet_id":
                packet_id,

            "workflow_state":
                current_state
        }
    )


# ==================================================
# FINALIZE INSPECTION
# ==================================================

@router.post("/inspection/finalize")
def finalize_inspection_session(
    packet_id: str = None
):

    resolved_packet_id = (

        packet_id
        or inspection_service
        .get_active_packet_id()
    )


    if not resolved_packet_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "No packet_id provided and "
                "no active inspection session."
            )
        )


    inspection = (
        inspection_service
        .finalize_inspection(
            resolved_packet_id
        )
    )


    if not inspection:

        raise HTTPException(
            status_code=404,
            detail=(
                "Inspection session not found."
            )
        )


    return {

        "message":
            "Inspection finalized",

        "inspection":
            inspection
    }


# ==================================================
# MANUAL IMAGE AI PREDICTION
# ==================================================

@router.post("/predict")
async def predict_seal(
    file: UploadFile = File(...)
):

    file_extension = (
        Path(file.filename).suffix
    )


    unique_filename = (
        f"seal_{uuid.uuid4().hex}"
        f"{file_extension}"
    )


    upload_path = (
        UPLOAD_DIR /
        unique_filename
    )


    with upload_path.open("wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    result = predict_seal_image(
        str(upload_path)
    )


    return {

        "message":
            "Packet seal prediction completed",

        "uploaded_image":
            str(upload_path),

        "result":
            result
    }


# ==================================================
# ARDUINO DEVICE STATUS
# ==================================================

@router.get("/device/status")
def packet_leak_device_status():

    return leak_device.get_status()


# ==================================================
# START ARDUINO LEAK TEST
# ==================================================

@router.post("/device/test")
def packet_leak_device_test():

    try:

        # ------------------------------------------------
        # Check whether this is a guided inspection.
        # ------------------------------------------------

        inspection = (
            inspection_service
            .get_active_inspection()
        )


        if inspection:

            workflow_state = (
                inspection.get(
                    "workflow_state"
                )
            )


            # --------------------------------------------
            # During a guided inspection, leak testing is
            # allowed ONLY during LEAK_PENDING.
            # --------------------------------------------

            if not inspection_service.can_run_leak_test():

                raise HTTPException(
                    status_code=409,
                    detail={
                        "message":
                            "Packet leak detection is not available at this stage.",

                        "packet_id":
                            inspection.get(
                                "packet_id"
                            ),

                        "workflow_state":
                            workflow_state
                    }
                )


        # ------------------------------------------------
        # Get active packet ID.
        # ------------------------------------------------

        packet_id = (
            inspection_service
            .get_active_packet_id()
        )


        result = leak_device.run_test(
            packet_id=packet_id
        )


        # ------------------------------------------------
        # update_leak_result() changes the workflow
        # state to REPORT_READY when camera result
        # already exists.
        # ------------------------------------------------

        return {

            "message":
                "Packet leak test completed",

            "packet_id":
                packet_id,

            "workflow_state":
                (
                    inspection_service
                    .get_active_inspection()
                    .get("workflow_state")
                    if inspection_service
                    .get_active_inspection()
                    else None
                ),

            "result":
                result
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==================================================
# REAL-TIME AI - START CAMERA
# ==================================================

@router.post("/realtime/start")
def start_realtime_inspection():

    try:

        # ------------------------------------------------
        # If a guided inspection exists, camera can only
        # run while the workflow is CAMERA_PENDING.
        # ------------------------------------------------

        inspection = (
            inspection_service
            .get_active_inspection()
        )


        if inspection:

            if not inspection_service.can_run_camera():

                raise HTTPException(
                    status_code=409,
                    detail={
                        "message":
                            "Real-time seal inspection is not available at this stage.",

                        "packet_id":
                            inspection.get(
                                "packet_id"
                            ),

                        "workflow_state":
                            inspection.get(
                                "workflow_state"
                            )
                    }
                )


        # ------------------------------------------------
        # Start existing real-time inspection system.
        # ------------------------------------------------

        result = (
            realtime_inspector
            .start()
        )


        if not result.get(
            "started"
        ):

            raise HTTPException(
                status_code=503,
                detail=result.get(
                    "message",
                    "Could not start real-time inspection."
                )
            )


        return result


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==================================================
# REAL-TIME AI - VIDEO STREAM
# ==================================================

@router.get("/realtime/video")
def realtime_video_stream():

    return StreamingResponse(

        realtime_inspector
        .generate_stream(),

        media_type=(
            "multipart/x-mixed-replace;"
            " boundary=frame"
        )
    )


# ==================================================
# REAL-TIME AI - LATEST RESULT
# ==================================================

@router.get("/realtime/result")
def realtime_latest_result():

    return {

        "message":
            "Latest real-time AI result",

        "result":
            realtime_inspector
            .get_latest_result()
    }


# ==================================================
# REAL-TIME AI - STOP CAMERA
# ==================================================

@router.post("/realtime/stop")
def stop_realtime_inspection():

    try:

        result = (
            realtime_inspector
            .stop()
        )

        return result


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==================================================
# REPORT DATA STATUS
# ==================================================

@router.get("/report/status")
def get_report_status():

    data = (
        report_service
        .get_report_data()
    )


    active_inspection = (
        inspection_service
        .get_active_inspection()
    )


    last_inspection = (
        inspection_service
        .get_last_inspection()
    )


    return {

        "ready": (

            data["realtime_result"]
            is not None

            and

            data["leak_result"]
            is not None
        ),


        "has_realtime_result":
            data["realtime_result"]
            is not None,


        "has_leak_result":
            data["leak_result"]
            is not None,


        "has_annotated_frame":
            data["has_annotated_frame"],


        "realtime_result":
            data["realtime_result"],


        "leak_result":
            data["leak_result"],


        "active_inspection":
            active_inspection,


        "last_inspection":
            last_inspection,


        "workflow_state":
            (
                active_inspection.get(
                    "workflow_state"
                )
                if active_inspection
                else inspection_service.IDLE
            )
    }


# ==================================================
# GENERATE FINAL PDF REPORT
# ==================================================

@router.post("/report/generate")
def generate_final_report():

    try:

        # ------------------------------------------------
        # If a guided inspection exists, report generation
        # is allowed ONLY when both stages are complete.
        # ------------------------------------------------

        inspection = (
            inspection_service
            .get_active_inspection()
        )


        if inspection:

            if not inspection_service.can_generate_report():

                raise HTTPException(
                    status_code=409,
                    detail={
                        "message":
                            "Final report is not ready yet.",

                        "packet_id":
                            inspection.get(
                                "packet_id"
                            ),

                        "workflow_state":
                            inspection.get(
                                "workflow_state"
                            )
                    }
                )


        report = (
            report_service
            .generate_pdf_report()
        )


        return report


    except HTTPException:

        raise


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


    except Exception as error:

        print(
            "REPORT GENERATION ERROR:",
            error
        )


        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "inspection report: "
                + str(error)
            )
        )


# ==================================================
# LEAK TEST HISTORY
# ==================================================

@router.get("/leak/history")
async def leak_history():

    try:

        history = (
            await get_leak_history()
        )


        return {

            "count":
                len(history),

            "history":
                history
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )