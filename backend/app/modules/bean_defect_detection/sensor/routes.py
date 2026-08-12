from fastapi import APIRouter, HTTPException

from .service import arduino_sensor_service
from .schema import SensorReading, SensorDeviceStatus


router = APIRouter(
    prefix="/sensors",
    tags=["Bean Sensor Analysis"],
)


@router.get(
    "/status",
    response_model=SensorDeviceStatus,
)
def get_sensor_status():
    return arduino_sensor_service.get_status()


@router.get(
    "/latest",
    response_model=SensorReading,
)
def get_latest_sensor_reading():
    try:
        return arduino_sensor_service.get_sensor_reading()

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )