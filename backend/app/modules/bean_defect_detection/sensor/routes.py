from fastapi import APIRouter, HTTPException

from .service import arduino_sensor_service
from .schema import SensorReading, SensorDeviceStatus


router = APIRouter(
    prefix="/sensors",
    tags=["Bean Sensor Analysis"],
)


# =========================================================
# SENSOR STATUS
# =========================================================

@router.get(
    "/status",
    response_model=SensorDeviceStatus,
)
def get_sensor_status():

    return arduino_sensor_service.get_status()


# =========================================================
# STEP 1 - SENSOR READING
# =========================================================

@router.get(
    "/latest",
    response_model=SensorReading,
)
def get_latest_sensor_reading():

    try:

        return (
            arduino_sensor_service
            .get_sensor_reading()
        )

    except Exception as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        )


# =========================================================
# STEP 2 - ZERO EMPTY TRAY
# =========================================================

@router.post(
    "/weight/zero",
)
def zero_weight_tray():

    try:

        result = (
            arduino_sensor_service
            .zero_tray()
        )

        if not result.get(
            "success",
            False,
        ):

            raise HTTPException(
                status_code=503,
                detail=result.get(
                    "message",
                    "Unable to zero load cell.",
                ),
            )

        return result


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        )


# =========================================================
# QUALITY INDICATOR TEST
# =========================================================
#
# Supported commands:
#
# PASS
#     Green LED blink
#
# FAIL
#     Red LED blink
#     Buzzer beep-beep
#
# REVIEW
#     LEDs OFF
#     Buzzer OFF
#
# RESET
#     LEDs OFF
#     Buzzer OFF
#
# =========================================================

@router.post(
    "/indicator/{command}",
)
def set_quality_indicator(
    command: str,
):

    try:

        result = (
            arduino_sensor_service
            .send_quality_command(
                command
            )
        )

        return result


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        )