from fastapi import (
    APIRouter,
    HTTPException,
)

from .service import (
    phone_camera_service,
)


router = APIRouter(
    prefix="/phone-camera",
    tags=[
        "Bean Phone Camera"
    ],
)


# =========================================================
# PHONE STATUS
# =========================================================

@router.get("/status")
def get_phone_camera_status():

    return (
        phone_camera_service
        .get_status()
    )


# =========================================================
# OPEN PHONE CAMERA ONLY
# =========================================================

@router.post("/open")
def open_phone_camera():

    try:
        return (
            phone_camera_service
            .open_camera()
        )

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )


# =========================================================
# CAPTURE PHOTO ONLY
# =========================================================

@router.post("/capture")
def capture_phone_photo():

    try:
        return (
            phone_camera_service
            .capture_photo()
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# CAPTURE PHOTO + RUN AI
# =========================================================

@router.post(
    "/capture-analyze"
)
def capture_and_analyze_phone_photo():

    try:
        return (
            phone_camera_service
            .capture_and_analyze()
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )