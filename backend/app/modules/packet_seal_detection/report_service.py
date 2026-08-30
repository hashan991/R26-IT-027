from pathlib import Path
from datetime import datetime
import threading
import uuid

import cv2

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
)

from app.modules.packet_seal_detection.leak_repository import save_leak_test
from app.modules.packet_seal_detection import inspection_service


# ==================================================
# PATH SETTINGS
# ==================================================

CURRENT_FILE = Path(__file__).resolve()

# project root:
# R26-IT-027/
PROJECT_ROOT = CURRENT_FILE.parents[4]

BACKEND_DIR = PROJECT_ROOT / "backend"

REPORT_DIR = (
    BACKEND_DIR
    / "app"
    / "static"
    / "reports"
)

EVIDENCE_DIR = REPORT_DIR / "evidence"

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

EVIDENCE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==================================================
# REPORT SERVICE
# ==================================================

class InspectionReportService:

    def __init__(self):

        self.latest_realtime_result = None
        self.latest_leak_result = None
        self.latest_annotated_frame = None

        self.lock = threading.Lock()


    # ==================================================
    # SAVE REAL-TIME AI RESULT
    # ==================================================

    def save_realtime_result(
        self,
        result,
        annotated_frame=None
    ):

        with self.lock:

            self.latest_realtime_result = result

            if annotated_frame is not None:

                self.latest_annotated_frame = (
                    annotated_frame.copy()
                )


    # ==================================================
    # SAVE PHYSICAL LEAK TEST RESULT
    # ==================================================

    def save_leak_result(
        self,
        result
    ):

        with self.lock:

            self.latest_leak_result = result.copy()

     # ==================================================
    # save_leak_history() function
    # ==================================================

        # ==================================================
    # SAVE LEAK HISTORY TO MONGODB
    # ==================================================

    def save_leak_history(
        self,
        result
    ):

        import asyncio

        try:

            asyncio.run(
                save_leak_test(result)
            )


        except Exception as error:

            print(
                "MongoDB history save error:",
                error
            )

    # ==================================================
    # GET CURRENT REPORT DATA
    # ==================================================

    def get_report_data(self):

        with self.lock:

            return {
                "realtime_result":
                    self.latest_realtime_result,

                "leak_result":
                    self.latest_leak_result,

                "has_annotated_frame":
                    self.latest_annotated_frame
                    is not None,
            }


    # ==================================================
    # CREATE REPORT ID
    # ==================================================

    def create_report_id(self):

        date_part = datetime.now().strftime(
            "%Y%m%d"
        )

        random_part = (
            uuid.uuid4()
            .hex[:6]
            .upper()
        )

        return (
            f"RPT-{date_part}-{random_part}"
        )


    # ==================================================
    # FORMAT CONFIDENCE
    # ==================================================

    def _confidence_percent(
        self,
        value
    ):

        try:

            value = float(value)

            if value <= 1:
                value = value * 100

            return f"{value:.1f}%"

        except Exception:

            return "-"


    # ==================================================
    # DETERMINE FINAL PACKET DECISION
    # ==================================================

    def determine_final_decision(
        self,
        realtime_result,
        leak_result
    ):

        if not realtime_result or not leak_result:

            return {
                "decision": "INCOMPLETE",
                "reason":
                    "Both real-time AI inspection and "
                    "physical leak test must be completed."
            }


        overheat_detected = bool(
            realtime_result.get(
                "overheat_detected",
                False
            )
        )


        leak_status = str(
            leak_result.get(
                "status",
                ""
            )
        ).upper()


        # ----------------------------------------------
        # REJECT
        # ----------------------------------------------

        if overheat_detected:

            return {
                "decision": "REJECT",
                "reason":
                    "Potential overheat defect was "
                    "detected by the real-time AI "
                    "inspection system."
            }


        if leak_status == "LEAK":

            return {
                "decision": "REJECT",
                "reason":
                    "The packet failed the physical "
                    "leak detection test."
            }


        # ----------------------------------------------
        # ACCEPT
        # ----------------------------------------------

        if (
            not overheat_detected
            and leak_status == "GOOD"
        ):

            return {
                "decision": "ACCEPT",
                "reason":
                    "No overheat defect was detected "
                    "during the real-time inspection "
                    "and the packet passed the physical "
                    "leak test."
            }


        # ----------------------------------------------
        # REVIEW
        # ----------------------------------------------

        return {
            "decision": "REVIEW",
            "reason":
                "The inspection results require "
                "manual review before making the "
                "final packaging decision."
        }


    # ==================================================
    # GET RECOMMENDATION
    # ==================================================

    def get_recommendation(
        self,
        realtime_result,
        leak_result
    ):

        overheat_detected = bool(
            realtime_result.get(
                "overheat_detected",
                False
            )
        )


        leak_status = str(
            leak_result.get(
                "status",
                ""
            )
        ).upper()


        recommendations = []


        if overheat_detected:

            recommendations.append(
                "Hold or reject the affected packet."
            )

            recommendations.append(
                "Inspect sealing temperature settings."
            )

            recommendations.append(
                "Verify sealing dwell time and heater condition."
            )

            recommendations.append(
                "Inspect subsequent packets from the same batch."
            )


        if leak_status == "LEAK":

            recommendations.append(
                "Reject the leaking packet."
            )

            recommendations.append(
                "Inspect sealing pressure and seal alignment."
            )

            recommendations.append(
                "Check the packaging material for damage."
            )


        if (
            not overheat_detected
            and leak_status == "GOOD"
        ):

            recommendations.append(
                "Packet passed the current automated "
                "quality checks."
            )

            recommendations.append(
                "Proceed according to the normal "
                "production quality-control process."
            )


        if not recommendations:

            recommendations.append(
                "Review the inspection data manually."
            )


        return recommendations


    # ==================================================
    # SAVE ANNOTATED REAL-TIME IMAGE
    # ==================================================

    def save_annotated_frame(
        self,
        report_id
    ):

        with self.lock:

            if self.latest_annotated_frame is None:
                return None

            frame = self.latest_annotated_frame.copy()


        image_path = (
            EVIDENCE_DIR
            / f"{report_id}_realtime.jpg"
        )


        success = cv2.imwrite(
            str(image_path),
            frame
        )


        if not success:
            return None


        return image_path


    # ==================================================
    # PDF PAGE NUMBER
    # ==================================================

    def _add_page_number(
        self,
        canvas,
        document
    ):

        canvas.saveState()

        page_number = canvas.getPageNumber()

        canvas.setFont(
            "Helvetica",
            8
        )

        canvas.drawCentredString(
            A4[0] / 2,
            10 * mm,
            f"Page {page_number}"
        )

        canvas.restoreState()


    # ==================================================
    # GENERATE FINAL PDF REPORT
    # ==================================================

    def generate_pdf_report(self):

        # ----------------------------------------------
        # COPY CURRENT RESULTS
        # ----------------------------------------------

        with self.lock:

            realtime_result = (
                self.latest_realtime_result.copy()
                if self.latest_realtime_result
                else None
            )

            leak_result = (
                self.latest_leak_result.copy()
                if self.latest_leak_result
                else None
            )


        # ----------------------------------------------
        # REQUIRE BOTH INSPECTIONS
        # ----------------------------------------------

        if realtime_result is None:

            raise ValueError(
                "Real-time AI inspection has not "
                "been completed yet."
            )


        if leak_result is None:

            raise ValueError(
                "Physical packet leak test has not "
                "been completed yet."
            )


        # ----------------------------------------------
        # REPORT INFORMATION
        # ----------------------------------------------

        report_id = self.create_report_id()

        now = datetime.now()

        pdf_filename = (
            f"Coffee_Packet_Inspection_"
            f"{report_id}.pdf"
        )

        pdf_path = (
            REPORT_DIR
            / pdf_filename
        )


        evidence_image_path = (
            self.save_annotated_frame(
                report_id
            )
        )


        final_decision = (
            self.determine_final_decision(
                realtime_result,
                leak_result
            )
        )


        recommendations = (
            self.get_recommendation(
                realtime_result,
                leak_result
            )
        )


        # ----------------------------------------------
        # RESOLVE WHICH PACKET THIS REPORT BELONGS TO
        # ----------------------------------------------
        # Prefer the packet_id already stamped onto the AI
        # result (set by realtime_service when the camera
        # session ran). Fall back to whichever inspection
        # session was created/updated most recently.
        # ----------------------------------------------

        last_inspection = inspection_service.get_last_inspection()

        packet_id_display = (
            realtime_result.get("packet_id")
            or (
                last_inspection["packet_id"]
                if last_inspection
                else None
            )
            or "N/A"
        )


        # ==================================================
        # CREATE PDF DOCUMENT
        # ==================================================

        document = SimpleDocTemplate(
            str(pdf_path),

            pagesize=A4,

            rightMargin=18 * mm,
            leftMargin=18 * mm,

            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )


        styles = getSampleStyleSheet()


        title_style = ParagraphStyle(
            "ReportTitle",

            parent=styles["Title"],

            fontName="Helvetica-Bold",

            fontSize=18,

            leading=22,

            alignment=TA_CENTER,

            spaceAfter=8,
        )


        subtitle_style = ParagraphStyle(
            "ReportSubtitle",

            parent=styles["Normal"],

            fontName="Helvetica",

            fontSize=9,

            alignment=TA_CENTER,

            textColor=colors.grey,

            spaceAfter=18,
        )


        section_style = ParagraphStyle(
            "SectionTitle",

            parent=styles["Heading2"],

            fontName="Helvetica-Bold",

            fontSize=12,

            leading=15,

            spaceBefore=8,

            spaceAfter=8,
        )


        normal_style = ParagraphStyle(
            "ReportNormal",

            parent=styles["BodyText"],

            fontName="Helvetica",

            fontSize=9,

            leading=13,
        )


        decision_style = ParagraphStyle(
            "Decision",

            parent=styles["Heading1"],

            fontName="Helvetica-Bold",

            fontSize=16,

            leading=20,

            alignment=TA_CENTER,

            spaceAfter=8,
        )


        story = []


        # ==================================================
        # TITLE
        # ==================================================

        story.append(
            Paragraph(
                "COFFEE PACKAGING QUALITY "
                "INSPECTION REPORT",
                title_style
            )
        )


        story.append(
            Paragraph(
                "Real-Time AI Seal Inspection "
                "and Physical Leak Detection",
                subtitle_style
            )
        )


        # ==================================================
        # REPORT INFORMATION
        # ==================================================

        story.append(
            Paragraph(
                "1. Report Information",
                section_style
            )
        )


        report_info = [

            [
                "Packet ID",
                packet_id_display
            ],

            [
                "Report ID",
                report_id
            ],

            [
                "Inspection Date",
                now.strftime("%d %B %Y")
            ],

            [
                "Inspection Time",
                now.strftime("%I:%M:%S %p")
            ],

            [
                "Inspection Module",
                "Packet Seal and Leak Quality Inspection"
            ],
        ]


        info_table = Table(
            report_info,
            colWidths=[
                48 * mm,
                112 * mm
            ]
        )


        info_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EAEAEA")
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTNAME",
                    (1, 0),
                    (1, -1),
                    "Helvetica"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
            ])
        )


        story.append(info_table)

        story.append(
            Spacer(
                1,
                6 * mm
            )
        )


        # ==================================================
        # OVERALL INSPECTION SUMMARY
        # ==================================================

        story.append(
            Paragraph(
                "2. Overall Inspection Summary",
                section_style
            )
        )


        realtime_status = realtime_result.get(
            "final_status",
            "UNKNOWN"
        )


        leak_status = leak_result.get(
            "status",
            "UNKNOWN"
        )


        summary_data = [

            [
                "Inspection",
                "Result"
            ],

            [
                "Real-Time AI Overheat Inspection",
                realtime_status
            ],

            [
                "Physical Packet Leak Test",
                leak_status
            ],

            [
                "Overall Quality Decision",
                final_decision["decision"]
            ],
        ]


        summary_table = Table(
            summary_data,
            colWidths=[
                105 * mm,
                55 * mm
            ]
        )


        summary_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#333333")
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),

                (
                    "FONTNAME",
                    (0, 1),
                    (-1, -1),
                    "Helvetica"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
            ])
        )


        story.append(summary_table)

        story.append(
            Spacer(
                1,
                7 * mm
            )
        )


        # ==================================================
        # FINAL DECISION
        # ==================================================

        story.append(
            Paragraph(
                "3. Final Quality Decision",
                section_style
            )
        )


        story.append(
            Paragraph(
                final_decision["decision"],
                decision_style
            )
        )


        story.append(
            Paragraph(
                final_decision["reason"],
                normal_style
            )
        )


        story.append(
            Spacer(
                1,
                6 * mm
            )
        )


        # ==================================================
        # REAL-TIME AI INSPECTION
        # ==================================================

        story.append(
            Paragraph(
                "4. Real-Time Two-Stage AI Inspection",
                section_style
            )
        )


        seal_count = realtime_result.get(
            "seal_count",
            0
        )


        overheat_detected = realtime_result.get(
            "overheat_detected",
            False
        )


        highest_overheat_confidence = (
            realtime_result.get(
                "highest_overheat_confidence",
                0
            )
        )


        realtime_summary = [

            [
                "Detected Seal Regions",
                str(seal_count)
            ],

            [
                "Overheat Detected",
                "YES"
                if overheat_detected
                else "NO"
            ],

            [
                "Highest Overheat Confidence",
                self._confidence_percent(
                    highest_overheat_confidence
                )
            ],

            [
                "AI Inspection Status",
                str(realtime_status)
            ],
        ]


        realtime_table = Table(
            realtime_summary,
            colWidths=[
                80 * mm,
                80 * mm
            ]
        )


        realtime_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F2F2F2")
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
            ])
        )


        story.append(realtime_table)

        story.append(
            Spacer(
                1,
                5 * mm
            )
        )


        # ==================================================
        # SEAL-BY-SEAL RESULTS
        # ==================================================

        seals = realtime_result.get(
            "seals",
            []
        )


        if seals:

            story.append(
                Paragraph(
                    "Seal-by-Seal Results",
                    styles["Heading3"]
                )
            )


            seal_rows = [

                [
                    "Seal",
                    "Seal Confidence",
                    "Overheat",
                    "Overheat Confidence"
                ]
            ]


            for index, seal in enumerate(
                seals,
                start=1
            ):

                seal_confidence = seal.get(
                    "seal_confidence",
                    seal.get(
                        "confidence",
                        0
                    )
                )


                seal_overheat = seal.get(
                    "overheat_detected",
                    False
                )


                overheat_confidence = seal.get(
                    "overheat_confidence",
                    seal.get(
                        "highest_overheat_confidence",
                        0
                    )
                )


                seal_rows.append([

                    f"Seal {index}",

                    self._confidence_percent(
                        seal_confidence
                    ),

                    (
                        "YES"
                        if seal_overheat
                        else "NO"
                    ),

                    (
                        self._confidence_percent(
                            overheat_confidence
                        )
                        if seal_overheat
                        else "-"
                    )
                ])


            seal_table = Table(
                seal_rows,
                colWidths=[
                    28 * mm,
                    45 * mm,
                    35 * mm,
                    52 * mm
                ]
            )


            seal_table.setStyle(
                TableStyle([

                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#333333")
                    ),

                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),

                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),

                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8
                    ),

                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey
                    ),

                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),

                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER"
                    ),

                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),

                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                ])
            )


            story.append(seal_table)

            story.append(
                Spacer(
                    1,
                    5 * mm
                )
            )


        # ==================================================
        # ANNOTATED REAL-TIME IMAGE
        # ==================================================

        if (
            evidence_image_path
            and evidence_image_path.exists()
        ):

            story.append(
                Paragraph(
                    "Real-Time Inspection Evidence",
                    styles["Heading3"]
                )
            )


            report_image = Image(
                str(evidence_image_path)
            )


            max_width = 160 * mm
            max_height = 95 * mm


            width_ratio = (
                max_width
                / report_image.imageWidth
            )

            height_ratio = (
                max_height
                / report_image.imageHeight
            )

            scale = min(
                width_ratio,
                height_ratio
            )


            report_image.drawWidth = (
                report_image.imageWidth
                * scale
            )

            report_image.drawHeight = (
                report_image.imageHeight
                * scale
            )


            story.append(report_image)

            story.append(
                Spacer(
                    1,
                    5 * mm
                )
            )


        # ==================================================
        # NEW PAGE - LEAK INSPECTION
        # ==================================================

        story.append(
            PageBreak()
        )


        story.append(
            Paragraph(
                "5. Physical Packet Leak Detection",
                section_style
            )
        )


        leak_summary = [

            [
                "Leak Test Result",
                str(
                    leak_result.get(
                        "status",
                        "-"
                    )
                )
            ],

            [
                "Initial Value",
                str(
                    leak_result.get(
                        "initial_value",
                        "-"
                    )
                )
            ],

            [
                "Average Value",
                str(
                    leak_result.get(
                        "average",
                        "-"
                    )
                )
            ],

            [
                "Threshold",
                str(
                    leak_result.get(
                        "threshold",
                        "-"
                    )
                )
            ],

            [
                "Minimum",
                str(
                    leak_result.get(
                        "minimum",
                        "-"
                    )
                )
            ],

            [
                "Maximum",
                str(
                    leak_result.get(
                        "maximum",
                        "-"
                    )
                )
            ],

            [
                "Range",
                str(
                    leak_result.get(
                        "range",
                        "-"
                    )
                )
            ],

            [
                "Reading Count",
                str(
                    leak_result.get(
                        "reading_count",
                        len(
                            leak_result.get(
                                "readings",
                                []
                            )
                        )
                    )
                )
            ],

            [
                "Final Device Status",
                str(
                    leak_result.get(
                        "device_status",
                        "-"
                    )
                )
            ],
        ]


        leak_table = Table(
            leak_summary,
            colWidths=[
                75 * mm,
                85 * mm
            ]
        )


        leak_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F2F2F2")
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
            ])
        )


        story.append(leak_table)

        story.append(
            Spacer(
                1,
                6 * mm
            )
        )


        # ==================================================
        # RAW LOAD-CELL READINGS
        # ==================================================

        readings = leak_result.get(
            "readings",
            []
        )


        if readings:

            story.append(
                Paragraph(
                    "Load Cell Readings",
                    styles["Heading3"]
                )
            )


            reading_rows = [

                [
                    "Reading Number",
                    "Sensor Value"
                ]
            ]


            for index, reading in enumerate(
                readings,
                start=1
            ):

                reading_rows.append([

                    str(index),

                    str(reading)
                ])


            readings_table = Table(
                reading_rows,
                colWidths=[
                    65 * mm,
                    65 * mm
                ]
            )


            readings_table.setStyle(
                TableStyle([

                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#333333")
                    ),

                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),

                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),

                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8
                    ),

                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey
                    ),

                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER"
                    ),

                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        4
                    ),

                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        4
                    ),
                ])
            )


            story.append(readings_table)

            story.append(
                Spacer(
                    1,
                    7 * mm
                )
            )


        # ==================================================
        # RECOMMENDED ACTION
        # ==================================================

        story.append(
            Paragraph(
                "6. Recommended Action",
                section_style
            )
        )


        for recommendation in recommendations:

            story.append(
                Paragraph(
                    f"- {recommendation}",
                    normal_style
                )
            )


        story.append(
            Spacer(
                1,
                6 * mm
            )
        )


        # ==================================================
        # SYSTEM INFORMATION
        # ==================================================

        story.append(
            Paragraph(
                "7. Inspection System Information",
                section_style
            )
        )


        system_data = [

            [
                "AI Stage 1",
                "Seal Region Object Detection"
            ],

            [
                "AI Stage 2",
                "Overheat Defect Object Detection"
            ],

            [
                "Camera",
                "IP Webcam Real-Time Video"
            ],

            [
                "Physical Controller",
                "Arduino Uno"
            ],

            [
                "Force Measurement",
                "HX711 Load Cell System"
            ],

            [
                "Mechanical Test",
                "Motorized Packet Pressure Mechanism"
            ],

            [
                "Safety / Position Control",
                "Top and Bottom Limit Switches"
            ],
        ]


        system_table = Table(
            system_data,
            colWidths=[
                55 * mm,
                105 * mm
            ]
        )


        system_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F2F2F2")
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
            ])
        )


        story.append(system_table)


        story.append(
            Spacer(
                1,
                8 * mm
            )
        )


        story.append(
            Paragraph(
                "This report was generated automatically "
                "using the coffee packet quality inspection system.",
                subtitle_style
            )
        )


        # ==================================================
        # BUILD PDF
        # ==================================================

        document.build(
            story,

            onFirstPage=self._add_page_number,

            onLaterPages=self._add_page_number,
        )


        # ==================================================
        # FINALIZE INSPECTION SESSION (IF STILL OPEN)
        # ==================================================
        # Once the report is generated, close out the packet's
        # inspection session so a new "Start New Inspection"
        # is required for the next physical packet.
        # ==================================================

        if packet_id_display and packet_id_display != "N/A":

            try:
                inspection_service.finalize_inspection(
                    packet_id_display
                )

            except Exception as error:
                print(
                    "Inspection finalize warning:",
                    error
                )


        # ==================================================
        # RETURN REPORT DETAILS
        # ==================================================

        return {

            "success": True,

            "report_id": report_id,

            "packet_id": packet_id_display,

            "filename": pdf_filename,

            "file_path": str(pdf_path),

            "download_url":
                f"/static/reports/{pdf_filename}",

            "final_decision":
                final_decision["decision"],

            "reason":
                final_decision["reason"],
        }


# ==================================================
# REPORT SERVICE INSTANCE
# ==================================================

report_service = InspectionReportService()