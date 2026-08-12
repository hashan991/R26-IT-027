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

router.include_router(
    sensor_router
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
# PHYSICAL AI PREDICTION
# =========================================================

@router.post("/predict")
async def predict_beans(
    file: UploadFile = File(...)
):

    """
    Upload coffee bean image and predict defects.
    """

    file_extension = Path(
        file.filename
    ).suffix

    unique_filename = (
        f"bean_{uuid.uuid4().hex}"
        f"{file_extension}"
    )

    upload_path = (
        UPLOAD_DIR / unique_filename
    )

    with upload_path.open(
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer,
        )

    result = predict_bean_image(
        str(upload_path)
    )

    return {
        "message": (
            "Bean prediction completed"
        ),

        "uploaded_image": str(
            upload_path
        ),

        "result": result,
    }