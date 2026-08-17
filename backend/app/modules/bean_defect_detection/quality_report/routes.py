from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from .schema import (
    GenerateQualityReportRequest,
    QualityReportResponse,
)

from .service import (
    quality_report_service,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/quality-report",
    tags=["Bean Quality Report"],
)


# =========================================================
# GENERATE FINAL QUALITY REPORT
# =========================================================
#
# Final endpoint:
#
# POST /api/beans/quality-report/generate
#
# Input:
#
# {
#     "sensor_result": {...},
#     "physical_result": {...}
# }
#
# Output:
#
# {
#     "report_id": "...",
#     "sensor_assessment": {...},
#     "physical_assessment": {...},
#     "final_score": ...,
#     "grade": "...",
#     "quality_status": "...",
#     "findings": [...],
#     "recommendations": [...]
# }
#
# =========================================================

@router.post(
    "/generate",
    response_model=QualityReportResponse,
    status_code=status.HTTP_200_OK,
)
def generate_quality_report(
    request: GenerateQualityReportRequest,
):
    try:
        # -------------------------------------------------
        # GENERATE REPORT USING QUALITY REPORT SERVICE
        # -------------------------------------------------

        report = (
            quality_report_service
            .generate_report(
                request
            )
        )


        return report


    except ValueError as error:
        # -------------------------------------------------
        # INVALID INPUT / CALCULATION DATA
        # -------------------------------------------------

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:
        # -------------------------------------------------
        # UNEXPECTED ERROR
        # -------------------------------------------------

        print(
            "[QUALITY REPORT] "
            "Report generation failed:"
        )

        print(error)


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate the "
                "coffee bean quality report. "
                f"{str(error)}"
            ),
        )


# =========================================================
# QUALITY REPORT STATUS
# =========================================================
#
# Simple endpoint to confirm that the report module
# is available.
#
# GET /api/beans/quality-report/status
#
# =========================================================

@router.get(
    "/status",
    status_code=status.HTTP_200_OK,
)
def get_quality_report_status():
    return {
        "status": "available",
        "module": (
            "Coffee Bean Quality Report"
        ),
        "sensor_weight": (
            quality_report_service
            .SENSOR_WEIGHT
        ),
        "physical_weight": (
            quality_report_service
            .PHYSICAL_WEIGHT
        ),
        "sensor_thresholds": {
            "mq2": (
                quality_report_service
                .MQ2_BAD_THRESHOLD
            ),
            "mq135": (
                quality_report_service
                .MQ135_BAD_THRESHOLD
            ),
        },
        "physical_defect_weights": {
            "broken": (
                quality_report_service
                .BROKEN_WEIGHT
            ),
            "black": (
                quality_report_service
                .BLACK_WEIGHT
            ),
            "black_and_broken": (
                quality_report_service
                .BLACK_AND_BROKEN_WEIGHT
            ),
            "unknown": (
                quality_report_service
                .UNKNOWN_WEIGHT
            ),
        },
    }