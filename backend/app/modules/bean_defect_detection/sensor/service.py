import json
import os
import time
import threading

import serial
from serial.tools import list_ports
from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


class ArduinoSensorService:

    # =====================================================
    # INITIALIZE SERVICE
    # =====================================================

    def __init__(self):

        self.port = os.getenv(
            "ARDUINO_PORT",
            "COM4",
        )

        self.baud_rate = int(
            os.getenv(
                "ARDUINO_BAUD_RATE",
                "9600",
            )
        )

        self.serial_connection = None

        # Prevent multiple API requests from reading
        # Arduino serial data at the same time.
        self.lock = threading.Lock()


    # =====================================================
    # CHECK IF PHYSICAL COM PORT EXISTS
    # =====================================================

    def is_port_available(self):
        """
        Check whether the configured Arduino COM port
        currently exists on the computer.
        """

        available_ports = [
            port.device
            for port in list_ports.comports()
        ]

        return self.port in available_ports


    # =====================================================
    # CONNECT TO ARDUINO
    # =====================================================

    def connect(self):

        # -------------------------------------------------
        # Check whether Arduino physically exists
        # -------------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino not detected on {self.port}"
            )


        # -------------------------------------------------
        # Already connected
        # -------------------------------------------------

        if (
            self.serial_connection
            and self.serial_connection.is_open
        ):
            return


        # -------------------------------------------------
        # Open serial connection
        # -------------------------------------------------

        try:

            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                timeout=5,
            )

            # Arduino UNO normally resets when
            # serial connection is opened.
            time.sleep(2)

            self.serial_connection.reset_input_buffer()

            print(
                f"Arduino connected: "
                f"{self.port} @ "
                f"{self.baud_rate}"
            )


        except (
            serial.SerialException,
            OSError,
        ) as error:

            self.serial_connection = None

            raise RuntimeError(
                f"Could not connect to Arduino on "
                f"{self.port}: {error}"
            )


    # =====================================================
    # CONNECTION STATUS
    # =====================================================

    def is_connected(self):
        """
        Check both:

        1. Physical COM port exists
        2. Python serial connection is open
        """

        # -------------------------------------------------
        # Arduino physically disconnected
        # -------------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            return False


        # -------------------------------------------------
        # Serial connection exists and is open
        # -------------------------------------------------

        if (
            self.serial_connection
            and self.serial_connection.is_open
        ):

            return True


        return False


    # =====================================================
    # GET DEVICE STATUS
    # =====================================================

    def get_status(self):
        """
        Used by:

        GET /api/beans/sensors/status
        """

        # -------------------------------------------------
        # Arduino physically not connected
        # -------------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            return {
                "connected": False,
                "port": self.port,
                "baud_rate": self.baud_rate,
                "device": "Arduino Sensor Module",
            }


        try:

            # -------------------------------------------------
            # Try opening serial connection
            # -------------------------------------------------

            self.connect()

            return {
                "connected": self.is_connected(),
                "port": self.port,
                "baud_rate": self.baud_rate,
                "device": "Arduino Sensor Module",
            }


        except Exception as error:

            print(
                f"Arduino status error: {error}"
            )

            self.disconnect()

            return {
                "connected": False,
                "port": self.port,
                "baud_rate": self.baud_rate,
                "device": "Arduino Sensor Module",
            }


    # =====================================================
    # READ JSON FROM ARDUINO
    # =====================================================

    def read_json(self):
        """
        Read one complete JSON object from Arduino.

        Example Arduino JSON:

        {
            "mq2": 230,
            "mq135": 89,
            "mq3": 85,
            "moisture": 916,
            "temperature": 31.4,
            "humidity": 65.7,
            "weight": 52.4
        }

        Weight may also be null if the load cell
        does not currently provide a valid reading.
        """

        # -------------------------------------------------
        # Make sure device physically exists
        # -------------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino is not connected on "
                f"{self.port}"
            )


        # -------------------------------------------------
        # Connect if required
        # -------------------------------------------------

        self.connect()


        # -------------------------------------------------
        # Lock serial access
        # -------------------------------------------------

        with self.lock:

            try:

                # Try several lines because the first
                # serial line can sometimes be incomplete.
                for _ in range(10):

                    # -------------------------------------
                    # Check Arduino still exists
                    # -------------------------------------

                    if not self.is_port_available():

                        self.disconnect()

                        raise RuntimeError(
                            "Arduino was disconnected."
                        )


                    # -------------------------------------
                    # Read serial line
                    # -------------------------------------

                    raw_line = (
                        self.serial_connection
                        .readline()
                        .decode(
                            "utf-8",
                            errors="ignore",
                        )
                        .strip()
                    )


                    if not raw_line:
                        continue


                    print(
                        "Arduino RAW:",
                        raw_line,
                    )


                    # -------------------------------------
                    # Parse JSON
                    # -------------------------------------

                    try:

                        data = json.loads(
                            raw_line
                        )


                    except json.JSONDecodeError:

                        print(
                            "Invalid JSON ignored:",
                            raw_line,
                        )

                        continue


                    # -------------------------------------
                    # Required Step 1 sensor fields
                    # -------------------------------------
                    #
                    # Weight is NOT included here because
                    # Step 1 must still work even if weight
                    # is null or temporarily unavailable.
                    #

                    required_fields = [
                        "mq2",
                        "mq135",
                        "mq3",
                        "moisture",
                        "temperature",
                        "humidity",
                    ]


                    if not all(
                        field in data
                        for field in required_fields
                    ):

                        print(
                            "Incomplete sensor data ignored"
                        )

                        continue


                    return data


                raise RuntimeError(
                    "No valid sensor data received "
                    "from Arduino."
                )


            except (
                serial.SerialException,
                OSError,
            ) as error:

                self.disconnect()

                raise RuntimeError(
                    f"Arduino serial connection lost: "
                    f"{error}"
                )


    # =====================================================
    # STEP 1 - SENSOR QUALITY DATA
    # =====================================================

    def get_sensor_reading(self):
        """
        Returns only sensors required for:

        Step 1 - Sensor-Based Quality Analysis

        Weight is intentionally excluded here.

        Weight belongs to:

        Step 2 - Physical AI Analysis
        """

        data = self.read_json()


        return {
            "mq2": data["mq2"],
            "mq135": data["mq135"],
            "mq3": data["mq3"],
            "moisture": data["moisture"],
            "temperature": data["temperature"],
            "humidity": data["humidity"],
        }


    # =====================================================
    # STEP 2 - PHYSICAL ANALYSIS WEIGHT
    # =====================================================

    def get_weight_reading(self):
        """
        Read current load-cell weight.

        Used by:

        Step 2 - Physical AI Analysis

        This value is NOT part of Step 1
        Sensor-Based Quality Analysis.
        """

        # -------------------------------------------------
        # Arduino physically unavailable
        # -------------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            return {
                "connected": False,
                "weight_grams": None,
                "unit": "g",
            }


        try:

            # -------------------------------------------------
            # Read latest Arduino JSON
            # -------------------------------------------------

            data = self.read_json()


            # -------------------------------------------------
            # Get weight field
            # -------------------------------------------------

            weight = data.get(
                "weight"
            )


            # -------------------------------------------------
            # Weight unavailable / null
            # -------------------------------------------------

            if weight is None:

                return {
                    "connected": True,
                    "weight_grams": None,
                    "unit": "g",
                }


            # -------------------------------------------------
            # Convert weight to float
            # -------------------------------------------------

            try:

                weight_value = float(
                    weight
                )


            except (
                TypeError,
                ValueError,
            ):

                print(
                    "Invalid weight value:",
                    weight,
                )

                return {
                    "connected": True,
                    "weight_grams": None,
                    "unit": "g",
                }


            # -------------------------------------------------
            # Return valid weight
            # -------------------------------------------------

            return {
                "connected": True,
                "weight_grams": round(
                    weight_value,
                    2,
                ),
                "unit": "g",
            }


        except Exception as error:

            print(
                f"Weight reading error: {error}"
            )


            # If Arduino disappeared during reading
            if not self.is_port_available():

                self.disconnect()

                return {
                    "connected": False,
                    "weight_grams": None,
                    "unit": "g",
                }


            # Arduino exists but reading failed
            return {
                "connected": self.is_connected(),
                "weight_grams": None,
                "unit": "g",
            }


    # =====================================================
    # DISCONNECT
    # =====================================================

    def disconnect(self):

        if self.serial_connection:

            try:

                if self.serial_connection.is_open:

                    self.serial_connection.close()

                    print(
                        "Arduino serial connection closed."
                    )


            except (
                serial.SerialException,
                OSError,
            ):

                pass


        self.serial_connection = None


# =========================================================
# GLOBAL SENSOR SERVICE INSTANCE
# =========================================================

arduino_sensor_service = ArduinoSensorService()