from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def sales_home():
    return {"message": "Sales Prediction module is working"}

@router.post("/predict")
def predict_sales():
    return {
        "module": "Sales Prediction",
        "status": "Sales prediction endpoint ready"
    }