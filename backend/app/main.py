from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.modules.bean_defect_detection.routes import router as bean_router
from app.modules.packet_seal_detection.routes import router as seal_router
from app.modules.powder_quality_checking.routes import router as powder_router
from app.modules.sales_prediction.routes import router as sales_router


app = FastAPI(title="Coffee Quality AI Platform")

app.mount("/static", StaticFiles(directory="app/static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bean_router, prefix="/api/beans", tags=["Bean Defect Detection"])
app.include_router(seal_router, prefix="/api/seals", tags=["Packet Seal Detection"])
app.include_router(powder_router, prefix="/api/powder", tags=["Powder Quality Checking"])
app.include_router(sales_router, prefix="/api/sales", tags=["Sales Prediction"])


@app.get("/")
def root():
    return {"message": "Coffee Quality AI Platform API is running"}