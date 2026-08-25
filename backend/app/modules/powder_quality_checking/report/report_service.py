import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors


REPORT_DIR = os.path.join(
    "app",
    "static",
    "reports",
    "powder",
)

os.makedirs(
    REPORT_DIR,
    exist_ok=True,
)


def generate_powder_pdf(batch_data: dict):
    batch = batch_data.get("batch", {})
    latest = batch_data.get("latest_reading") or {}

    sensor = latest.get("sensor_data", {})
    analysis = latest.get("analysis", {})
    recommendation = analysis.get(
        "recommendation",
        {},
    )

    batch_id = batch.get(
        "batch_id",
        "UNKNOWN",
    )

    filename = (
        f"Powder_Quality_Report_{batch_id}.pdf"
    )

    file_path = os.path.join(
        REPORT_DIR,
        filename,
    )

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    elements = []

    # ========================================================
    # TITLE
    # ========================================================

    elements.append(
        Paragraph(
            "Smart Coffee Manufacturing",
            styles["Title"],
        )
    )

    elements.append(
        Paragraph(
            "Coffee Powder Quality Evaluation Report",
            styles["Heading2"],
        )
    )

    elements.append(
        Spacer(1, 15)
    )

    # ========================================================
    # BATCH INFORMATION
    # ========================================================

    elements.append(
        Paragraph(
            "Batch Information",
            styles["Heading2"],
        )
    )

    batch_table = Table(
        [
            ["Batch ID", batch_id],
            [
                "Batch Status",
                batch.get("status", "-"),
            ],
            [
                "Inspection Time",
                str(
                    latest.get(
                        "created_at",
                        "-",
                    )
                ),
            ],
        ],
        colWidths=[
            55 * mm,
            110 * mm,
        ],
    )

    batch_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(batch_table)
    elements.append(Spacer(1, 18))

    # ========================================================
    # FINAL AI DECISION
    # ========================================================

    elements.append(
        Paragraph(
            "AI Quality Decision",
            styles["Heading2"],
        )
    )

    decision_table = Table(
        [
            [
                "Decision",
                analysis.get(
                    "decision",
                    "-",
                ),
            ],
            [
                "Release Status",
                analysis.get(
                    "release_status",
                    "-",
                ),
            ],
            [
                "Risk Level",
                analysis.get(
                    "risk_level",
                    "-",
                ),
            ],
            [
                "Quality Score",
                analysis.get(
                    "quality_score",
                    0,
                ),
            ],
            [
                "Confidence",
                (
                    f"{analysis.get('confidence', 0)}%"
                ),
            ],
        ],
        colWidths=[
            55 * mm,
            110 * mm,
        ],
    )

    decision_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(decision_table)
    elements.append(Spacer(1, 18))

    # ========================================================
    # SENSOR VALUES
    # ========================================================

    elements.append(
        Paragraph(
            "Sensor Measurements",
            styles["Heading2"],
        )
    )

    sensor_table = Table(
        [
            [
                "Moisture",
                sensor.get(
                    "moisture",
                    "-",
                ),
            ],
            [
                "Temperature",
                sensor.get(
                    "temperature",
                    "-",
                ),
            ],
            [
                "Humidity",
                sensor.get(
                    "humidity",
                    "-",
                ),
            ],
            [
                "Red",
                sensor.get(
                    "red",
                    "-",
                ),
            ],
            [
                "Green",
                sensor.get(
                    "green",
                    "-",
                ),
            ],
            [
                "Blue",
                sensor.get(
                    "blue",
                    "-",
                ),
            ],
        ],
        colWidths=[
            55 * mm,
            110 * mm,
        ],
    )

    sensor_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(sensor_table)
    elements.append(Spacer(1, 18))

    # ========================================================
    # ISSUES
    # ========================================================

    elements.append(
        Paragraph(
            "Detected Quality Issues",
            styles["Heading2"],
        )
    )

    issues = analysis.get(
        "issues",
        [],
    )

    if issues:
        for issue in issues:
            elements.append(
                Paragraph(
                    f"• {issue}",
                    styles["BodyText"],
                )
            )
    else:
        elements.append(
            Paragraph(
                "No critical quality issues detected.",
                styles["BodyText"],
            )
        )

    elements.append(Spacer(1, 15))

    # ========================================================
    # ROOT CAUSES
    # ========================================================

    elements.append(
        Paragraph(
            "AI Root Cause Analysis",
            styles["Heading2"],
        )
    )

    root_causes = analysis.get(
        "root_cause",
        [],
    )

    for cause in root_causes:
        elements.append(
            Paragraph(
                f"• {cause}",
                styles["BodyText"],
            )
        )

    elements.append(Spacer(1, 15))

    # ========================================================
    # RECOMMENDED ACTIONS
    # ========================================================

    elements.append(
        Paragraph(
            "Recommended Actions",
            styles["Heading2"],
        )
    )

    actions = analysis.get(
        "recommended_actions",
        [],
    )

    for action in actions:
        elements.append(
            Paragraph(
                f"• {action}",
                styles["BodyText"],
            )
        )

    elements.append(Spacer(1, 15))

    # ========================================================
    # NEXT ACTION
    # ========================================================

    elements.append(
        Paragraph(
            "Next Action",
            styles["Heading2"],
        )
    )

    elements.append(
        Paragraph(
            str(
                analysis.get(
                    "next_action",
                    "-",
                )
            ),
            styles["BodyText"],
        )
    )

    elements.append(Spacer(1, 15))

    # ========================================================
    # RECOVERY INFORMATION
    # ========================================================

    elements.append(
        Paragraph(
            "Recovery Information",
            styles["Heading2"],
        )
    )

    recovery_table = Table(
        [
            [
                "Recovery Possible",
                recommendation.get(
                    "recovery_possible",
                    "-",
                ),
            ],
            [
                "Recovery Probability",
                (
                    f"{recommendation.get('recovery_probability', 0)}%"
                ),
            ],
            [
                "Expected Outcome",
                recommendation.get(
                    "expected_outcome",
                    "-",
                ),
            ],
        ],
        colWidths=[
            55 * mm,
            110 * mm,
        ],
    )

    recovery_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(recovery_table)

    elements.append(
        Spacer(1, 25)
    )

    elements.append(
        Paragraph(
            (
                "Generated by Smart Coffee Manufacturing "
                "AI Quality Control System"
            ),
            styles["Italic"],
        )
    )

    elements.append(
        Paragraph(
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            styles["Italic"],
        )
    )

    doc.build(elements)

    return file_path