import os
import io

from datetime import datetime


from reportlab.lib import colors

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

    KeepTogether,

)


from reportlab.graphics.shapes import Drawing

from reportlab.graphics.charts.barcharts import VerticalBarChart

from reportlab.graphics.charts.linecharts import HorizontalLineChart


from reportlab.pdfbase.pdfmetrics import stringWidth



# ============================================================
# REPORT DIRECTORY
# ============================================================


REPORT_DIR = os.path.join(

    "app",

    "static",

    "reports",

    "powder",

)


os.makedirs(

    REPORT_DIR,

    exist_ok=True

)



# ============================================================
# COFFEE SENSE AI THEMES
# ============================================================


THEMES = {


    "PASS": {

        "primary": colors.HexColor("#16A34A"),

        "secondary": colors.HexColor("#DCFCE7"),

        "text": colors.HexColor("#14532D"),

        "title": "PACKAGING READY"

    },


    "WARN": {

        "primary": colors.HexColor("#F59E0B"),

        "secondary": colors.HexColor("#FEF3C7"),

        "text": colors.HexColor("#78350F"),

        "title": "QUALITY REVIEW"

    },


    "HOLD": {

        "primary": colors.HexColor("#DC2626"),

        "secondary": colors.HexColor("#FEE2E2"),

        "text": colors.HexColor("#7F1D1D"),

        "title": "RELEASE BLOCKED"

    }

}




# ============================================================
# STYLE ENGINE
# ============================================================


def get_styles():


    styles = getSampleStyleSheet()



    styles.add(

        ParagraphStyle(

            name="AIHeader",

            parent=styles["Heading1"],

            fontSize=24,

            leading=28,

            alignment=1,

            textColor=colors.HexColor("#1F2937")

        )

    )



    styles.add(

        ParagraphStyle(

            name="SectionTitle",

            parent=styles["Heading2"],

            fontSize=16,

            spaceAfter=10,

            textColor=colors.HexColor("#111827")

        )

    )



    styles.add(

        ParagraphStyle(

            name="CardText",

            parent=styles["BodyText"],

            fontSize=10,

            leading=14

        )

    )


    return styles






# ============================================================
# KPI CARD GENERATOR
# ============================================================


def create_kpi_card(

    title,

    value,

    theme

):


    table = Table(

        [

            [

                Paragraph(

                    f"<b>{title}</b><br/><font size='18'>{value}</font>",

                    get_styles()["CardText"]

                )

            ]

        ],

        colWidths=[55 * mm]

    )


    table.setStyle(

        TableStyle(

            [

                (

                    "BACKGROUND",

                    (0,0),

                    (-1,-1),

                    theme["secondary"]

                ),

                (

                    "BOX",

                    (0,0),

                    (-1,-1),

                    1,

                    theme["primary"]

                ),

                (

                    "PADDING",

                    (0,0),

                    (-1,-1),

                    12

                ),

            ]

        )

    )


    return table





# ============================================================
# AI DECISION HERO
# ============================================================


def create_decision_card(

    decision,

    confidence,

    theme

):


    content = [

        [

            Paragraph(

                f"""

                <font size="24">

                <b>{theme['title']}</b>

                </font>

                <br/>

                AI Decision:

                <b>{decision}</b>

                <br/>

                AI Confidence:

                <b>{confidence}%</b>

                """,

                get_styles()["CardText"]

            )

        ]

    ]



    card = Table(

        content,

        colWidths=[160*mm]

    )



    card.setStyle(

        TableStyle(

            [

                (

                    "BACKGROUND",

                    (0,0),

                    (-1,-1),

                    theme["secondary"]

                ),


                (

                    "BOX",

                    (0,0),

                    (-1,-1),

                    2,

                    theme["primary"]

                ),


                (

                    "PADDING",

                    (0,0),

                    (-1,-1),

                    18

                )

            ]

        )

    )


    return card






# ============================================================
# SENSOR CHART GENERATOR
# ============================================================


def create_sensor_chart(sensor):


    drawing = Drawing(

        400,

        200

    )


    chart = VerticalBarChart()



    chart.x = 50

    chart.y = 40

    chart.height = 120

    chart.width = 280



    chart.data = [

        [

            float(sensor.get("moisture",0)),

            float(sensor.get("temperature",0)),

            float(sensor.get("humidity",0))

        ]

    ]



    chart.categoryAxis.categoryNames = [

        "Moisture",

        "Temperature",

        "Humidity"

    ]



    chart.valueAxis.valueMin = 0



    drawing.add(chart)



    return drawing





# ============================================================
# RGB VISUALIZATION
# ============================================================


def create_rgb_chart(sensor):


    drawing = Drawing(

        400,

        180

    )


    chart = VerticalBarChart()


    chart.x = 50

    chart.y = 40

    chart.height = 100

    chart.width = 280



    chart.data = [

        [

            float(sensor.get("red",0)),

            float(sensor.get("green",0)),

            float(sensor.get("blue",0))

        ]

    ]


    chart.categoryAxis.categoryNames = [

        "RED",

        "GREEN",

        "BLUE"

    ]


    drawing.add(chart)


    return drawing




# ============================================================
# MAIN PDF GENERATOR
# ============================================================


def generate_powder_pdf(batch_data: dict):


    batch = batch_data.get(
        "batch",
        {}
    )


    latest = batch_data.get(
        "latest_reading",
    ) or {}


    sensor = latest.get(
        "sensor_data",
        {}
    )


    analysis = latest.get(
        "analysis",
        {}
    )


    recommendation = analysis.get(
        "recommendation",
        {}
    )



    decision = str(
        analysis.get(
            "decision",
            "WARN"
        )
    ).upper()



    theme = THEMES.get(
        decision,
        THEMES["WARN"]
    )



    batch_id = batch.get(
        "batch_id",
        "UNKNOWN"
    )



    filename = (
        f"CoffeeSense_AI_Report_{batch_id}.pdf"
    )



    file_path = os.path.join(

        REPORT_DIR,

        filename

    )



    doc = SimpleDocTemplate(

        file_path,

        pagesize=A4,

        rightMargin=15*mm,

        leftMargin=15*mm,

        topMargin=15*mm,

        bottomMargin=15*mm

    )



    styles = get_styles()



    elements = []



    # ========================================================
    # COVER HEADER
    # ========================================================


    elements.append(

        Paragraph(

            "☕ CoffeeSense AI™",

            styles["AIHeader"]

        )

    )


    elements.append(

        Paragraph(

            "Industrial Coffee Quality Intelligence Report",

            styles["SectionTitle"]

        )

    )


    elements.append(

        Spacer(
            1,
            15
        )

    )



    # ========================================================
    # AI DECISION HERO
    # ========================================================


    elements.append(

        create_decision_card(

            decision,

            analysis.get(
                "confidence",
                0
            ),

            theme

        )

    )



    elements.append(

        Spacer(
            1,
            20
        )

    )



    # ========================================================
    # KPI DASHBOARD
    # ========================================================


    kpi_table = Table(

        [

            [

                create_kpi_card(

                    "QUALITY SCORE",

                    f"{analysis.get('quality_score',0)}%",

                    theme

                ),


                create_kpi_card(

                    "AI CONFIDENCE",

                    f"{analysis.get('confidence',0)}%",

                    theme

                ),


                create_kpi_card(

                    "RISK LEVEL",

                    recommendation.get(

                        "risk_level",

                        "-"

                    ),

                    theme

                )

            ]

        ],

        colWidths=[

            58*mm,

            58*mm,

            58*mm

        ]

    )


    elements.append(

        kpi_table

    )


    elements.append(

        Spacer(
            1,
            20
        )

    )



    # ========================================================
    # BATCH INFORMATION
    # ========================================================


    elements.append(

        Paragraph(

            "Batch Intelligence",

            styles["SectionTitle"]

        )

    )


    batch_table = Table(

        [

            [

                "Batch ID",

                batch_id

            ],


            [

                "Inspection Time",

                str(

                    latest.get(

                        "created_at",

                        "-"

                    )

                )

            ],


            [

                "Release Status",

                recommendation.get(

                    "release_status",

                    "-"

                )

            ]

        ],

        colWidths=[

            55*mm,

            105*mm

        ]

    )


    batch_table.setStyle(

        TableStyle(

            [

                (

                    "GRID",

                    (0,0),

                    (-1,-1),

                    0.5,

                    colors.grey

                ),

                (

                    "BACKGROUND",

                    (0,0),

                    (0,-1),

                    theme["secondary"]

                ),

                (

                    "PADDING",

                    (0,0),

                    (-1,-1),

                    8

                )

            ]

        )

    )


    elements.append(

        batch_table

    )


    elements.append(

        Spacer(
            1,
            20
        )

    )



    # ========================================================
    # SENSOR INTELLIGENCE
    # ========================================================


    elements.append(

        Paragraph(

            "Sensor Intelligence Dashboard",

            styles["SectionTitle"]

        )

    )


    sensor_table = Table(

        [

            [

                "Moisture",

                sensor.get(
                    "moisture",
                    "-"
                )

            ],

            [

                "Temperature",

                f"{sensor.get('temperature','-')} °C"

            ],

            [

                "Humidity",

                f"{sensor.get('humidity','-')} %"

            ]

        ],

        colWidths=[

            70*mm,

            90*mm

        ]

    )


    sensor_table.setStyle(

        TableStyle(

            [

                (

                    "GRID",

                    (0,0),

                    (-1,-1),

                    0.5,

                    colors.grey

                ),

                (

                    "PADDING",

                    (0,0),

                    (-1,-1),

                    8

                )

            ]

        )

    )


    elements.append(

        sensor_table

    )


    elements.append(

        Spacer(
            1,
            15
        )

    )



    elements.append(

        create_sensor_chart(

            sensor

        )

    )



    elements.append(

        PageBreak()

    )



    # ========================================================
    # AI ROOT CAUSE INTELLIGENCE
    # ========================================================


    elements.append(

        Paragraph(

            "🧠 AI Root Cause Intelligence",

            styles["SectionTitle"]

        )

    )



    root_causes = recommendation.get(

        "root_causes",

        []

    )



    if root_causes:


        for index, cause in enumerate(

            root_causes,

            start=1

        ):


            elements.append(

                Paragraph(

                    f"""

                    <b>Finding {index}</b><br/>

                    {cause}

                    """,

                    styles["CardText"]

                )

            )


            elements.append(

                Spacer(
                    1,
                    10
                )

            )


    else:


        elements.append(

            Paragraph(

                "No abnormal quality condition detected.",

                styles["CardText"]

            )

        )
        
        
        
        
        
            # ========================================================
    # RGB COFFEE COLOR INTELLIGENCE
    # ========================================================


    elements.append(

        Paragraph(

            "🎨 Coffee Color Intelligence",

            styles["SectionTitle"]

        )

    )


    elements.append(

        create_rgb_chart(

            sensor

        )

    )


    elements.append(

        Spacer(

            1,

            20

        )

    )



    # ========================================================
    # AI RECOVERY WORKFLOW
    # ========================================================


    elements.append(

        Paragraph(

            "🔄 AI Recovery Workflow",

            styles["SectionTitle"]

        )

    )


    actions = recommendation.get(

        "immediate_actions",

        []

    )



    if actions:


        recovery_data = []


        for action in actions:


            recovery_data.append(

                [

                    f"STEP {action.get('step','')}",

                    action.get(

                        "action",

                        "-"

                    ),

                    action.get(

                        "reason",

                        "-"

                    )

                ]

            )


        recovery_table = Table(

            [

                [

                    "STEP",

                    "ACTION",

                    "AI REASONING"

                ]

            ]

            +

            recovery_data,

            colWidths=[

                25*mm,

                55*mm,

                80*mm

            ]

        )


        recovery_table.setStyle(

            TableStyle(

                [

                    (

                        "BACKGROUND",

                        (0,0),

                        (-1,0),

                        theme["primary"]

                    ),


                    (

                        "TEXTCOLOR",

                        (0,0),

                        (-1,0),

                        colors.white

                    ),


                    (

                        "GRID",

                        (0,0),

                        (-1,-1),

                        0.5,

                        colors.grey

                    ),


                    (

                        "PADDING",

                        (0,0),

                        (-1,-1),

                        8

                    )

                ]

            )

        )


        elements.append(

            recovery_table

        )


    else:


        elements.append(

            Paragraph(

                "No corrective workflow required.",

                styles["CardText"]

            )

        )



    elements.append(

        Spacer(

            1,

            20

        )

    )




    # ========================================================
    # FUTURE PREVENTION STRATEGY
    # ========================================================


    elements.append(

        Paragraph(

            "🛡 Future Prevention Strategy",

            styles["SectionTitle"]

        )

    )


    prevention = recommendation.get(

        "future_prevention",

        []

    )



    prevention_rows = []



    for item in prevention:


        prevention_rows.append(

            [

                "✓",

                item

            ]

        )



    if prevention_rows:


        prevention_table = Table(

            prevention_rows,

            colWidths=[

                15*mm,

                140*mm

            ]

        )


        prevention_table.setStyle(

            TableStyle(

                [

                    (

                        "BACKGROUND",

                        (0,0),

                        (-1,-1),

                        theme["secondary"]

                    ),


                    (

                        "BOX",

                        (0,0),

                        (-1,-1),

                        1,

                        theme["primary"]

                    ),


                    (

                        "PADDING",

                        (0,0),

                        (-1,-1),

                        8

                    )

                ]

            )

        )


        elements.append(

            prevention_table

        )



    elements.append(

        PageBreak()

    )



    # ========================================================
    # AI CERTIFICATE PAGE
    # ========================================================



    certificate = Table(

        [

            [

                Paragraph(

                    """

                    <font size="22">

                    <b>☕ CoffeeSense AI™</b>

                    </font>

                    <br/><br/>

                    Industrial Coffee Quality Intelligence Certificate

                    <br/><br/>

                    Batch:

                    <b>{}</b>

                    <br/><br/>

                    Final Decision:

                    <b>{}</b>

                    <br/><br/>

                    Release Status:

                    <b>{}</b>

                    <br/><br/>

                    AI Confidence:

                    <b>{}%</b>

                    <br/><br/>

                    Verified by:

                    Smart Coffee Manufacturing AI Platform

                    """.format(

                        batch_id,

                        decision,

                        recommendation.get(

                            "release_status",

                            "-"

                        ),

                        analysis.get(

                            "confidence",

                            0

                        )

                    ),

                    styles["CardText"]

                )

            ]

        ],

        colWidths=[

            150*mm

        ]

    )



    certificate.setStyle(

        TableStyle(

            [

                (

                    "BACKGROUND",

                    (0,0),

                    (-1,-1),

                    theme["secondary"]

                ),


                (

                    "BOX",

                    (0,0),

                    (-1,-1),

                    3,

                    theme["primary"]

                ),


                (

                    "ALIGN",

                    (0,0),

                    (-1,-1),

                    "CENTER"

                ),


                (

                    "PADDING",

                    (0,0),

                    (-1,-1),

                    25

                )

            ]

        )

    )



    elements.append(

        certificate

    )



    elements.append(

        Spacer(

            1,

            20

        )

    )



    elements.append(

        Paragraph(

            """

            Generated by CoffeeSense AI™<br/>

            Industrial Coffee Quality Decision Support Platform<br/>

            AI Assisted Manufacturing Intelligence

            """,

            styles["CardText"]

        )

    )



    # ========================================================
    # BUILD PDF
    # ========================================================


    doc.build(

        elements

    )


    return file_path
