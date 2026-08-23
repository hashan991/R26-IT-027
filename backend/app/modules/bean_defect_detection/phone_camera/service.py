import os
import subprocess
import time
import uuid

from dotenv import load_dotenv

from app.modules.bean_defect_detection.service import predict_bean_image


# =========================================================
# DEBUG - CONFIRM CORRECT SERVICE FILE IS LOADED
# =========================================================

print(
    f"[PHONE CAMERA SERVICE] Loaded from: {__file__}"
)


load_dotenv()


# =========================================================
# CONFIGURATION
# =========================================================

ADB_PATH = os.getenv(
    "ADB_PATH",
    r"C:\Users\Hashan\AppData\Local\Android\Sdk\platform-tools\adb.exe",
)

PHONE_CAPTURE_DIR = os.getenv(
    "PHONE_CAPTURE_DIR",
    r"D:\coffee_phone_capture",
)

PHONE_CAMERA_REMOTE_DIR = os.getenv(
    "PHONE_CAMERA_REMOTE_DIR",
    "/sdcard/DCIM/Camera",
)

PHONE_CAMERA_OPEN_DELAY = float(
    os.getenv(
        "PHONE_CAMERA_OPEN_DELAY",
        "4",
    )
)

PHONE_CAMERA_SAVE_TIMEOUT = float(
    os.getenv(
        "PHONE_CAMERA_SAVE_TIMEOUT",
        "20",
    )
)


# =========================================================
# CREATE LOCAL CAPTURE DIRECTORY
# =========================================================

os.makedirs(
    PHONE_CAPTURE_DIR,
    exist_ok=True,
)


# =========================================================
# PHONE CAMERA SERVICE
# =========================================================

class PhoneCameraService:

    # =====================================================
    # RUN ADB COMMAND
    # =====================================================

    def _run_adb(
        self,
        arguments,
        timeout=20,
    ):
        # -------------------------------------------------
        # CHECK ADB.EXE
        # -------------------------------------------------

        if not os.path.exists(
            ADB_PATH
        ):
            raise RuntimeError(
                f"ADB executable was not found: {ADB_PATH}"
            )


        # -------------------------------------------------
        # BUILD COMMAND
        # -------------------------------------------------

        command = [
            ADB_PATH,
            *arguments,
        ]


        # -------------------------------------------------
        # RUN COMMAND
        # -------------------------------------------------

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding="utf-8",
                errors="ignore",
            )

        except subprocess.TimeoutExpired:
            raise RuntimeError(
                "ADB command timed out."
            )


        # -------------------------------------------------
        # CHECK RESULT
        # -------------------------------------------------

        if result.returncode != 0:

            error_message = (
                result.stderr.strip()
                or result.stdout.strip()
                or "ADB command failed."
            )

            raise RuntimeError(
                error_message
            )


        return result.stdout.strip()


    # =====================================================
    # GET CONNECTED PHONE
    # =====================================================

    def get_connected_device(
        self,
    ):
        output = self._run_adb(
            [
                "devices",
            ]
        )


        devices = []


        for line in output.splitlines():

            line = line.strip()


            if not line:
                continue


            if line.startswith(
                "List of devices"
            ):
                continue


            parts = line.split()


            if (
                len(parts) >= 2
                and parts[1] == "device"
            ):
                devices.append(
                    parts[0]
                )


        # -------------------------------------------------
        # NO PHONE
        # -------------------------------------------------

        if len(devices) == 0:
            raise RuntimeError(
                "No authorized Android phone is connected through ADB."
            )


        # -------------------------------------------------
        # MULTIPLE PHONES
        # -------------------------------------------------

        if len(devices) > 1:
            raise RuntimeError(
                "More than one Android device is connected. "
                "Disconnect the extra device and try again."
            )


        return devices[0]


    # =====================================================
    # PHONE STATUS
    # =====================================================

    def get_status(
        self,
    ):
        try:

            device_id = (
                self.get_connected_device()
            )


            return {
                "connected": True,

                "device_id":
                    device_id,

                "adb_path":
                    ADB_PATH,

                "capture_directory":
                    PHONE_CAPTURE_DIR,
            }


        except Exception as error:

            return {
                "connected": False,

                "device_id":
                    None,

                "error":
                    str(error),
            }


    # =====================================================
    # GET LATEST PHONE PHOTO
    # =====================================================
    #
    # IMPORTANT:
    #
    # This uses the SAME command that worked manually:
    #
    # adb shell
    # "ls -t /sdcard/DCIM/Camera/*.jpg
    #  2>/dev/null | head -n 1"
    #
    # It only searches JPG photos.
    #
    # Therefore folders such as:
    #
    # acct
    # accl
    #
    # cannot be selected as the latest photo.
    # =====================================================

    def get_latest_photo_name(
        self,
    ):

        # -------------------------------------------------
        # EXACT SHELL COMMAND
        # -------------------------------------------------

        command = (
            f"ls -t "
            f"{PHONE_CAMERA_REMOTE_DIR}/*.jpg "
            f"2>/dev/null | head -n 1"
        )


        print(
            "[PHONE CAMERA] Latest photo command:"
        )

        print(
            command
        )


        # -------------------------------------------------
        # IMPORTANT
        #
        # Do NOT use:
        #
        # shell, sh, -c, command
        #
        # Instead adb shell receives the complete command
        # exactly like the successful CMD test.
        # -------------------------------------------------

        output = self._run_adb(
            [
                "shell",
                command,
            ]
        )


        print(
            "[PHONE CAMERA] Raw latest photo output:"
        )

        print(
            repr(output)
        )


        # -------------------------------------------------
        # CLEAN OUTPUT
        # -------------------------------------------------

        latest_path = (
            output
            .replace("\r", "")
            .replace("\n", "")
            .strip()
        )


        # -------------------------------------------------
        # NO PHOTO
        # -------------------------------------------------

        if not latest_path:

            print(
                "[PHONE CAMERA] No JPG photo found."
            )

            return None


        # -------------------------------------------------
        # GET FILE NAME ONLY
        #
        # /sdcard/DCIM/Camera/20260814_112131.jpg
        #
        # becomes:
        #
        # 20260814_112131.jpg
        # -------------------------------------------------

        filename = (
            latest_path
            .replace("\\", "/")
            .split("/")[-1]
        )


        print(
            f"[PHONE CAMERA] Latest JPG filename: {filename}"
        )


        return filename


    # =====================================================
    # OPEN PHONE CAMERA
    # =====================================================

    def open_camera(
        self,
    ):

        # -------------------------------------------------
        # CHECK PHONE
        # -------------------------------------------------

        device_id = (
            self.get_connected_device()
        )


        # -------------------------------------------------
        # OPEN NATIVE ANDROID CAMERA
        # -------------------------------------------------

        self._run_adb(
            [
                "shell",
                "am",
                "start",
                "-a",
                "android.media.action.STILL_IMAGE_CAMERA",
            ]
        )


        print(
            "Phone camera opened"
        )


        return {
            "status": "success",

            "device_id":
                device_id,

            "message":
                "Phone camera opened.",
        }


    # =====================================================
    # CAPTURE ORIGINAL PHONE PHOTO
    # =====================================================

    def capture_photo(
        self,
    ):

        # -------------------------------------------------
        # CHECK PHONE CONNECTION
        # -------------------------------------------------

        device_id = (
            self.get_connected_device()
        )


        print(
            f"Connected phone: {device_id}"
        )


        # -------------------------------------------------
        # GET LATEST PHOTO BEFORE CAPTURE
        # -------------------------------------------------

        previous_photo = (
            self.get_latest_photo_name()
        )


        print(
            f"Previous phone photo: {previous_photo}"
        )


        # -------------------------------------------------
        # OPEN NATIVE PHONE CAMERA
        # -------------------------------------------------

        self._run_adb(
            [
                "shell",
                "am",
                "start",
                "-a",
                "android.media.action.STILL_IMAGE_CAMERA",
            ]
        )


        print(
            "Phone camera opened"
        )


        # -------------------------------------------------
        # WAIT FOR CAMERA
        #
        # Allow autofocus / auto exposure / camera startup.
        # -------------------------------------------------

        time.sleep(
            PHONE_CAMERA_OPEN_DELAY
        )


        # -------------------------------------------------
        # TRIGGER CAMERA SHUTTER
        #
        # Android KEYCODE_CAMERA = 27
        # -------------------------------------------------

        self._run_adb(
            [
                "shell",
                "input",
                "keyevent",
                "27",
            ]
        )


        print(
            "Camera shutter triggered"
        )


        # -------------------------------------------------
        # WAIT UNTIL NEW JPG APPEARS
        # -------------------------------------------------

        started_at = (
            time.time()
        )


        new_photo = None


        while (
            time.time() - started_at
            < PHONE_CAMERA_SAVE_TIMEOUT
        ):

            # Wait before checking DCIM again
            time.sleep(
                1
            )


            current_photo = (
                self.get_latest_photo_name()
            )


            print(
                f"Checking latest photo: {current_photo}"
            )


            # -------------------------------------------------
            # NEW FILE FOUND
            # -------------------------------------------------

            if (
                current_photo
                and
                current_photo != previous_photo
            ):

                new_photo = (
                    current_photo
                )


                print(
                    f"New photo detected: {new_photo}"
                )


                break


        # -------------------------------------------------
        # NEW PHOTO NOT FOUND
        # -------------------------------------------------

        if not new_photo:

            current_photo = (
                self.get_latest_photo_name()
            )


            raise RuntimeError(
                "Phone shutter was triggered but "
                "a new JPG photo could not be detected. "
                f"Previous photo: {previous_photo}. "
                f"Current latest photo: {current_photo}."
            )


        # -------------------------------------------------
        # PHONE PHOTO PATH
        # -------------------------------------------------

        remote_path = (
            f"{PHONE_CAMERA_REMOTE_DIR}/"
            f"{new_photo}"
        )


        # -------------------------------------------------
        # CREATE UNIQUE LAPTOP FILE NAME
        # -------------------------------------------------

        unique_name = (
            f"phone_"
            f"{uuid.uuid4().hex}_"
            f"{new_photo}"
        )


        # -------------------------------------------------
        # LOCAL PATH
        # -------------------------------------------------

        local_path = (
            os.path.join(
                PHONE_CAPTURE_DIR,
                unique_name,
            )
        )


        print(
            f"Remote photo path: {remote_path}"
        )


        print(
            f"Local photo path: {local_path}"
        )


        # -------------------------------------------------
        # ADB PULL
        #
        # Copy ORIGINAL phone JPEG to laptop.
        #
        # No canvas.
        # No Camo.
        # No DroidCam.
        # No browser compression.
        # -------------------------------------------------

        print(
            f"Pulling original photo: {remote_path}"
        )


        self._run_adb(
            [
                "pull",
                remote_path,
                local_path,
            ],
            timeout=60,
        )


        # -------------------------------------------------
        # VERIFY LOCAL FILE
        # -------------------------------------------------

        if not os.path.exists(
            local_path
        ):

            raise RuntimeError(
                "Photo was detected but could not "
                "be copied to the laptop."
            )


        # -------------------------------------------------
        # FILE SIZE
        # -------------------------------------------------

        file_size = (
            os.path.getsize(
                local_path
            )
        )


        print(
            "Phone photo successfully copied."
        )


        print(
            f"Phone photo saved to: {local_path}"
        )


        print(
            f"Phone photo size: {file_size} bytes"
        )


        # -------------------------------------------------
        # CAPTURE RESPONSE
        # -------------------------------------------------

        return {
            "status":
                "success",

            "device_id":
                device_id,

            "phone_filename":
                new_photo,

            "remote_path":
                remote_path,

            "local_path":
                local_path,

            "file_size_bytes":
                file_size,
        }


    # =====================================================
    # CAPTURE PHONE PHOTO + RUN PHYSICAL AI
    # =====================================================

    def capture_and_analyze(
        self,
    ):

        # -------------------------------------------------
        # STEP 1
        # CAPTURE ORIGINAL PHONE PHOTO
        # -------------------------------------------------

        capture = (
            self.capture_photo()
        )


        # -------------------------------------------------
        # LOCAL ORIGINAL IMAGE PATH
        # -------------------------------------------------

        local_path = (
            capture[
                "local_path"
            ]
        )


        print(
            "Starting Physical AI analysis..."
        )


        # -------------------------------------------------
        # STEP 2
        # RUN EXISTING 3-MODEL PIPELINE
        #
        # Detector
        # Color Classifier
        # Shape Classifier
        # -------------------------------------------------

        ai_result = (
            predict_bean_image(
                local_path
            )
        )


        # -------------------------------------------------
        # ADD CAPTURE SOURCE
        # -------------------------------------------------

        ai_result[
            "capture_source"
        ] = "adb_phone_camera"


        # -------------------------------------------------
        # ORIGINAL PHONE FILE NAME
        # -------------------------------------------------

        ai_result[
            "original_phone_filename"
        ] = capture[
            "phone_filename"
        ]


        # -------------------------------------------------
        # ORIGINAL FILE SIZE
        # -------------------------------------------------

        ai_result[
            "original_phone_file_size_bytes"
        ] = capture[
            "file_size_bytes"
        ]


        print(
            "Physical AI analysis completed"
        )


        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        return {
            "status":
                "success",

            "capture":
                capture,

            "result":
                ai_result,
        }


# =========================================================
# GLOBAL SERVICE INSTANCE
# =========================================================

phone_camera_service = (
    PhoneCameraService()
)