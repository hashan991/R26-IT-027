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

router = APIRouter()

UPLOAD_DIR = Path("app/static/uploads/seals")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ==================================================
# MODULE HOME
# ==================================================
@router.get("/")
def seal_home():
    return {
        "message": "Packet Seal Detection module is working"
    }


# ==================================================
# MANUAL IMAGE AI PREDICTION
# ==================================================
@router.post("/predict")
async def predict_seal(file: UploadFile = File(...)):
    """
    Upload packet seal image and predict seal defects.
    """

    file_extension = Path(file.filename).suffix

    unique_filename = (
        f"seal_{uuid.uuid4().hex}{file_extension}"
    )

    upload_path = UPLOAD_DIR / unique_filename

    with upload_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_seal_image(
        str(upload_path)
    )

    return {
        "message": "Packet seal prediction completed",
        "uploaded_image": str(upload_path),
        "result": result
    }


# ==================================================
# ARDUINO LEAK DEVICE STATUS
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

        result = leak_device.run_test()

        return {
            "message": "Packet leak test completed",
            "result": result
        }

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

        result = realtime_inspector.start()

        if not result.get("started"):

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
        realtime_inspector.generate_stream(),
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
        "message": "Latest real-time AI result",
        "result": realtime_inspector.get_latest_result()
    }


# ==================================================
# REAL-TIME AI - STOP CAMERA
# ==================================================
@router.post("/realtime/stop")
def stop_realtime_inspection():

    try:

        return realtime_inspector.stop()

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

    data = report_service.get_report_data()

    return {
        "ready": (
            data["realtime_result"] is not None
            and data["leak_result"] is not None
        ),

        "has_realtime_result":
            data["realtime_result"] is not None,

        "has_leak_result":
            data["leak_result"] is not None,

        "has_annotated_frame":
            data["has_annotated_frame"],

        "realtime_result":
            data["realtime_result"],

        "leak_result":
            data["leak_result"],
    }


# ==================================================
# GENERATE FINAL PDF REPORT
# ==================================================

@router.post("/report/generate")
def generate_final_report():

    try:

        report = (
            report_service.generate_pdf_report()
        )

        return report


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
                "Failed to generate inspection report: "
                + str(error)
            )
        )

# ==================================================
# LEAK TEST HISTORY
# ==================================================

@router.get("/leak/history")
async def leak_history():

    try:

        history = await get_leak_history()


        return {
            "count": len(history),
            "history": history
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )