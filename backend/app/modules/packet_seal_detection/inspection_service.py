# app/modules/packet_seal_detection/inspection_service.py

from datetime import datetime, timezone
import threading
import uuid


# ==================================================
# IN-MEMORY INSPECTION SESSION STORE
# ==================================================
# One "inspection" = ONE physical coffee packet going through
# BOTH checks:
#   1) Real-Time Two-Stage AI Seal / Overheat Inspection
#   2) Physical Arduino Leak Test
#
# Both results are attached to the SAME packet_id, so the backend
# always knows which AI result belongs to which leak test result.
# ==================================================

_lock = threading.Lock()

_inspections = {}          # packet_id -> inspection dict (insertion ordered)
_active_packet_id = None   # currently open session, or None


# ==================================================
# GENERATE UNIQUE PACKET ID
# ==================================================
def generate_packet_id():

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
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
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "RUNNING",
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
        return _inspections.get(_active_packet_id)


def get_active_packet_id():

    with _lock:
        return _active_packet_id


# ==================================================
# GET LAST SESSION (active OR most recently created)
# Used by the PDF report to show which packet the report is for,
# even after the session has been finalized.
# ==================================================
def get_last_inspection():

    with _lock:
        if not _inspections:
            return None

        last_key = next(reversed(_inspections))
        return _inspections[last_key]


# ==================================================
# GET SPECIFIC SESSION
# ==================================================
def get_inspection(packet_id):

    with _lock:
        return _inspections.get(packet_id)


def get_current_inspection(packet_id=None):
    """Backward compatible helper."""
    if packet_id:
        return get_inspection(packet_id)
    return get_active_inspection()


# ==================================================
# ATTACH VISION (AI) RESULT
# ==================================================
def update_vision_result(packet_id, result):

    with _lock:
        inspection = _inspections.get(packet_id)

        if inspection:
            inspection["vision_result"] = result


# ==================================================
# ATTACH LEAK TEST RESULT
# ==================================================
def update_leak_result(packet_id, result):

    with _lock:
        inspection = _inspections.get(packet_id)

        if inspection:
            inspection["leak_result"] = result


# ==================================================
# FINALIZE - COMBINE VISION + LEAK INTO ONE DECISION
# ==================================================
def finalize_inspection(packet_id):

    global _active_packet_id

    with _lock:
        inspection = _inspections.get(packet_id)

        if not inspection:
            return None

        vision = inspection.get("vision_result")
        leak = inspection.get("leak_result")

        if not vision or not leak:
            inspection["final_result"] = "INCOMPLETE"
            inspection["final_reason"] = (
                "Both real-time AI inspection and physical leak "
                "test must be completed before finalizing this packet."
            )
            return inspection

        overheat = bool(vision.get("overheat_detected", False))
        leak_status = str(leak.get("status", "")).upper()

        if overheat:
            decision = "REJECT"
            reason = "Overheat defect detected by the real-time AI inspection."

        elif leak_status == "LEAK":
            decision = "REJECT"
            reason = "Packet failed the physical leak detection test."

        elif (not overheat) and leak_status == "GOOD":
            decision = "PASS"
            reason = "No overheat defect detected and the leak test passed."

        else:
            decision = "REVIEW"
            reason = "Inspection results require manual review."

        inspection["final_result"] = decision
        inspection["final_reason"] = reason
        inspection["status"] = "COMPLETED"

        if _active_packet_id == packet_id:
            _active_packet_id = None

        return inspection


# ==================================================
# DROP ACTIVE SESSION WITHOUT FINALIZING
# ==================================================
def clear_active_inspection():

    global _active_packet_id

    with _lock:
        _active_packet_id = None