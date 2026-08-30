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
    """
    Arduino sensor service with a CONTINUOUS BACKGROUND
    serial reader.

    Important architecture:

        Arduino
            ↓ continuously sends JSON
        background serial thread
            ↓ always consumes the stream
        self.latest_data
            ↓
        FastAPI GET endpoints

    API requests DO NOT read one queued serial line anymore.
    They return the newest cached valid JSON reading instead.
    This prevents old serial data from being replayed slowly.
    """

    # =====================================================
    # INITIALIZE SERVICE
    # =====================================================

    def __init__(self):

        self.port = os.getenv(
            "BEAN_ARDUINO_PORT",
            "COM4",
        )

        self.baud_rate = int(
            os.getenv(
                "ARDUINO_BAUD_RATE",
                "9600",
            )
        )

        # -------------------------------------------------
        # SERIAL CONNECTION
        # -------------------------------------------------

        self.serial_connection = None

        # Only one thread may open/close the COM port at once.
        self.connection_lock = threading.Lock()

        # Background reader uses this lock while readline()
        # is active. Indicator commands also use it for write().
        self.serial_lock = threading.Lock()

        # Keep old attribute name for compatibility in case
        # another file still refers to service.lock.
        self.lock = self.serial_lock

        # -------------------------------------------------
        # LATEST SENSOR DATA CACHE
        # -------------------------------------------------

        self.latest_data = None
        self.latest_data_time = None
        self.data_lock = threading.Lock()

        # -------------------------------------------------
        # BACKGROUND READER THREAD
        # -------------------------------------------------

        self.reader_thread = None
        self.reader_stop_event = threading.Event()

        # First valid reading may take up to the Arduino
        # transmission interval. Current Arduino code sends
        # about once every 2 seconds.
        self.first_read_timeout = float(
            os.getenv(
                "ARDUINO_FIRST_READ_TIMEOUT",
                "5.0",
            )
        )

        # If cached data becomes older than this, read_json()
        # waits for a newer reading instead of silently
        # returning very old data.
        self.max_data_age_seconds = float(
            os.getenv(
                "ARDUINO_MAX_DATA_AGE_SECONDS",
                "4.0",
            )
        )

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
    # INTERNAL - CLEAR LATEST CACHE
    # =====================================================

    def _clear_latest_data(self):

        with self.data_lock:
            self.latest_data = None
            self.latest_data_time = None

    # =====================================================
    # INTERNAL - START BACKGROUND SERIAL READER
    # =====================================================

    def _start_reader_thread(self):

        if (
            self.reader_thread
            and self.reader_thread.is_alive()
        ):
            return

        self.reader_stop_event.clear()

        self.reader_thread = threading.Thread(
            target=self._reader_loop,
            name="ArduinoSerialReader",
            daemon=True,
        )

        self.reader_thread.start()

        print(
            "Arduino background serial reader started."
        )

    # =====================================================
    # CONNECT TO ARDUINO
    # =====================================================

    def connect(self):

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino not detected on {self.port}"
            )

        # -------------------------------------------------
        # OPEN SERIAL PORT ONCE
        # -------------------------------------------------

        with self.connection_lock:

            if (
                self.serial_connection
                and self.serial_connection.is_open
            ):
                # Connection already exists.
                # Just make sure reader thread exists.
                self._start_reader_thread()
                return

            try:

                # Short timeout is intentional.
                # The background reader must release the serial
                # lock frequently so PASS/FAIL/RESET commands
                # are not delayed by a long blocking readline().
                self.serial_connection = serial.Serial(
                    port=self.port,
                    baudrate=self.baud_rate,
                    timeout=0.25,
                )

                # Arduino UNO normally resets when serial
                # connection is opened.
                time.sleep(2)

                # Clear anything that may have accumulated while
                # the port was opening/resetting.
                self.serial_connection.reset_input_buffer()

                # Old cached values must never survive a new
                # physical serial connection.
                self._clear_latest_data()

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

        # Start continuous stream consumer AFTER port opens.
        self._start_reader_thread()

    # =====================================================
    # INTERNAL - BACKGROUND SERIAL LOOP
    # =====================================================

    def _reader_loop(self):

        required_fields = [
            "mq2",
            "mq135",
            "mq3",
            "moisture",
            "temperature",
            "humidity",
        ]

        while not self.reader_stop_event.is_set():

            connection = self.serial_connection

            if (
                connection is None
                or not connection.is_open
            ):
                time.sleep(0.1)
                continue

            try:

                # Only this background thread reads serial data.
                # HTTP/API requests never call readline().
                with self.serial_lock:

                    raw_line = (
                        connection
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

                    # Arduino can also print command/debug text.
                    # Ignore anything that is not JSON.
                    print(
                        "Invalid JSON ignored:",
                        raw_line,
                    )
                    continue

                if not all(
                    field in data
                    for field in required_fields
                ):

                    print(
                        "Incomplete sensor data ignored"
                    )
                    continue

                # -----------------------------------------
                # IMPORTANT:
                # Overwrite cache with the NEWEST reading.
                # Old lines are continuously consumed and
                # therefore cannot build up as a backlog.
                # -----------------------------------------

                with self.data_lock:

                    self.latest_data = dict(
                        data
                    )

                    self.latest_data_time = (
                        time.monotonic()
                    )

            except (
                serial.SerialException,
                OSError,
            ) as error:

                print(
                    "Arduino background serial error:",
                    error,
                )

                # Do not call disconnect() from this thread
                # because disconnect() may join the reader.
                try:
                    if (
                        self.serial_connection
                        and
                        self.serial_connection.is_open
                    ):
                        self.serial_connection.close()
                except Exception:
                    pass

                self.serial_connection = None
                self._clear_latest_data()

                # Keep loop alive briefly. A later API status/read
                # request can call connect() and reopen the port.
                time.sleep(0.25)

            except Exception as error:

                print(
                    "Arduino reader unexpected error:",
                    error,
                )

                time.sleep(0.1)

    # =====================================================
    # CONNECTION STATUS
    # =====================================================

    def is_connected(self):

        if not self.is_port_available():

            self.disconnect()

            return False

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
    # READ NEWEST JSON FROM BACKGROUND CACHE
    # =====================================================

    def read_json(self):
        """
        Return the NEWEST valid Arduino JSON cached by the
        background serial reader.

        This function no longer calls Serial.readline().
        Therefore API requests cannot fall behind the Arduino
        serial stream.
        """

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino is not connected on "
                f"{self.port}"
            )

        self.connect()

        deadline = (
            time.monotonic()
            + self.first_read_timeout
        )

        while time.monotonic() < deadline:

            if not self.is_port_available():

                self.disconnect()

                raise RuntimeError(
                    "Arduino was disconnected."
                )

            with self.data_lock:

                if (
                    self.latest_data is not None
                    and
                    self.latest_data_time is not None
                ):

                    age = (
                        time.monotonic()
                        - self.latest_data_time
                    )

                    if (
                        age
                        <=
                        self.max_data_age_seconds
                    ):

                        # Defensive copy so callers cannot modify
                        # the shared background cache.
                        return dict(
                            self.latest_data
                        )

            # No valid fresh reading yet.
            time.sleep(0.02)

        raise RuntimeError(
            "No fresh sensor data received "
            "from Arduino."
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

            load_cell_ready = data.get(
                "load_cell_ready",
                False,
            )

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

    def send_quality_command(
        self,
        command: str,
    ):

        command = (
            str(command)
            .strip()
            .upper()
        )

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

        if not self.is_port_available():

            self.disconnect()

            raise RuntimeError(
                f"Arduino not detected on "
                f"{self.port}"
            )

        self.connect()

        # Background reader releases this lock every <=0.25s,
        # so command writes remain responsive.
        with self.serial_lock:

            try:

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

        # Signal reader to stop.
        self.reader_stop_event.set()

        connection = self.serial_connection
        self.serial_connection = None

        if connection:

            try:

                if connection.is_open:

                    connection.close()

                    print(
                        "Arduino serial connection closed."
                    )

            except (
                serial.SerialException,
                OSError,
            ):

                pass

        # Do not join the reader from inside itself.
        if (
            self.reader_thread
            and
            self.reader_thread.is_alive()
            and
            threading.current_thread()
            is not self.reader_thread
        ):

            self.reader_thread.join(
                timeout=0.5
            )

        self.reader_thread = None

        self._clear_latest_data()


# =========================================================
# GLOBAL SENSOR SERVICE INSTANCE
# =========================================================

arduino_sensor_service = ArduinoSensorService()
