from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
)

from pathlib import Path
import shutil
import uuid


from app.auth.dependencies import require_roles
from app.auth.schema import UserRole


from app.modules.bean_defect_detection.service import (
    predict_bean_image,
)


from app.modules.bean_defect_detection.sensor.routes import (
    router as sensor_router,
)


from app.modules.bean_defect_detection.sensor.service import (
    arduino_sensor_service,
)


from app.modules.bean_defect_detection.sensor.schema import (
    WeightReading,
)

from app.modules.bean_defect_detection.phone_camera.routes import (
    router as phone_camera_router,
)


from app.modules.bean_defect_detection.quality_report.routes import (
    router as quality_report_router,
)

# =========================================================
# BEAN ROUTER
# =========================================================

router = APIRouter(
    dependencies=[
        Depends(
            require_roles(
                UserRole.BEAN_QUALITY_INSPECTOR
            )
        )
    ]
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path(
    "app/static/uploads/beans"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# SENSOR ROUTES
# =========================================================
#
# Includes:
#
# GET /api/beans/sensors/status
# GET /api/beans/sensors/latest
#

router.include_router(
    sensor_router
)

router.include_router(
    phone_camera_router
)

router.include_router(
    quality_report_router
)

# =========================================================
# BEAN MODULE HOME
# =========================================================

@router.get("/")
def bean_home():

    return {
        "message": (
            "Bean Defect Detection module is working"
        )
    }


# =========================================================
# STEP 2 - PHYSICAL ANALYSIS WEIGHT
# =========================================================

@router.get(
    "/physical/weight",
    response_model=WeightReading,
)
def get_physical_weight():

    """
    Get the current coffee bean sample weight
    from the HX711 load cell.

    Weight belongs to Step 2 - Physical Analysis.
    It is intentionally separate from
    Step 1 - Sensor-Based Quality Analysis.
    """

    return (
        arduino_sensor_service
        .get_weight_reading()
    )


# =========================================================
# STEP 2 - PHYSICAL AI PREDICTION
# =========================================================

@router.post("/predict")
async def predict_beans(
    file: UploadFile = File(...)
):

    """
    Upload a coffee bean sample image and run
    the complete Physical AI Analysis pipeline.

    Pipeline:

    Uploaded Image
        ↓
    Coffee Bean Detection
        ↓
    Individual Bean Crop
        ↓
    Color Classification
        +
    Shape Classification
        ↓
    Final Bean Category
    """

    # =====================================================
    # GET FILE EXTENSION
    # =====================================================

    file_extension = Path(
        file.filename
    ).suffix


    # =====================================================
    # GENERATE UNIQUE FILE NAME
    # =====================================================

    unique_filename = (
        f"bean_{uuid.uuid4().hex}"
        f"{file_extension}"
    )


    # =====================================================
    # CREATE UPLOAD PATH
    # =====================================================

    upload_path = (
        UPLOAD_DIR
        / unique_filename
    )


    # =====================================================
    # SAVE UPLOADED IMAGE
    # =====================================================

    with upload_path.open(
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer,
        )


    # =====================================================
    # RUN PHYSICAL AI PIPELINE
    # =====================================================

    result = predict_bean_image(
        str(upload_path)
    )


    # =====================================================
    # API RESPONSE
    # =====================================================

    return {

        "message": (
            "Bean prediction completed"
        ),

        "uploaded_image": str(
            upload_path
        ),

        "result": result,
    }