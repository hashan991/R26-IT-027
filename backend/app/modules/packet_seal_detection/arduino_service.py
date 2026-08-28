# app/modules/packet_seal_detection/arduino_service.py

import os
import time
import threading
import serial

from app.modules.packet_seal_detection.report_service import report_service
from app.modules.packet_seal_detection import inspection_service

from dotenv import load_dotenv

load_dotenv()


# ==================================================
# ARDUINO SETTINGS
# ==================================================

ARDUINO_PORT = os.getenv("ARDUINO_PORT", "COM6")
ARDUINO_BAUD = int(os.getenv("ARDUINO_BAUD", "9600"))


# ==================================================
# ARDUINO DEVICE CLASS
# ==================================================

class ArduinoLeakDevice:

    def __init__(self):
        self.serial_connection = None
        self.lock = threading.Lock()

    # ==================================================
    # CONNECT TO ARDUINO
    # ==================================================
    def connect(self):

        if self.serial_connection and self.serial_connection.is_open:
            return

        self.serial_connection = serial.Serial(
            port=ARDUINO_PORT,
            baudrate=ARDUINO_BAUD,
            timeout=1
        )

        # Arduino Uno resets when serial connection opens
        time.sleep(2.5)

        self.serial_connection.reset_input_buffer()

    # ==================================================
    # DISCONNECT
    # ==================================================
    def disconnect(self):

        if self.serial_connection:
            self.serial_connection.close()

        self.serial_connection = None

    # ==================================================
    # CHECK DEVICE STATUS
    # ==================================================
    def get_status(self):

        try:
            self.connect()

            return {
                "connected": True,
                "port": ARDUINO_PORT
            }

        except Exception as error:

            return {
                "connected": False,
                "port": ARDUINO_PORT,
                "error": str(error)
            }

    # ==================================================
    # RUN PACKET LEAK TEST
    # ==================================================
    # `packet_id`: the packet this leak test belongs to. If not
    # given, it automatically uses whichever inspection session
    # is currently active (started via /inspection/start).
    # ==================================================
    def run_test(self, packet_id=None):

        with self.lock:

            self.connect()
            self.serial_connection.reset_input_buffer()

            self.serial_connection.write(b"START\n")
            self.serial_connection.flush()

            result = {
                "readings": []
            }

            deadline = time.time() + 150

            while time.time() < deadline:

                raw_line = self.serial_connection.readline()

                if not raw_line:
                    continue

                line = raw_line.decode("utf-8", errors="ignore").strip()

                if not line:
                    continue

                print("ARDUINO:", line)

                if line.startswith("READING:"):
                    result["readings"].append(int(line.split(":", 1)[1]))

                elif line.startswith("INITIAL:"):
                    result["initial_value"] = int(line.split(":", 1)[1])

                elif line.startswith("COUNT:"):
                    result["reading_count"] = int(line.split(":", 1)[1])

                elif line.startswith("AVERAGE:"):
                    result["average"] = float(line.split(":", 1)[1])

                elif line.startswith("MIN:"):
                    result["minimum"] = int(line.split(":", 1)[1])

                elif line.startswith("MAX:"):
                    result["maximum"] = int(line.split(":", 1)[1])

                elif line.startswith("RANGE:"):
                    result["range"] = int(line.split(":", 1)[1])

                elif line.startswith("THRESHOLD:"):
                    result["threshold"] = int(line.split(":", 1)[1])

                elif line.startswith("RESULT:"):
                    result["status"] = line.split(":", 1)[1]

                elif line.startswith("STATUS:"):
                    result["device_status"] = line.split(":", 1)[1]

                elif line.startswith("ERROR:"):
                    result["error"] = line.split(":", 1)[1]

                elif line == "TEST_COMPLETE":

                    # ------------------------------------------
                    # LINK THIS LEAK RESULT TO THE ACTIVE PACKET
                    # ------------------------------------------

                    resolved_packet_id = (
                        packet_id
                        or inspection_service.get_active_packet_id()
                    )

                    result["packet_id"] = resolved_packet_id

                    if resolved_packet_id:
                        inspection_service.update_leak_result(
                            resolved_packet_id,
                            result
                        )

                    # Save latest result for PDF report (legacy path)
                    report_service.save_leak_result(result)

                    # Save permanently to MongoDB
                    report_service.save_leak_history(result)

                    return result

            raise TimeoutError("Arduino packet leak test timed out.")


# ==================================================
# DEVICE INSTANCE
# ==================================================

leak_device = ArduinoLeakDevice()