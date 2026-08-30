import json
import os
import time

import serial
from dotenv import load_dotenv


load_dotenv()


class PowderSerialService:

    def __init__(self):

        self.port = os.getenv(
            "POWDER_SERIAL_PORT",
            "COM3",
        )

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

        self.serial_connection = None


    # ========================================================
    # STATUS
    # ========================================================

    def is_connected(self):

        if self.serial_connection is None:
            return False

        try:
            return self.serial_connection.is_open

        except Exception:
            return False


    def get_status(self):

        return {
            "connected": self.is_connected(),
            "port": self.port,
            "baud_rate": self.baud_rate,
            "device": "Coffee Powder Sensor Module",
        }


    # ========================================================
    # CONNECT
    # ========================================================

    def connect(self):

        if self.is_connected():
            return True

        try:

            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                timeout=self.timeout,
            )

            # Wait for Arduino serial connection to stabilize.
            time.sleep(0.5)

            # Remove incomplete / old startup bytes.
            self.serial_connection.reset_input_buffer()

            print(
                f"[POWDER SERIAL] Connected to "
                f"{self.port} @ {self.baud_rate}"
            )

            return True

        except Exception as error:

            print(
                f"[POWDER SERIAL] Connection failed: {error}"
            )

            self.serial_connection = None

            return False


    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(self):

        if self.serial_connection is not None:

            try:
                self.serial_connection.close()

            except Exception:
                pass

        self.serial_connection = None


    # ========================================================
    # READ SENSOR DATA
    # ========================================================

    def read_sensor_data(self):

        if not self.is_connected():

            if not self.connect():
                return None

        try:

            # ====================================================
            # CLEAR OLD SERIAL DATA
            #
            # Arduino sends a reading continuously.
            # Old unread readings may remain in the serial buffer.
            #
            # Clear them so the API waits for a fresh sample.
            # ====================================================

            stale_bytes = self.serial_connection.in_waiting

            if stale_bytes > 0:

                print(
                    f"[POWDER SERIAL] Clearing "
                    f"{stale_bytes} stale bytes"
                )

                self.serial_connection.reset_input_buffer()


            # ====================================================
            # READ FRESH COMPLETE RECORD
            # ====================================================

            for _ in range(5):

                raw_line = (
                    self.serial_connection
                    .readline()
                    .decode(
                        "utf-8",
                        errors="ignore",
                    )
                    .strip()
                )

                print(
                    f"[POWDER SERIAL] RAW DATA: "
                    f"{repr(raw_line)}"
                )

                if not raw_line:
                    continue


                # =================================================
                # FORMAT 1 - JSON
                # =================================================

                if raw_line.startswith("{"):

                    try:

                        data = json.loads(
                            raw_line
                        )

                        return self.normalize_sensor_data(
                            data
                        )

                    except json.JSONDecodeError as error:

                        print(
                            "[POWDER SERIAL] "
                            f"Invalid JSON: {error}"
                        )

                        continue


                # =================================================
                # FORMAT 2 - ARDUINO CSV
                #
                # moisture,
                # red,
                # green,
                # blue,
                # temperature,
                # humidity,
                # status,
                # recovery
                # =================================================

                parts = [
                    item.strip()
                    for item in raw_line.split(",")
                ]


                # Skip partial / malformed serial line.
                if len(parts) != 8:

                    print(
                        "[POWDER SERIAL] "
                        "Incomplete CSV record. "
                        "Waiting for next sample..."
                    )

                    continue


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

                        "status": parts[6],

                        "device_decision": parts[7],
                    }

                    return self.normalize_sensor_data(
                        data
                    )


                except (
                    ValueError,
                    IndexError,
                ) as error:

                    print(
                        "[POWDER SERIAL] "
                        f"Invalid CSV values: {error}"
                    )

                    continue


            print(
                "[POWDER SERIAL] "
                "No valid fresh sensor record received"
            )

            return None


        except Exception as error:

            print(
                f"[POWDER SERIAL] Read error: {error}"
            )

            return None


    # ========================================================
    # NORMALIZE
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


powder_serial_service = PowderSerialService()