from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import (
    check_database_connection,
    close_database_connection,
)

from app.auth.routes import router as auth_router
from app.admin.routes import router as admin_router

from app.modules.bean_defect_detection.routes import (
    router as bean_router,
)

from app.modules.packet_seal_detection.routes import (
    router as seal_router,
)

from app.modules.powder_quality_checking.routes import (
    router as powder_router,
)

from app.modules.sales_prediction.routes import (
    router as sales_router,
)


# =========================================================
# APPLICATION LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        await check_database_connection()

        print(
            "✅ MongoDB connected successfully"
        )

    except Exception as error:

        print(
            f"❌ MongoDB connection failed: {error}"
        )

        raise

    yield

    close_database_connection()

    print(
        "MongoDB connection closed"
    )


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Coffee Quality AI Platform",
    lifespan=lifespan,
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# AUTHENTICATION ROUTES
# =========================================================

app.include_router(
    auth_router,
)


# =========================================================
# ADMIN ROUTES
# =========================================================

app.include_router(
    admin_router,
)


# =========================================================
# AI MODULE ROUTES
# =========================================================

app.include_router(
    bean_router,
    prefix="/api/beans",
    tags=["Bean Defect Detection"],
)

app.include_router(
    seal_router,
    prefix="/api/seals",
    tags=["Packet Seal Detection"],
)

app.include_router(
    powder_router,
    prefix="/api/powder",
    tags=["Powder Quality Checking"],
)

app.include_router(
    sales_router,
    prefix="/api/sales",
    tags=["Sales Prediction"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": (
            "Coffee Quality AI Platform API is running"
        )
    }