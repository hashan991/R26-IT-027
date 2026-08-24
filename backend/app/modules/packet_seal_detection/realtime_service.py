import os
import time
import threading
from pathlib import Path

import cv2
from dotenv import load_dotenv
from ultralytics import YOLO

from app.modules.packet_seal_detection.report_service import report_service

# ==================================================
# ENVIRONMENT
# ==================================================

load_dotenv()


# ==================================================
# PROJECT PATHS
# ==================================================

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[4]

SEAL_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "packet_seal_detection"
    / "seal_detector"
    / "best.pt"
)

OVERHEAT_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "packet_seal_detection"
    / "overheat_detector"
    / "best.pt"
)


# ==================================================
# CAMERA SETTINGS
# ==================================================

CAMERA_URL = os.getenv(
    "IP_WEBCAM_URL",
    "http://10.25.249.116:8080/videofeed"
)

SEAL_CONFIDENCE = 0.25
OVERHEAT_CONFIDENCE = 0.25


# ==================================================
# LOAD AI MODELS
# ==================================================

print("Loading Real-Time Seal Detection AI...")
seal_model = YOLO(str(SEAL_MODEL_PATH))

print("Loading Real-Time Overheat Detection AI...")
overheat_model = YOLO(str(OVERHEAT_MODEL_PATH))

print("Real-Time AI models loaded.")


# ==================================================
# REAL-TIME INSPECTOR
# ==================================================

class RealtimeSealInspector:

    def __init__(self):

        self.camera = None
        self.running = False

        self.result_lock = threading.Lock()

        self.latest_result = {
            "camera_connected": False,
            "seal_count": 0,
            "overheat_detected": False,
            "highest_overheat_confidence": 0,
            "final_status": "NOT_STARTED",
            "seals": [],
        }


    # ==================================================
    # OPEN CAMERA
    # ==================================================

    def open_camera(self):

        if self.camera is not None and self.camera.isOpened():
            return True

        self.camera = cv2.VideoCapture(CAMERA_URL)

        # Try to reduce stream delay
        self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not self.camera.isOpened():

            with self.result_lock:
                self.latest_result["camera_connected"] = False
                self.latest_result["final_status"] = "CAMERA_NOT_CONNECTED"

            return False

        with self.result_lock:
            self.latest_result["camera_connected"] = True

        return True


    # ==================================================
    # CLOSE CAMERA
    # ==================================================

    def close_camera(self):

        if self.camera is not None:

            self.camera.release()

        self.camera = None


    # ==================================================
    # START REAL-TIME INSPECTION
    # ==================================================

    def start(self):

        if self.running:

            return {
                "started": True,
                "message": "Real-time inspection is already running."
            }

        if not self.open_camera():

            return {
                "started": False,
                "message": "Could not connect to IP Webcam."
            }

        self.running = True

        return {
            "started": True,
            "message": "Real-time seal inspection started.",
            "camera_url": CAMERA_URL
        }


    # ==================================================
    # STOP REAL-TIME INSPECTION
    # ==================================================

    def stop(self):

        self.running = False

        self.close_camera()

        with self.result_lock:

            self.latest_result["camera_connected"] = False
            self.latest_result["final_status"] = "STOPPED"

        return {
            "stopped": True,
            "message": "Real-time seal inspection stopped."
        }


    # ==================================================
    # PROCESS ONE FRAME
    # ==================================================

    def process_frame(self, frame):

        frame_height, frame_width = frame.shape[:2]

        seals_data = []

        packet_overheat_detected = False

        highest_overheat_confidence = 0.0


        # ==================================================
        # AI 1 - SEAL DETECTION
        # ==================================================

        seal_results = seal_model.predict(
            source=frame,
            conf=SEAL_CONFIDENCE,
            imgsz=640,
            verbose=False
        )

        seal_result = seal_results[0]


        # ==================================================
        # PROCESS EACH SEAL
        # ==================================================

        for seal_index, seal_box in enumerate(seal_result.boxes):

            seal_confidence = float(seal_box.conf[0])

            sx1, sy1, sx2, sy2 = map(
                int,
                seal_box.xyxy[0].tolist()
            )


            # Keep coordinates inside full image

            sx1 = max(0, min(sx1, frame_width - 1))
            sx2 = max(0, min(sx2, frame_width))

            sy1 = max(0, min(sy1, frame_height - 1))
            sy2 = max(0, min(sy2, frame_height))


            if sx2 <= sx1 or sy2 <= sy1:
                continue


            # ==================================================
            # CROP SEAL REGION
            # ==================================================

            seal_crop = frame[
                sy1:sy2,
                sx1:sx2
            ]


            if seal_crop.size == 0:
                continue


            # ==================================================
            # AI 2 - OVERHEAT OBJECT DETECTION
            # ==================================================

            defect_results = overheat_model.predict(
                source=seal_crop,
                conf=OVERHEAT_CONFIDENCE,
                imgsz=640,
                verbose=False
            )

            defect_result = defect_results[0]

            defects = []

            seal_overheat_detected = False


            # ==================================================
            # PROCESS DEFECT BOXES
            # ==================================================

            for defect_box in defect_result.boxes:

                defect_class_id = int(
                    defect_box.cls[0]
                )

                defect_confidence = float(
                    defect_box.conf[0]
                )

                defect_name = str(
                    overheat_model.names[
                        defect_class_id
                    ]
                )


                dx1, dy1, dx2, dy2 = map(
                    int,
                    defect_box.xyxy[0].tolist()
                )


                # ==================================================
                # MAP CROP COORDINATES TO FULL PACKET FRAME
                # ==================================================

                full_dx1 = sx1 + dx1
                full_dy1 = sy1 + dy1

                full_dx2 = sx1 + dx2
                full_dy2 = sy1 + dy2


                defect_name_lower = defect_name.lower()


                is_overheat = (
                    "overheat" in defect_name_lower
                    or "over heat" in defect_name_lower
                    or "burn" in defect_name_lower
                )


                if is_overheat:

                    seal_overheat_detected = True
                    packet_overheat_detected = True

                    highest_overheat_confidence = max(
                        highest_overheat_confidence,
                        defect_confidence
                    )

                    defect_color = (0, 0, 255)

                else:

                    defect_color = (0, 165, 255)


                # ==================================================
                # DRAW EXACT AI 2 DEFECT BOX
                # ==================================================

                cv2.rectangle(
                    frame,
                    (full_dx1, full_dy1),
                    (full_dx2, full_dy2),
                    defect_color,
                    3
                )


                defect_label = (
                    f"{defect_name} "
                    f"{defect_confidence * 100:.1f}%"
                )


                cv2.putText(
                    frame,
                    defect_label,
                    (
                        full_dx1,
                        max(full_dy1 - 10, 30)
                    ),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    defect_color,
                    2
                )


                defects.append({
                    "class_name": defect_name,
                    "confidence": round(
                        defect_confidence,
                        4
                    ),
                    "box": {
                        "x1": full_dx1,
                        "y1": full_dy1,
                        "x2": full_dx2,
                        "y2": full_dy2,
                    }
                })


            # ==================================================
            # SEAL STATUS
            # ==================================================

            if seal_overheat_detected:

                seal_status = "OVERHEAT"
                seal_color = (0, 0, 255)

            else:

                seal_status = "NO_OVERHEAT_DETECTED"
                seal_color = (0, 255, 0)


            # ==================================================
            # DRAW AI 1 SEAL BOX
            # ==================================================

            cv2.rectangle(
                frame,
                (sx1, sy1),
                (sx2, sy2),
                seal_color,
                3
            )


            seal_label = (
                f"SEAL {seal_confidence * 100:.1f}% "
                f"| {seal_status}"
            )


            cv2.putText(
                frame,
                seal_label,
                (
                    sx1,
                    max(sy1 - 35, 30)
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.65,
                seal_color,
                2
            )


            seals_data.append({
                "seal_number": seal_index + 1,

                "seal_confidence": round(
                    seal_confidence,
                    4
                ),

                "status": seal_status,

                "box": {
                    "x1": sx1,
                    "y1": sy1,
                    "x2": sx2,
                    "y2": sy2,
                },

                "defects": defects
            })


        # ==================================================
        # PACKET LEVEL RESULT
        # ==================================================

        if packet_overheat_detected:

            final_status = "OVERHEAT_DETECTED"
            packet_color = (0, 0, 255)

        elif len(seals_data) > 0:

            final_status = "NO_OVERHEAT_DETECTED"
            packet_color = (0, 255, 0)

        else:

            final_status = "NO_SEAL_DETECTED"
            packet_color = (0, 165, 255)


        # ==================================================
        # DRAW PACKET RESULT
        # ==================================================

        cv2.putText(
            frame,
            f"PACKET: {final_status}",
            (25, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            packet_color,
            3
        )


                # ==================================================
        # BUILD LATEST RESULT
        # ==================================================

        result_data = {
            "camera_connected": True,
            "seal_count": len(seals_data),
            "overheat_detected": packet_overheat_detected,
            "highest_overheat_confidence": round(
                highest_overheat_confidence,
                4
            ),
            "final_status": final_status,
            "seals": seals_data
        }


        # ==================================================
        # SAVE LATEST RESULT FOR FRONTEND
        # ==================================================

        with self.result_lock:
            self.latest_result = result_data


        # ==================================================
        # SAVE RESULT + ANNOTATED FRAME FOR REPORT
        # ==================================================

        report_service.save_realtime_result(
            result=result_data,
            annotated_frame=frame
        )


        return frame


        # ==================================================
    # MJPEG VIDEO STREAM
    # ==================================================

    def generate_stream(self):

        if not self.running:

            start_result = self.start()

            if not start_result.get("started"):
                return


        while self.running:

            if (
                self.camera is None
                or not self.camera.isOpened()
            ):
                break


            success, frame = self.camera.read()


            if not success:

                time.sleep(0.05)
                continue


            # Run AI 1 + AI 2 and draw boxes
            processed_frame = self.process_frame(
                frame
            )


            # Convert frame to JPEG
            encode_success, buffer = cv2.imencode(
                ".jpg",
                processed_frame
            )


            if not encode_success:
                continue


            frame_bytes = buffer.tobytes()


            # Send as MJPEG stream
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame_bytes
                + b"\r\n"
            )


    # ==================================================
    # GET LATEST AI RESULT
    # ==================================================

    def get_latest_result(self):

        with self.result_lock:

            return dict(
                self.latest_result
            )


# ==================================================
# GLOBAL INSTANCE
# ==================================================

realtime_inspector = RealtimeSealInspector()