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

        # Prevent multiple requests from reading/writing
        # Arduino serial data at the same time.
        self.lock = threading.Lock()


        # =================================================
        # LOAD CELL CALIBRATION
        # =================================================
        #
        # Experimental calibration value obtained
        # using known weights.
        #
        # weight_grams =
        # (current_raw - tray_raw) / raw_per_gram
        #
        # =================================================

        self.raw_per_gram = float(
            os.getenv(
                "LOAD_CELL_RAW_PER_GRAM",
                "205.4",
            )
        )


        # =================================================
        # SMALL ZERO NOISE FILTER
        # =================================================

        self.zero_noise_grams = float(
            os.getenv(
                "LOAD_CELL_ZERO_NOISE_GRAMS",
                "1.2",
            )
        )


        # =================================================
        # EMPTY TRAY ZERO REFERENCE
        # =================================================
        #
        # This is NOT hard-coded.
        #
        # When zero_tray() is called,
        # current RAW value is stored here.
        #
        # =================================================

        self.tray_raw = None


    # =====================================================
    # CHECK IF PHYSICAL COM PORT EXISTS
    # =====================================================

    def is_port_available(self):

        available_ports = [
            port.device
            for port in list_ports.comports()
        ]

        return self.port in available_ports


    # =====================================================
    # CONNECT TO ARDUINO
    # =====================================================

    def connect(self):

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino not detected on {self.port}"
            )


        # Already connected
        if (
            self.serial_connection
            and
            self.serial_connection.is_open
        ):

            return


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

        if not self.is_port_available():

            self.disconnect()

            return False


        if (
            self.serial_connection
            and
            self.serial_connection.is_open
        ):

            return True


        return False


    # =====================================================
    # GET DEVICE STATUS
    # =====================================================

    def get_status(self):

        if not self.is_port_available():

            self.disconnect()

            return {
                "connected": False,
                "port": self.port,
                "baud_rate": self.baud_rate,
                "device": "Arduino Sensor Module",
                "weight_zeroed": (
                    self.tray_raw is not None
                ),
            }


        try:

            self.connect()

            return {
                "connected": self.is_connected(),
                "port": self.port,
                "baud_rate": self.baud_rate,
                "device": "Arduino Sensor Module",
                "weight_zeroed": (
                    self.tray_raw is not None
                ),
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
                "weight_zeroed": (
                    self.tray_raw is not None
                ),
            }


    # =====================================================
    # READ JSON FROM ARDUINO
    # =====================================================

    def read_json(self):
        """
        Expected Arduino JSON:

        {
            "mq2": 154,
            "mq135": 60,
            "mq3": 46,
            "moisture": 923,
            "temperature": 32.00,
            "humidity": 64.60,
            "weight_raw": 132970,
            "load_cell_ready": true
        }
        """

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino is not connected on "
                f"{self.port}"
            )


        self.connect()


        with self.lock:

            try:

                for _ in range(10):

                    if not self.is_port_available():

                        self.disconnect()

                        raise RuntimeError(
                            "Arduino was disconnected."
                        )


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


                    # Step 1 sensors must be present.
                    # Weight is optional here.
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
    # GET CURRENT LOAD CELL RAW VALUE
    # =====================================================

    def get_current_weight_raw(self):

        data = self.read_json()


        load_cell_ready = data.get(
            "load_cell_ready",
            False,
        )


        if not load_cell_ready:

            return None


        weight_raw = data.get(
            "weight_raw"
        )


        if weight_raw is None:

            return None


        try:

            return int(
                weight_raw
            )


        except (
            TypeError,
            ValueError,
        ):

            print(
                "Invalid weight_raw value:",
                weight_raw,
            )

            return None


    # =====================================================
    # ZERO / TARE EMPTY TRAY
    # =====================================================

    def zero_tray(self):
        """
        IMPORTANT:

        Call this only while the EMPTY TRAY
        is on the load cell.

        Arduino is NOT tared.

        Backend stores current RAW value
        as the tray zero reference.
        """

        if not self.is_port_available():

            self.disconnect()

            return {
                "success": False,
                "connected": False,
                "zeroed": False,
                "tray_raw": None,
                "message": (
                    "Arduino is not connected."
                ),
            }


        try:

            current_raw = (
                self.get_current_weight_raw()
            )


            if current_raw is None:

                return {
                    "success": False,
                    "connected": True,
                    "zeroed": False,
                    "tray_raw": None,
                    "message": (
                        "Load cell RAW reading "
                        "is unavailable."
                    ),
                }


            # Save current empty-tray RAW value
            self.tray_raw = current_raw


            print(
                "========================================"
            )

            print(
                "LOAD CELL ZERO SET"
            )

            print(
                "Tray RAW:",
                self.tray_raw,
            )

            print(
                "RAW per gram:",
                self.raw_per_gram,
            )

            print(
                "========================================"
            )


            return {
                "success": True,
                "connected": True,
                "zeroed": True,
                "tray_raw": self.tray_raw,
                "raw_per_gram": self.raw_per_gram,
                "unit": "g",
                "message": (
                    "Empty tray saved as "
                    "0.00 g reference."
                ),
            }


        except Exception as error:

            print(
                f"Tray zero error: {error}"
            )

            return {
                "success": False,
                "connected": self.is_connected(),
                "zeroed": False,
                "tray_raw": None,
                "message": str(error),
            }


    # =====================================================
    # CLEAR ZERO
    # =====================================================

    def clear_tray_zero(self):

        self.tray_raw = None


        return {
            "success": True,
            "zeroed": False,
            "tray_raw": None,
            "message": (
                "Tray zero reference cleared."
            ),
        }


    # =====================================================
    # RAW -> GRAMS
    # =====================================================

    def convert_raw_to_grams(
        self,
        current_raw,
    ):

        if self.tray_raw is None:

            return None


        raw_difference = (
            current_raw
            -
            self.tray_raw
        )


        weight_grams = (
            float(raw_difference)
            /
            self.raw_per_gram
        )


        # Small load-cell noise around zero
        if abs(
            weight_grams
        ) < self.zero_noise_grams:

            weight_grams = 0.0


        return {
            "raw_difference":
                raw_difference,

            "weight_grams":
                round(
                    weight_grams,
                    2,
                ),
        }


    # =====================================================
    # STEP 2 - PHYSICAL ANALYSIS WEIGHT
    # =====================================================

    def get_weight_reading(self):

        # Arduino unavailable
        if not self.is_port_available():

            self.disconnect()

            return {
                "connected": False,
                "load_cell_ready": False,
                "zeroed": (
                    self.tray_raw is not None
                ),
                "current_raw": None,
                "tray_raw": self.tray_raw,
                "raw_difference": None,
                "weight_grams": None,
                "raw_per_gram": self.raw_per_gram,
                "unit": "g",
                "message": (
                    "Arduino is not connected."
                ),
            }


        try:

            data = self.read_json()


            # ---------------------------------------------
            # LOAD CELL STATUS
            # ---------------------------------------------

            load_cell_ready = data.get(
                "load_cell_ready",
                False,
            )


            # ---------------------------------------------
            # RAW VALUE
            # ---------------------------------------------

            current_raw = data.get(
                "weight_raw"
            )


            if (
                not load_cell_ready
                or
                current_raw is None
            ):

                return {
                    "connected": True,

                    "load_cell_ready":
                        bool(
                            load_cell_ready
                        ),

                    "zeroed": (
                        self.tray_raw
                        is not None
                    ),

                    "current_raw": None,

                    "tray_raw":
                        self.tray_raw,

                    "raw_difference": None,

                    "weight_grams": None,

                    "raw_per_gram":
                        self.raw_per_gram,

                    "unit": "g",

                    "message": (
                        "Load cell RAW reading "
                        "is unavailable."
                    ),
                }


            try:

                current_raw = int(
                    current_raw
                )


            except (
                TypeError,
                ValueError,
            ):

                return {
                    "connected": True,

                    "load_cell_ready": True,

                    "zeroed": (
                        self.tray_raw
                        is not None
                    ),

                    "current_raw": None,

                    "tray_raw":
                        self.tray_raw,

                    "raw_difference": None,

                    "weight_grams": None,

                    "raw_per_gram":
                        self.raw_per_gram,

                    "unit": "g",

                    "message": (
                        "Invalid load cell RAW value."
                    ),
                }


            # ---------------------------------------------
            # NOT ZEROED YET
            # ---------------------------------------------

            if self.tray_raw is None:

                return {
                    "connected": True,

                    "load_cell_ready": True,

                    "zeroed": False,

                    "current_raw":
                        current_raw,

                    "tray_raw": None,

                    "raw_difference": None,

                    "weight_grams": None,

                    "raw_per_gram":
                        self.raw_per_gram,

                    "unit": "g",

                    "message": (
                        "Place empty tray on scale "
                        "and zero it first."
                    ),
                }


            # ---------------------------------------------
            # CONVERT RAW -> GRAMS
            # ---------------------------------------------

            converted = (
                self.convert_raw_to_grams(
                    current_raw
                )
            )


            return {
                "connected": True,

                "load_cell_ready": True,

                "zeroed": True,

                "current_raw":
                    current_raw,

                "tray_raw":
                    self.tray_raw,

                "raw_difference":
                    converted[
                        "raw_difference"
                    ],

                "weight_grams":
                    converted[
                        "weight_grams"
                    ],

                "raw_per_gram":
                    self.raw_per_gram,

                "unit": "g",

                "message": None,
            }


        except Exception as error:

            print(
                f"Weight reading error: {error}"
            )


            if not self.is_port_available():

                self.disconnect()

                return {
                    "connected": False,

                    "load_cell_ready": False,

                    "zeroed": (
                        self.tray_raw
                        is not None
                    ),

                    "current_raw": None,

                    "tray_raw":
                        self.tray_raw,

                    "raw_difference": None,

                    "weight_grams": None,

                    "raw_per_gram":
                        self.raw_per_gram,

                    "unit": "g",

                    "message":
                        str(error),
                }


            return {
                "connected":
                    self.is_connected(),

                "load_cell_ready": None,

                "zeroed": (
                    self.tray_raw
                    is not None
                ),

                "current_raw": None,

                "tray_raw":
                    self.tray_raw,

                "raw_difference": None,

                "weight_grams": None,

                "raw_per_gram":
                    self.raw_per_gram,

                "unit": "g",

                "message":
                    str(error),
            }


    # =====================================================
    # SEND QUALITY INDICATOR COMMAND TO ARDUINO
    # =====================================================
    #
    # Commands:
    #
    # PASS
    #     Green LED blinks
    #     Red LED OFF
    #     Buzzer OFF
    #
    # FAIL
    #     Green LED OFF
    #     Red LED blinks
    #     Buzzer beep-beep
    #
    # REVIEW
    #     Everything OFF
    #
    # RESET
    #     Everything OFF
    #
    # =====================================================

    def send_quality_command(
        self,
        command: str,
    ):

        # ---------------------------------------------
        # NORMALIZE COMMAND
        # ---------------------------------------------

        command = (
            str(command)
            .strip()
            .upper()
        )


        # ---------------------------------------------
        # ALLOWED COMMANDS
        # ---------------------------------------------

        allowed_commands = {
            "PASS",
            "FAIL",
            "REVIEW",
            "RESET",
        }


        if command not in allowed_commands:

            raise ValueError(
                f"Invalid quality command: "
                f"{command}"
            )


        # ---------------------------------------------
        # MAKE SURE ARDUINO EXISTS
        # ---------------------------------------------

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino not detected on "
                f"{self.port}"
            )


        # ---------------------------------------------
        # CONNECT IF REQUIRED
        # ---------------------------------------------

        self.connect()


        # ---------------------------------------------
        # LOCK SERIAL WRITE
        # ---------------------------------------------

        with self.lock:

            try:

                # Arduino expects command + newline
                serial_command = (
                    command + "\n"
                ).encode(
                    "utf-8"
                )


                self.serial_connection.write(
                    serial_command
                )

                self.serial_connection.flush()


                print(
                    "========================================"
                )

                print(
                    "ARDUINO QUALITY COMMAND"
                )

                print(
                    "Command:",
                    command,
                )

                print(
                    "========================================"
                )


                return {
                    "success": True,
                    "connected": True,
                    "command": command,
                    "message": (
                        f"Arduino quality indicator "
                        f"set to {command}."
                    ),
                }


            except (
                serial.SerialException,
                OSError,
            ) as error:

                self.disconnect()

                raise RuntimeError(
                    f"Unable to send Arduino "
                    f"quality command: {error}"
                )


    # =====================================================
    # DISCONNECT
    # =====================================================

    def disconnect(self):

        if self.serial_connection:

            try:

                if (
                    self.serial_connection.is_open
                ):

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