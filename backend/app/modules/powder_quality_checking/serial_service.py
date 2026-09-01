# ============================================================
# Smart Coffee Manufacturing
# Coffee Powder Serial Service
#
# Features:
# - Serial connection management
# - Automatic disconnect detection
# - Automatic reconnect
# - Automatic COM-port detection
# - Fresh sensor reading
# - JSON + CSV support
# ============================================================

import json
import os
import time
import threading

import serial

from serial import SerialException

from serial.tools import list_ports

from dotenv import load_dotenv


load_dotenv()


class PowderSerialService:

    def __init__(self):

        # ----------------------------------------------------
        # SERIAL SETTINGS
        # ----------------------------------------------------

        self.configured_port = os.getenv(
            "POWDER_SERIAL_PORT",
            "COM3",
        )

        # Current port being used.
        self.port = self.configured_port

        self.baud_rate = int(
            os.getenv(
                "POWDER_SERIAL_BAUD_RATE",
                "9600",
            )
        )

        self.timeout = float(
            os.getenv(
                "POWDER_SERIAL_TIMEOUT",
                "2",
            )
        )

        self.reconnect_delay = float(
            os.getenv(
                "POWDER_SERIAL_RECONNECT_DELAY",
                "1",
            )
        )

        self.auto_detect = (
            os.getenv(
                "POWDER_SERIAL_AUTO_DETECT",
                "true",
            )
            .strip()
            .lower()
            in {
                "1",
                "true",
                "yes",
                "on",
            }
        )

        # ----------------------------------------------------
        # CONNECTION STATE
        # ----------------------------------------------------

        self.serial_connection = None

        self.last_successful_read = None

        self.last_error = None

        self._lock = threading.RLock()


    # ========================================================
    # AVAILABLE SERIAL PORTS
    # ========================================================

    def get_available_ports(self):

        try:

            return list(
                list_ports.comports()
            )

        except Exception as error:

            print(
                "[POWDER SERIAL] "
                f"Unable to list serial ports: {error}"
            )

            return []


    # ========================================================
    # CHECK WHETHER A PORT EXISTS
    # ========================================================

    def port_exists(
        self,
        port_name,
    ):

        if not port_name:
            return False

        port_name = str(
            port_name
        ).upper()

        for port in self.get_available_ports():

            device = str(
                port.device or ""
            ).upper()

            if device == port_name:
                return True

        return False


    # ========================================================
    # AUTOMATIC SERIAL DEVICE DETECTION
    # ========================================================

    def find_sensor_port(self):

        ports = self.get_available_ports()

        if not ports:

            return None


        # ----------------------------------------------------
        # 1. PREFER CONFIGURED PORT
        # ----------------------------------------------------

        for port in ports:

            if (
                str(port.device).upper()
                ==
                str(
                    self.configured_port
                ).upper()
            ):

                print(
                    "[POWDER SERIAL] "
                    f"Configured device found: "
                    f"{port.device}"
                )

                return port.device


        # ----------------------------------------------------
        # 2. FIND COMMON ARDUINO / ESP / USB SERIAL DEVICES
        # ----------------------------------------------------

        device_keywords = [

            "arduino",

            "ch340",

            "ch341",

            "cp210",

            "cp210x",

            "silicon labs",

            "usb serial",

            "usb-serial",

            "serial usb",

            "esp32",

            "wch",

        ]


        for port in ports:

            description = str(
                port.description or ""
            ).lower()

            manufacturer = str(
                port.manufacturer or ""
            ).lower()

            product = str(
                getattr(
                    port,
                    "product",
                    "",
                )
                or ""
            ).lower()

            searchable_text = " ".join(
                [
                    description,
                    manufacturer,
                    product,
                ]
            )

            if any(
                keyword in searchable_text
                for keyword in device_keywords
            ):

                print(
                    "[POWDER SERIAL] "
                    "Auto detected sensor device: "
                    f"{port.device} "
                    f"({port.description})"
                )

                return port.device


        # ----------------------------------------------------
        # 3. SAFE FALLBACK
        #
        # Only use fallback when exactly one serial port exists.
        # This avoids accidentally connecting to another device.
        # ----------------------------------------------------

        if len(ports) == 1:

            port = ports[0]

            print(
                "[POWDER SERIAL] "
                "Single serial device detected. "
                f"Using {port.device}"
            )

            return port.device


        return None


    # ========================================================
    # RAW CONNECTION CHECK
    # ========================================================

    def _connection_is_open(self):

        if self.serial_connection is None:
            return False

        try:

            return bool(
                self.serial_connection.is_open
            )

        except Exception:
            return False


    # ========================================================
    # CONNECTION STATUS
    # ========================================================

    def is_connected(self):

        with self._lock:

            if not self._connection_is_open():

                return False


            # ------------------------------------------------
            # IMPORTANT
            #
            # PySerial can sometimes leave `is_open=True`
            # immediately after USB device removal.
            #
            # Therefore also verify that the COM port still
            # physically exists in Windows.
            # ------------------------------------------------

            active_port = (

                getattr(
                    self.serial_connection,
                    "port",
                    None,
                )

                or self.port

            )


            if not self.port_exists(
                active_port
            ):

                print(
                    "[POWDER SERIAL] "
                    f"Device {active_port} "
                    "is no longer available"
                )

                self._disconnect_unlocked()

                return False


            return True


    # ========================================================
    # STATUS
    # ========================================================

    def get_status(self):

        # ----------------------------------------------------
        # IMPORTANT
        #
        # Frontend normally polls the status endpoint.
        #
        # Every status request therefore becomes an opportunity
        # to automatically reconnect if the device was replugged.
        # ----------------------------------------------------

        connected = self.is_connected()

        if not connected:

            connected = self.connect()


        return {

            "connected": connected,

            "port": self.port,

            "configured_port": (
                self.configured_port
            ),

            "baud_rate": self.baud_rate,

            "device": (
                "Coffee Powder Sensor Module"
            ),

            "auto_detect": (
                self.auto_detect
            ),

            "last_successful_read": (
                self.last_successful_read
            ),

            "last_error": (
                self.last_error
            ),
        }


    # ========================================================
    # BUILD PORT CANDIDATE LIST
    # ========================================================

    def get_connection_candidates(self):

        candidates = []


        # ----------------------------------------------------
        # FIRST:
        # configured COM port
        # ----------------------------------------------------

        if self.port_exists(
            self.configured_port
        ):

            candidates.append(
                self.configured_port
            )


        # ----------------------------------------------------
        # SECOND:
        # currently known port
        # ----------------------------------------------------

        if (
            self.port
            and
            self.port_exists(
                self.port
            )
            and
            self.port not in candidates
        ):

            candidates.append(
                self.port
            )


        # ----------------------------------------------------
        # THIRD:
        # auto detected Arduino / ESP device
        # ----------------------------------------------------

        if self.auto_detect:

            detected_port = (
                self.find_sensor_port()
            )

            if (
                detected_port
                and
                detected_port
                not in candidates
            ):

                candidates.append(
                    detected_port
                )


        return candidates


    # ========================================================
    # CONNECT
    # ========================================================

    def connect(self):

        with self._lock:

            if self.is_connected():

                return True


            # ------------------------------------------------
            # Remove old / dead serial object
            # ------------------------------------------------

            self._disconnect_unlocked()


            candidates = (
                self.get_connection_candidates()
            )


            if not candidates:

                self.last_error = (
                    "Coffee Powder Sensor "
                    "serial device not found"
                )

                print(
                    "[POWDER SERIAL] "
                    "No compatible serial device found"
                )

                return False


            # ------------------------------------------------
            # Try every available candidate
            # ------------------------------------------------

            for candidate_port in candidates:

                try:

                    print(
                        "[POWDER SERIAL] "
                        "Trying connection: "
                        f"{candidate_port}"
                    )


                    connection = serial.Serial(

                        port=candidate_port,

                        baudrate=self.baud_rate,

                        timeout=self.timeout,

                        write_timeout=self.timeout,
                    )


                    # ----------------------------------------
                    # Arduino / ESP serial connection
                    # stabilization
                    # ----------------------------------------

                    time.sleep(
                        0.7
                    )


                    # ----------------------------------------
                    # Clear startup bytes
                    # ----------------------------------------

                    try:

                        connection.reset_input_buffer()

                    except Exception:
                        pass


                    self.serial_connection = (
                        connection
                    )

                    self.port = (
                        candidate_port
                    )

                    self.last_error = None


                    print(
                        "[POWDER SERIAL] "
                        "Connected successfully to "
                        f"{self.port} "
                        f"@ {self.baud_rate}"
                    )


                    return True


                except (
                    SerialException,
                    OSError,
                    PermissionError,
                ) as error:

                    self.last_error = str(
                        error
                    )

                    print(
                        "[POWDER SERIAL] "
                        f"Connection failed on "
                        f"{candidate_port}: "
                        f"{error}"
                    )


                except Exception as error:

                    self.last_error = str(
                        error
                    )

                    print(
                        "[POWDER SERIAL] "
                        f"Unexpected connection error "
                        f"on {candidate_port}: "
                        f"{error}"
                    )


            self.serial_connection = None

            return False


    # ========================================================
    # INTERNAL DISCONNECT
    # ========================================================

    def _disconnect_unlocked(self):

        if self.serial_connection is not None:

            try:

                if self.serial_connection.is_open:

                    self.serial_connection.close()

            except Exception:
                pass


        self.serial_connection = None


    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(self):

        with self._lock:

            self._disconnect_unlocked()


    # ========================================================
    # HANDLE SERIAL FAILURE
    # ========================================================

    def handle_serial_failure(
        self,
        error,
    ):

        self.last_error = str(
            error
        )

        print(
            "[POWDER SERIAL] "
            f"Serial connection lost: {error}"
        )

        self.disconnect()


    # ========================================================
    # PARSE SERIAL RECORD
    # ========================================================

    def parse_serial_record(
        self,
        raw_line,
    ):

        if not raw_line:
            return None


        # ====================================================
        # FORMAT 1 - JSON
        # ====================================================

        if raw_line.startswith("{"):

            try:

                data = json.loads(
                    raw_line
                )

                return (
                    self.normalize_sensor_data(
                        data
                    )
                )

            except json.JSONDecodeError as error:

                print(
                    "[POWDER SERIAL] "
                    f"Invalid JSON: {error}"
                )

                return None


        # ====================================================
        # FORMAT 2 - ARDUINO CSV
        #
        # moisture,
        # red,
        # green,
        # blue,
        # temperature,
        # humidity,
        # status,
        # device_decision
        # ====================================================

        parts = [

            item.strip()

            for item
            in raw_line.split(",")

        ]


        if len(parts) != 8:

            print(
                "[POWDER SERIAL] "
                "Incomplete CSV record. "
                "Waiting for next sample..."
            )

            return None


        try:

            data = {

                "batch_id": None,

                "moisture": float(
                    parts[0]
                ),

                "red": float(
                    parts[1]
                ),

                "green": float(
                    parts[2]
                ),

                "blue": float(
                    parts[3]
                ),

                "temperature": float(
                    parts[4]
                ),

                "humidity": float(
                    parts[5]
                ),

                "status": (
                    parts[6]
                ),

                "device_decision": (
                    parts[7]
                ),
            }


            return (
                self.normalize_sensor_data(
                    data
                )
            )


        except (
            ValueError,
            IndexError,
        ) as error:

            print(
                "[POWDER SERIAL] "
                f"Invalid CSV values: {error}"
            )

            return None


    # ========================================================
    # READ FROM CURRENT CONNECTION
    # ========================================================

    def _read_from_connection(self):

        # ----------------------------------------------------
        # CLEAR OLD SERIAL DATA
        # ----------------------------------------------------

        try:

            stale_bytes = (
                self.serial_connection
                .in_waiting
            )


            if stale_bytes > 0:

                print(
                    "[POWDER SERIAL] "
                    f"Clearing "
                    f"{stale_bytes} stale bytes"
                )

                self.serial_connection.reset_input_buffer()


        except (
            SerialException,
            OSError,
            PermissionError,
        ) as error:

            raise error


        # ----------------------------------------------------
        # READ FRESH COMPLETE RECORD
        # ----------------------------------------------------

        for _ in range(5):

            raw_bytes = (
                self.serial_connection
                .readline()
            )


            raw_line = (
                raw_bytes
                .decode(
                    "utf-8",
                    errors="ignore",
                )
                .strip()
            )


            print(
                "[POWDER SERIAL] "
                f"RAW DATA: "
                f"{repr(raw_line)}"
            )


            if not raw_line:
                continue


            normalized_data = (
                self.parse_serial_record(
                    raw_line
                )
            )


            if normalized_data is not None:

                self.last_successful_read = (
                    time.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                )

                self.last_error = None

                return normalized_data


        return None


    # ========================================================
    # READ SENSOR DATA
    # ========================================================

    def read_sensor_data(self):

        with self._lock:

            # =================================================
            # FIRST CONNECTION ATTEMPT
            # =================================================

            if not self.is_connected():

                print(
                    "[POWDER SERIAL] "
                    "Sensor disconnected. "
                    "Attempting automatic reconnect..."
                )


                if not self.connect():

                    print(
                        "[POWDER SERIAL] "
                        "Reconnect attempt failed"
                    )

                    return None


            # =================================================
            # FIRST READ ATTEMPT
            # =================================================

            try:

                data = (
                    self._read_from_connection()
                )


                if data is not None:
                    return data


            except (
                SerialException,
                OSError,
                PermissionError,
            ) as error:

                self.handle_serial_failure(
                    error
                )


            except Exception as error:

                self.handle_serial_failure(
                    error
                )


            # =================================================
            # RECONNECT + ONE RETRY
            #
            # This handles:
            #
            # unplug
            #     ↓
            # serial exception
            #     ↓
            # plug again
            #     ↓
            # reconnect
            #     ↓
            # continue reading
            # =================================================

            print(
                "[POWDER SERIAL] "
                "Trying automatic reconnect..."
            )


            time.sleep(
                self.reconnect_delay
            )


            if not self.connect():

                return None


            try:

                data = (
                    self._read_from_connection()
                )


                if data is not None:
                    return data


            except (
                SerialException,
                OSError,
                PermissionError,
            ) as error:

                self.handle_serial_failure(
                    error
                )


            except Exception as error:

                self.handle_serial_failure(
                    error
                )


            print(
                "[POWDER SERIAL] "
                "No valid fresh sensor record received"
            )


            return None


    # ========================================================
    # NORMALIZE SENSOR DATA
    # ========================================================

    def normalize_sensor_data(
        self,
        data: dict,
    ):

        return {

            "batch_id": data.get(
                "batch_id"
            ),

            "moisture": float(
                data.get(
                    "moisture",
                    0,
                )
            ),

            "red": float(
                data.get(
                    "red",
                    0,
                )
            ),

            "green": float(
                data.get(
                    "green",
                    0,
                )
            ),

            "blue": float(
                data.get(
                    "blue",
                    0,
                )
            ),

            "temperature": float(
                data.get(
                    "temperature",
                    0,
                )
            ),

            "humidity": float(
                data.get(
                    "humidity",
                    0,
                )
            ),

            "status": data.get(
                "status"
            ),

            "device_decision": data.get(
                "device_decision"
            ),
        }


# ============================================================
# GLOBAL SERIAL SERVICE INSTANCE
# ============================================================

powder_serial_service = (
    PowderSerialService()
)