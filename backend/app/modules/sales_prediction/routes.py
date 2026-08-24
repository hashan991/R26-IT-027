from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

import os


from .schema import (
    SalesPredictionRequest,
    SalesPredictionResponse
)

from .service import (
    MONTH_NAMES,
    predict_sales
)

from .report import (
    generate_sales_report
)


router = APIRouter()



@router.get("/health")
def sales_prediction_health():

    return {
        "status": "ok",
        "module": "Sales Prediction"
    }



@router.get("/months")
def get_months():

    return [
        {
            "value": number,
            "label": name
        }

        for number, name
        in MONTH_NAMES.items()
    ]



@router.post(
    "/predict",
    response_model=SalesPredictionResponse
)
def predict_sales_post(
    payload: SalesPredictionRequest
):

    try:

        return predict_sales(
            payload.year,
            payload.month
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        ) from exc




@router.get(
    "/predict",
    response_model=SalesPredictionResponse
)
def predict_sales_get(

    year: int = Query(
        ...,
        ge=2000,
        le=2100
    ),

    month: int = Query(
        ...,
        ge=1,
        le=12
    )

):

    try:

        return predict_sales(
            year,
            month
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        ) from exc




# ============================================================
# DOWNLOAD PDF REPORT
# ============================================================

@router.get("/report")
def download_sales_report(

    year: int = Query(
        ...,
        ge=2000,
        le=2100
    ),

    month: int = Query(
        ...,
        ge=1,
        le=12
    )

):


    try:

        # Get AI prediction result

        result = predict_sales(
            year,
            month
        )


        # Create report folder

        report_folder = (
            "app/static/reports/sales_reports"
        )


        os.makedirs(
            report_folder,
            exist_ok=True
        )


        file_path = (
            f"{report_folder}/"
            f"sales_report_{year}_{month}.pdf"
        )


        # Generate PDF

        generate_sales_report(
            result,
            file_path
        )


        return FileResponse(

            path=file_path,

            media_type="application/pdf",

            filename=
            f"coffee_sales_report_{year}_{month}.pdf"

        )


    except Exception as exc:


        raise HTTPException(

            status_code=500,

            detail=str(exc)

        ) from exc