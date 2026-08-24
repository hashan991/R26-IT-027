import json
import os

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
            raw_line = (
                self.serial_connection
                .readline()
                .decode("utf-8")
                .strip()
            )

            if not raw_line:
                return None

            data = json.loads(raw_line)

            return self.normalize_sensor_data(data)

        except json.JSONDecodeError as error:
            print(
                f"[POWDER SERIAL] Invalid JSON: {error}"
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

    def normalize_sensor_data(self, data: dict):
        return {
            "batch_id": data.get("batch_id"),

            "moisture": float(
                data.get("moisture", 0)
            ),

            "red": float(
                data.get("red", 0)
            ),

            "green": float(
                data.get("green", 0)
            ),

            "blue": float(
                data.get("blue", 0)
            ),

            "temperature": float(
                data.get("temperature", 0)
            ),

            "humidity": float(
                data.get("humidity", 0)
            ),

            "status": data.get("status"),
        }


powder_serial_service = PowderSerialService()