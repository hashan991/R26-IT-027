from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def seal_home():
    return {"message": "Packet Seal Detection module is working"}

@router.post("/predict")
def predict_seal():
    return {
        "module": "Packet Seal Detection",
        "status": "Prediction endpoint ready"
    }