import os
import time
import threading
from pathlib import Path

from datetime import datetime, timezone

import uuid

import cv2
from dotenv import load_dotenv
from ultralytics import YOLO

from app.modules.packet_seal_detection.history_service import (
    create_camera_history,
    save_camera_history
)

from app.modules.packet_seal_detection import inspection_service

from app.modules.packet_seal_detection.report_service import report_service

from app.modules.packet_seal_detection.inspection_service import (
    update_vision_result,
)

from app.modules.packet_seal_detection import inspection_service

# ==================================================
# ENVIRONMENT
# ==================================================

load_dotenv()


# ==================================================
# PROJECT PATHS
# ==================================================

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[4]

HISTORY_IMAGE_DIR = (
    PROJECT_ROOT
    / "backend"
    / "app"
    / "static"
    / "history"
)

HISTORY_IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


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

        self.camera_lock = threading.Lock()

        self.result_lock = threading.Lock()

        self.latest_frame = None
        self.frame_condition = threading.Condition()

        # ==========================================
        # MULTI FRAME VALIDATION SETTINGS
        # ==========================================

        self.overheat_history = []

        self.validation_frames = 5

        self.min_overheat_confidence = 0.40

        # ==========================================
        # FINAL INSPECTION IMAGE SETTINGS
        # ==========================================

        # ===============================
        # 3 SECOND INSPECTION CYCLE
        # ===============================

        self.captured_frames = []

        self.frame_results = []

        self.inspection_start_time = None

        self.inspection_duration = 3


        self.final_image = None

        self.best_confidence = 0


        self.history_saved = False

        # Current inspection session packet ID
        # (comes from inspection_service - the active session
        # created via POST /inspection/start)

        self.current_packet_id = None

        self.last_history_time = 0

        


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

        self.camera = cv2.VideoCapture(
            CAMERA_URL,
            cv2.CAP_FFMPEG
        )

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

        with self.camera_lock:

            if self.camera is not None:

                try:
                    self.camera.release()
                    time.sleep(1)

                except Exception as e:
                    print(
                        "Camera release error:",
                        e
                    )


            self.camera = None


        cv2.destroyAllWindows()

        print("Camera released successfully")


    #================================================

    def start(self, packet_id=None):

        if self.running:
            return {
                "started": True,
                "message": "Real-time inspection is already running."
            }

        # ------------------------------------------
        # RESOLVE WHICH PACKET THIS CAMERA RUN BELONGS TO
        # ------------------------------------------

        resolved_packet_id = (
            packet_id
            or inspection_service.get_active_packet_id()
        )

        if not resolved_packet_id:
            return {
                "started": False,
                "message": (
                    "No active inspection session. Please start a new "
                    "inspection (Packet ID) before starting the camera."
                )
            }

        if not self.open_camera():
            return {
                "started": False,
                "message": "Could not connect to IP Webcam."
            }

        self.overheat_history.clear()
        self.captured_frames.clear()
        self.frame_results.clear()

        self.final_image = None
        self.best_confidence = 0

        self.inspection_start_time = time.time()
        self.history_saved = False
        self.latest_frame = None

        self.current_packet_id = resolved_packet_id

        self.running = True

        self.processing_thread = threading.Thread(
            target=self.background_processing,
            daemon=True
        )

        self.processing_thread.start()

        return {
            "started": True,
            "message": "Real-time seal inspection started.",
            "camera_url": CAMERA_URL,
            "packet_id": self.current_packet_id
        }

    # ==================================================
    # STOP REAL-TIME INSPECTION
    # ==================================================

    def stop(self):

        print("Stopping realtime camera...")


        self.running = False


        time.sleep(0.2)


        self.close_camera()


        with self.result_lock:

            self.latest_result["camera_connected"] = False
            self.latest_result["final_status"] = "STOPPED"

            return {
                "stopped": True,
                "message": "Real-time seal inspection stopped."
            }


    # ==================================================
    # SAVE HISTORY BACKGROUND
    # ==================================================

    def save_history_background(self, history_data):

        import asyncio

        try:

            asyncio.run(
                save_camera_history(
                    history_data
                )
            )


            print(
                "History saved successfully"
            )


        except Exception as e:

            print(
                "History save error:",
                e
            )

    def generate_packet_signature(self, result):

        return (
            result.get("seal_count"),
            result.get("final_status"),
            str(result.get("seals"))
        )

    # ==================================================
    # RESET 3-SECOND INSPECTION CYCLE
    # ==================================================
    # FIXED BUG: this previously tried to assign
    # `self.current_packet_id = packet_id` using a `packet_id`
    # variable that was never defined anywhere in this method,
    # which would crash the background processing thread the
    # first time a cycle completed (NameError).
    #
    # The packet_id must NOT change mid-session: one physical
    # packet keeps the SAME identity for the whole camera run,
    # from Start Live Inspection until Stop Live Inspection.
    # ==================================================

    def reset_inspection_cycle(self):

        self.captured_frames.clear()

        self.frame_results.clear()

        self.final_image = None

        self.best_confidence = 0

        self.history_saved = False

        self.inspection_start_time = time.time()

    # ==================================================
    # SAVE FINAL INSPECTION IMAGE
    # ==================================================

    def save_final_image(self):

        if self.final_image is None:
            return None


        filename = (
            f"inspection_"
            f"{uuid.uuid4().hex}.jpg"
        )


        image_path = (
            HISTORY_IMAGE_DIR
            / filename
        )


        cv2.imwrite(
            str(image_path),
            self.final_image
        )


        return (
            f"/static/history/{filename}"
        )


        

                
    # ==================================================
    # PROCESS ONE FRAME
    # ==================================================

    def process_frame(self, frame):


        # ==========================================
        # CAPTURE INSPECTION FRAMES
        # ==========================================

        if self.inspection_start_time is None:

            self.inspection_start_time = time.time()


        elapsed = (
            time.time()
            -
            self.inspection_start_time
        )


        if elapsed <= self.inspection_duration:

            self.captured_frames.append(
                frame.copy()
            )


        frame_height, frame_width = frame.shape[:2]

        seals_data = []

        current_overheat_detected = False

        current_overheat_confidence = 0.0

        packet_overheat_detected = False

        highest_overheat_confidence = 0.0
        confirmed_frames = 0


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

                    current_overheat_detected = True
                    seal_overheat_detected = True


                    current_overheat_confidence = max(
                        current_overheat_confidence,
                        defect_confidence
                    )


                    defect_color = (0,0,255)

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
        # MULTI FRAME OVERHEAT VALIDATION
        # ==================================================

        if (
            current_overheat_detected
            and current_overheat_confidence >= self.min_overheat_confidence
        ):

            self.overheat_history.append(True)

        else:

            self.overheat_history.append(False)



        if len(self.overheat_history) > self.validation_frames:

            self.overheat_history.pop(0)



        confirmed_frames = self.overheat_history.count(True)



        if confirmed_frames >= self.validation_frames:

            packet_overheat_detected = True

            highest_overheat_confidence = current_overheat_confidence

        else:

            packet_overheat_detected = False

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
        # ==================================================
        # BUILD LATEST RESULT
        # ==================================================

        result_data = {

            "packet_id": self.current_packet_id,

            "camera_connected": True,

            "seal_count": len(seals_data),

            "overheat_detected": packet_overheat_detected,


            "validation": {

                "confirmed_frames": confirmed_frames,

                "required_frames": self.validation_frames,

                "status":
                    "CONFIRMED"
                    if confirmed_frames >= self.validation_frames
                else "CHECKING"

            },


            "highest_overheat_confidence": round(
                highest_overheat_confidence,
                4
            ),


            "final_status": final_status,


            "seals": seals_data,


            # ==========================================
            # 3 SECOND INSPECTION INFORMATION
            # ==========================================

            "inspection_cycle": {

                "duration_seconds": 3,

                "frames_captured": len(
                    self.captured_frames
                )

            },


            "inspection_image": None

        }

        confidence = highest_overheat_confidence


        if (
            confidence > self.best_confidence
            or self.final_image is None
        ):

            self.best_confidence = confidence

            self.final_image = frame.copy()


        # ==================================================
        # SAVE RESULT + ANNOTATED FRAME FOR REPORT
        # ==================================================

        report_service.save_realtime_result(
            result=result_data,
            annotated_frame=frame
        )

        # Save vision result into current inspection session
        # (this is what lets /report/generate and the leak test
        # later know this AI result belongs to this exact packet_id)

        if self.current_packet_id:

            update_vision_result(
                self.current_packet_id,
                result_data
            )

        # ==================================================
        # LIVE RESULT UPDATE (NO DELAY)
        # ==================================================

        with self.result_lock:

            self.latest_result = result_data.copy()

        packet_signature = self.generate_packet_signature(
            result_data
        )

        


        if (
            time.time() - self.inspection_start_time
            >= self.inspection_duration
            and len(seals_data) > 0
            and not self.history_saved
        ): 


            image_path = self.save_final_image()

            self.history_saved = True

            result_data["inspection_image"] = image_path

            with self.result_lock:

                self.latest_result = result_data.copy()


            # ==========================================
            # FINAL INSPECTION TIMESTAMP
            # ==========================================

            inspection_timestamp = datetime.now(timezone.utc)

            result_data["created_at"] = inspection_timestamp.isoformat()

            # ==========================================
            # RE-SAVE VISION RESULT WITH FINAL IMAGE PATH
            # AND TIMESTAMP ATTACHED
            # ==========================================

            if self.current_packet_id:

                update_vision_result(
                    self.current_packet_id,
                    result_data
                )

            # ==========================================
            # CREATE HISTORY RECORD
            # ==========================================

            history_data = create_camera_history(
                result=result_data,
                image_path=image_path
            )


            threading.Thread(
                target=self.save_history_background,
                args=(history_data,),
                daemon=True
            ).start()

            self.reset_inspection_cycle()


            self.last_packet_signature = packet_signature

    
        return frame
    # ==================================================
    # BACKGROUND FRAME PROCESSING
    # ==================================================

    # ==================================================
    # BACKGROUND CAMERA + AI PROCESSING LOOP
    # ==================================================

    def background_processing(self):

        print("Background AI processing started")

        while self.running:

            if (
                self.camera is None
                or not self.camera.isOpened()
            ):
                time.sleep(0.1)
                continue

            # ------------------------------------------
            # Read camera frame - ONLY HERE
            # ------------------------------------------

            with self.camera_lock:

                success, frame = self.camera.read()

            if not success:

                time.sleep(0.05)
                continue

            # ------------------------------------------
            # AI PROCESSING
            # ------------------------------------------

            processed_frame = self.process_frame(
                frame
            )

            # ------------------------------------------
            # Store latest processed frame
            # ------------------------------------------

            with self.frame_condition:

                self.latest_frame = processed_frame.copy()

                self.frame_condition.notify_all()

            # ------------------------------------------
            # Small delay
            # ------------------------------------------

            time.sleep(0.03)

        print("Background AI processing stopped")

            


    # ==================================================
    # MJPEG VIDEO STREAM
    # ==================================================

    # ==================================================
    # MJPEG VIDEO STREAM
    # ==================================================

    def generate_stream(self):

        while self.running:

            # ------------------------------------------
            # Get latest processed frame
            # ------------------------------------------

            with self.frame_condition:

                if self.latest_frame is None:

                    self.frame_condition.wait(
                        timeout=1.0
                    )

                if self.latest_frame is None:

                    continue

                frame = self.latest_frame.copy()

            # ------------------------------------------
            # Encode JPEG
            # ------------------------------------------

            encode_success, buffer = cv2.imencode(
                ".jpg",
                frame
            )

            if not encode_success:

                continue

            frame_bytes = buffer.tobytes()

            # ------------------------------------------
            # MJPEG response
            # ------------------------------------------

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