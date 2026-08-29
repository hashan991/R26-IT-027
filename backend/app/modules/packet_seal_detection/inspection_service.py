# app/modules/packet_seal_detection/inspection_service.py

from datetime import datetime, timezone
import threading
import uuid


# ==================================================
# INSPECTION WORKFLOW STATES
# ==================================================

IDLE = "IDLE"

CAMERA_PENDING = "CAMERA_PENDING"

CAMERA_COMPLETED = "CAMERA_COMPLETED"

LEAK_PENDING = "LEAK_PENDING"

LEAK_COMPLETED = "LEAK_COMPLETED"

REPORT_READY = "REPORT_READY"

COMPLETED = "COMPLETED"


# ==================================================
# IN-MEMORY INSPECTION SESSION STORE
# ==================================================

_lock = threading.Lock()

_inspections = {}

_active_packet_id = None


# ==================================================
# GENERATE UNIQUE PACKET ID
# ==================================================

def generate_packet_id():

    timestamp = datetime.now().strftime(
        "%Y%m%d%H%M%S"
    )

    unique = uuid.uuid4().hex[:4].upper()

    return f"PKT-{timestamp}-{unique}"


# ==================================================
# START NEW INSPECTION SESSION
# ==================================================

def start_inspection():

    global _active_packet_id

    packet_id = generate_packet_id()

    inspection = {

        "packet_id": packet_id,

        "created_at":
            datetime.now(timezone.utc).isoformat(),

        # ------------------------------------------
        # WORKFLOW STATE
        # ------------------------------------------

        "workflow_state": CAMERA_PENDING,

        "status": "RUNNING",

        # ------------------------------------------
        # INSPECTION RESULTS
        # ------------------------------------------

        "vision_result": None,

        "leak_result": None,

        "final_result": None,

        "final_reason": None,
    }

    with _lock:

        _inspections[packet_id] = inspection

        _active_packet_id = packet_id

    return inspection


# ==================================================
# GET ACTIVE SESSION
# ==================================================

def get_active_inspection():

    with _lock:

        if _active_packet_id is None:

            return None

        return _inspections.get(
            _active_packet_id
        )


# ==================================================
# GET ACTIVE PACKET ID
# ==================================================

def get_active_packet_id():

    with _lock:

        return _active_packet_id


# ==================================================
# GET LAST INSPECTION
# ==================================================

def get_last_inspection():

    with _lock:

        if not _inspections:

            return None

        last_key = next(
            reversed(_inspections)
        )

        return _inspections[last_key]


# ==================================================
# GET SPECIFIC INSPECTION
# ==================================================

def get_inspection(packet_id):

    with _lock:

        return _inspections.get(
            packet_id
        )


# ==================================================
# BACKWARD COMPATIBLE HELPER
# ==================================================

def get_current_inspection(
    packet_id=None
):

    if packet_id:

        return get_inspection(
            packet_id
        )

    return get_active_inspection()


# ==================================================
# ATTACH VISION / AI RESULT
# ==================================================

def update_vision_result(
    packet_id,
    result
):

    with _lock:

        inspection = _inspections.get(
            packet_id
        )

        if not inspection:

            return False

        inspection["vision_result"] = result

        # ------------------------------------------
        # MOVE TO LEAK STEP
        # ------------------------------------------

        inspection["workflow_state"] = (
            LEAK_PENDING
        )

        return True


# ==================================================
# ATTACH LEAK RESULT
# ==================================================

def update_leak_result(
    packet_id,
    result
):

    with _lock:

        inspection = _inspections.get(
            packet_id
        )

        if not inspection:

            return False

        inspection["leak_result"] = result

        # ------------------------------------------
        # MOVE TO REPORT STEP
        # ------------------------------------------

        if inspection.get(
            "vision_result"
        ):

            inspection["workflow_state"] = (
                REPORT_READY
            )

        else:

            inspection["workflow_state"] = (
                LEAK_COMPLETED
            )

        return True


# ==================================================
# MARK CAMERA STEP COMPLETE
# ==================================================

def complete_camera_step(
    packet_id
):

    with _lock:

        inspection = _inspections.get(
            packet_id
        )

        if not inspection:

            return False

        if not inspection.get(
            "vision_result"
        ):

            return False

        inspection["workflow_state"] = (
            LEAK_PENDING
        )

        return True


# ==================================================
# MARK LEAK STEP COMPLETE
# ==================================================

def complete_leak_step(
    packet_id
):

    with _lock:

        inspection = _inspections.get(
            packet_id
        )

        if not inspection:

            return False

        if not inspection.get(
            "leak_result"
        ):

            return False

        if not inspection.get(
            "vision_result"
        ):

            return False

        inspection["workflow_state"] = (
            REPORT_READY
        )

        return True


# ==================================================
# CHECK WHETHER CAMERA CAN RUN
# ==================================================

def can_run_camera():

    inspection = get_active_inspection()

    if not inspection:

        # No guided inspection.
        # Independent camera inspection allowed.
        return True

    return (
        inspection.get(
            "workflow_state"
        )
        == CAMERA_PENDING
    )


# ==================================================
# CHECK WHETHER LEAK TEST CAN RUN
# ==================================================

def can_run_leak_test():

    inspection = get_active_inspection()

    if not inspection:

        # No guided inspection.
        # Independent leak test allowed.
        return True

    return (
        inspection.get(
            "workflow_state"
        )
        == LEAK_PENDING
    )


# ==================================================
# CHECK WHETHER REPORT CAN BE GENERATED
# ==================================================

def can_generate_report():

    inspection = get_active_inspection()

    if not inspection:

        return False

    return (
        inspection.get(
            "workflow_state"
        )
        == REPORT_READY
    )


# ==================================================
# FINALIZE INSPECTION
# ==================================================

def finalize_inspection(
    packet_id
):

    global _active_packet_id

    with _lock:

        inspection = _inspections.get(
            packet_id
        )

        if not inspection:

            return None

        vision = inspection.get(
            "vision_result"
        )

        leak = inspection.get(
            "leak_result"
        )

        # ------------------------------------------
        # BOTH RESULTS REQUIRED
        # ------------------------------------------

        if not vision or not leak:

            inspection["final_result"] = (
                "INCOMPLETE"
            )

            inspection["final_reason"] = (
                "Both real-time AI inspection "
                "and physical leak test must be "
                "completed before finalizing "
                "this packet."
            )

            return inspection

        # ------------------------------------------
        # AI RESULT
        # ------------------------------------------

        overheat = bool(
            vision.get(
                "overheat_detected",
                False
            )
        )

        # ------------------------------------------
        # LEAK RESULT
        # ------------------------------------------

        leak_status = str(
            leak.get(
                "status",
                ""
            )
        ).upper()

        # ------------------------------------------
        # FINAL DECISION
        # ------------------------------------------

        if overheat:

            decision = "REJECT"

            reason = (
                "Overheat defect detected by "
                "the real-time AI inspection."
            )

        elif leak_status == "LEAK":

            decision = "REJECT"

            reason = (
                "Packet failed the physical "
                "leak detection test."
            )

        elif (
            not overheat
            and leak_status == "GOOD"
        ):

            decision = "PASS"

            reason = (
                "No overheat defect detected "
                "and the leak test passed."
            )

        else:

            decision = "REVIEW"

            reason = (
                "Inspection results require "
                "manual review."
            )

        # ------------------------------------------
        # SAVE FINAL RESULT
        # ------------------------------------------

        inspection["final_result"] = decision

        inspection["final_reason"] = reason

        inspection["workflow_state"] = (
            COMPLETED
        )

        inspection["status"] = (
            "COMPLETED"
        )

        # ------------------------------------------
        # CLOSE ACTIVE SESSION
        # ------------------------------------------

        if _active_packet_id == packet_id:

            _active_packet_id = None

        return inspection


# ==================================================
# CLEAR ACTIVE INSPECTION
# ==================================================

def clear_active_inspection():

    global _active_packet_id

    with _lock:

        _active_packet_id = None