from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def powder_home():
    return {"message": "Powder Quality Checking module is working"}

@router.post("/check-quality")
def check_powder_quality():
    return {
        "module": "Powder Quality Checking",
        "status": "Quality checking endpoint ready"
    }