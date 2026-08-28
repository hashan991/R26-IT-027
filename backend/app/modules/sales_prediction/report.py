from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime

# ReportLab native vector charts (no external image dependency)
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.legends import Legend


# ---------------------------------------------------------------------------
# Shared palette
# ---------------------------------------------------------------------------
BROWN_DARK = colors.HexColor("#5A2D0C")
BROWN_MED = colors.HexColor("#7A3E12")
BROWN_LIGHT = colors.HexColor("#FDF5E6")
GRID_LINE = colors.HexColor("#D4C4A8")
ACCENT_GREEN = colors.HexColor("#2E7D32")
ACCENT_BLUE = colors.HexColor("#1976D2")
ACCENT_ORANGE = colors.HexColor("#F57C00")
ACCENT_RED = colors.HexColor("#D32F2F")

TABLE_STYLE_COMMANDS = [
    ('BACKGROUND', (0, 0), (-1, 0), BROWN_DARK),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 1), (-1, -1), BROWN_LIGHT),
    ('GRID', (0, 0), (-1, -1), 0.5, GRID_LINE),
    ('PADDING', (0, 0), (-1, -1), 6),
]


def styled_table(data, col_widths, body_bg=None):
    """Build a Table with the report's standard header/body styling."""
    t = Table(data, colWidths=col_widths)
    cmds = list(TABLE_STYLE_COMMANDS)
    if body_bg is not None:
        cmds.append(('BACKGROUND', (0, 1), (-1, -1), body_bg))
    t.setStyle(TableStyle(cmds))
    return t


# ---------------------------------------------------------------------------
# Chart builders
# ---------------------------------------------------------------------------
def build_sales_bar_chart(prev_sales, curr_sales, width=430, height=200):
    """Vertical bar chart comparing previous month sales vs current prediction."""
    drawing = Drawing(width, height)

    chart = VerticalBarChart()
    chart.x = 60
    chart.y = 40
    chart.width = width - 120
    chart.height = height - 70

    chart.data = [[prev_sales], [curr_sales]]
    chart.categoryAxis.categoryNames = ['Sales (units)']
    chart.categoryAxis.labels.fontSize = 9

    max_val = max(prev_sales, curr_sales, 1)
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max_val * 1.25
    chart.valueAxis.valueStep = max(1, round((max_val * 1.25) / 5))
    chart.valueAxis.labels.fontSize = 8

    chart.bars[0].fillColor = colors.HexColor("#B08968")
    chart.bars[1].fillColor = BROWN_DARK
    chart.barWidth = 18
    chart.groupSpacing = 20
    chart.barSpacing = 4

    drawing.add(chart)

    legend = Legend()
    legend.x = width - 115
    legend.y = height - 15
    legend.dx = 8
    legend.dy = 8
    legend.fontSize = 8
    legend.alignment = 'right'
    legend.colorNamePairs = [
        (colors.HexColor("#B08968"), 'Previous Month'),
        (BROWN_DARK, 'Current Prediction'),
    ]
    drawing.add(legend)

    title = String(width / 2, height - 12, "Previous vs. Predicted Sales",
                    fontSize=11, fontName='Helvetica-Bold',
                    fillColor=BROWN_DARK, textAnchor='middle')
    drawing.add(title)

    return drawing


def build_weather_bar_chart(weather, width=430, height=210):
    """Bar chart comparing the weather factors used by the AI model."""
    drawing = Drawing(width, height)

    labels = ['Rainfall\n(mm)', 'Humidity\n(%)', 'Avg High\n(C)', 'Avg Low\n(C)', 'Cloud\n(%)']
    values = [
        float(weather.get('Rainfall_mm', 0) or 0),
        float(weather.get('Humidity_pct', 0) or 0),
        float(weather.get('Avg_High_C', 0) or 0),
        float(weather.get('Avg_Low_C', 0) or 0),
        float(weather.get('Cloud_pct', 0) or 0),
    ]

    chart = VerticalBarChart()
    chart.x = 55
    chart.y = 45
    chart.width = width - 90
    chart.height = height - 80
    chart.data = [values]

    chart.categoryAxis.categoryNames = labels
    chart.categoryAxis.labels.fontSize = 7.5
    chart.categoryAxis.labels.dy = -10

    max_val = max(values) if values else 1
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max_val * 1.2 if max_val > 0 else 10
    chart.valueAxis.labels.fontSize = 8

    chart.bars[0].fillColor = BROWN_MED
    chart.barWidth = 20
    chart.groupSpacing = 12

    drawing.add(chart)

    title = String(width / 2, height - 12, "Weather Factors Used By The AI Model",
                    fontSize=11, fontName='Helvetica-Bold',
                    fillColor=BROWN_DARK, textAnchor='middle')
    drawing.add(title)

    return drawing


def build_rainy_days_pie(rainy_days, days_in_period=30, width=430, height=220):
    """Pie chart: rainy vs non-rainy days across the reference period."""
    try:
        rainy = float(rainy_days)
    except (TypeError, ValueError):
        rainy = 0
    rainy = max(0, min(rainy, days_in_period))
    clear = days_in_period - rainy

    drawing = Drawing(width, height)

    pie = Pie()
    pie.x = width / 2 - 70
    pie.y = height / 2 - 65
    pie.width = 140
    pie.height = 140
    pie.data = [rainy, clear]
    pie.labels = [f'Rainy ({int(rainy)})', f'Clear ({int(clear)})']
    pie.slices[0].fillColor = ACCENT_BLUE
    pie.slices[1].fillColor = colors.HexColor("#F4D9A0")
    pie.slices.strokeColor = colors.white
    pie.slices.strokeWidth = 1
    pie.simpleLabels = 0
    pie.sideLabels = 0

    drawing.add(pie)

    title = String(width / 2, height - 15, f"Rainy vs. Clear Days (per {days_in_period}-day period)",
                    fontSize=11, fontName='Helvetica-Bold',
                    fillColor=BROWN_DARK, textAnchor='middle')
    drawing.add(title)

    legend = Legend()
    legend.x = width - 120
    legend.y = height / 2
    legend.dx = 8
    legend.dy = 8
    legend.fontSize = 9
    legend.colorNamePairs = [
        (ACCENT_BLUE, f'Rainy days: {int(rainy)}'),
        (colors.HexColor("#F4D9A0"), f'Clear days: {int(clear)}'),
    ]
    drawing.add(legend)

    return drawing


def build_quality_probability_pie(probabilities, width=430, height=220):
    """Pie chart of model confidence across quality classes, if provided.

    Expects a dict like {'EXCELLENT': 0.62, 'GOOD': 0.25, 'MEDIUM': 0.1, 'POOR': 0.03}
    """
    quality_colors = {
        'EXCELLENT': ACCENT_GREEN,
        'GOOD': ACCENT_BLUE,
        'MEDIUM': ACCENT_ORANGE,
        'POOR': ACCENT_RED,
    }

    labels = list(probabilities.keys())
    values = [float(v) for v in probabilities.values()]

    drawing = Drawing(width, height)

    pie = Pie()
    pie.x = width / 2 - 70
    pie.y = height / 2 - 65
    pie.width = 140
    pie.height = 140
    pie.data = values
    pie.labels = [f'{lbl} ({v*100:.0f}%)' if v <= 1 else f'{lbl} ({v:.0f}%)' for lbl, v in zip(labels, values)]
    pie.simpleLabels = 0
    pie.sideLabels = 0
    pie.slices.strokeColor = colors.white
    pie.slices.strokeWidth = 1

    for i, lbl in enumerate(labels):
        pie.slices[i].fillColor = quality_colors.get(str(lbl).upper(), colors.HexColor("#9E9E9E"))

    drawing.add(pie)

    title = String(width / 2, height - 15, "Quality Prediction Confidence",
                    fontSize=11, fontName='Helvetica-Bold',
                    fillColor=BROWN_DARK, textAnchor='middle')
    drawing.add(title)

    legend = Legend()
    legend.x = width - 130
    legend.y = height / 2
    legend.dx = 8
    legend.dy = 8
    legend.fontSize = 9
    legend.colorNamePairs = [
        (quality_colors.get(str(lbl).upper(), colors.HexColor("#9E9E9E")), str(lbl))
        for lbl in labels
    ]
    drawing.add(legend)

    return drawing


# ---------------------------------------------------------------------------
# Main report generator
# ---------------------------------------------------------------------------
def generate_sales_report(result, file_path):
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleCustom", parent=styles["Title"], fontSize=24,
        alignment=TA_CENTER, textColor=BROWN_DARK,
        spaceAfter=10, fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        "SubtitleCustom", parent=styles["Heading2"], fontSize=14,
        alignment=TA_CENTER, textColor=BROWN_MED,
        spaceAfter=20, fontName='Helvetica'
    )
    heading_style = ParagraphStyle(
        "HeadingCustom", parent=styles["Heading2"], fontSize=14,
        textColor=BROWN_DARK, spaceBefore=20, spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    normal_style = ParagraphStyle(
        "NormalCustom", parent=styles["Normal"], fontSize=10, leading=15
    )
    caption_style = ParagraphStyle(
        "CaptionStyle", parent=styles["Normal"], fontSize=8.5,
        alignment=TA_CENTER, textColor=colors.HexColor("#8A7A66"),
        spaceBefore=4, spaceAfter=4, fontName='Helvetica-Oblique'
    )
    table_header_style = ParagraphStyle(
        "TableHeader", parent=styles["Normal"], fontSize=10,
        fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER
    )
    table_cell_style = ParagraphStyle(
        "TableCell", parent=styles["Normal"], fontSize=10,
        alignment=TA_LEFT, leading=12
    )

    story = []

    # =====================================================
    # HEADER
    # =====================================================
    story.append(Paragraph("Coffee Quality AI Platform", title_style))
    story.append(Paragraph("AI Sales Intelligence &amp; Quality Prediction Report", subtitle_style))
    story.append(Paragraph(
        f"<b>Generated Date:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        normal_style
    ))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("<hr/>", normal_style))
    story.append(Spacer(1, 0.2 * inch))

    # =====================================================
    # 1. SALES FORECAST SUMMARY
    # =====================================================
    story.append(Paragraph("1. Sales Forecast Summary", heading_style))

    predicted_sales = result.get('predicted_sales_units', 0)
    sales_level = result.get('sales_level', 'N/A')
    message = result.get('message', 'N/A')

    if "high" in str(sales_level).lower():
        sales_level_display = "High Demand"
        level_color = ACCENT_RED
    elif "low" in str(sales_level).lower():
        sales_level_display = "Low Demand"
        level_color = ACCENT_BLUE
    else:
        sales_level_display = "Medium Demand"
        level_color = ACCENT_ORANGE

    sales_data = [
        [Paragraph("<b>Metric</b>", table_header_style), Paragraph("<b>Result</b>", table_header_style)],
        [Paragraph("Predicted Sales", table_cell_style),
         Paragraph(f"<b>{predicted_sales:,}</b> coffee units", table_cell_style)],
        [Paragraph("Demand Level", table_cell_style),
         Paragraph(f"<font color='{level_color.hexval()}'><b>{sales_level_display}</b></font>", table_cell_style)],
        [Paragraph("Prediction Message", table_cell_style), Paragraph(message, table_cell_style)]
    ]
    story.append(styled_table(sales_data, [1.2 * inch, 3.5 * inch]))
    story.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # 2. COFFEE QUALITY PREDICTION
    # =====================================================
    story.append(Paragraph("2. Coffee Quality Prediction", heading_style))

    quality_label = result.get('predicted_quality_label', 'N/A')
    quality_colors = {
        'EXCELLENT': ACCENT_GREEN, 'GOOD': ACCENT_BLUE,
        'MEDIUM': ACCENT_ORANGE, 'POOR': ACCENT_RED
    }
    quality_color = quality_colors.get(str(quality_label).upper(), colors.HexColor("#757575"))

    quality_data = [
        [Paragraph("<b>Category</b>", table_header_style), Paragraph("<b>Result</b>", table_header_style)],
        [Paragraph("Predicted Quality", table_cell_style),
         Paragraph(f"<font color='{quality_color.hexval()}'><b>{quality_label}</b></font>", table_cell_style)]
    ]
    story.append(styled_table(quality_data, [1.2 * inch, 3.5 * inch]))
    story.append(Spacer(1, 0.15 * inch))

    # Optional: quality confidence pie chart, only if probabilities were supplied
    quality_probs = result.get('quality_probabilities')
    if quality_probs:
        story.append(Spacer(1, 0.1 * inch))
        story.append(build_quality_probability_pie(quality_probs))
        story.append(Paragraph("Figure: model confidence distribution across quality classes.", caption_style))

    story.append(Spacer(1, 0.15 * inch))

    # =====================================================
    # 3. MONTHLY COMPARISON (table + bar chart)
    # =====================================================
    monthly = result.get("monthly_comparison")

    if monthly:
        story.append(Paragraph("3. Monthly Performance Comparison", heading_style))

        previous = monthly.get("previous_month", {})
        current = monthly.get("current_prediction", {})
        prev_sales = previous.get("sales_units", "N/A")
        curr_sales = current.get("sales_units", "N/A")

        try:
            prev_val = float(prev_sales) if prev_sales != "N/A" else 0
            curr_val = float(curr_sales) if curr_sales != "N/A" else 0
            if prev_val > 0:
                change = ((curr_val - prev_val) / prev_val) * 100
                change_text = f"{'Up' if change > 0 else 'Down'} {abs(change):.1f}%"
                change_color = ACCENT_GREEN if change > 0 else ACCENT_RED
            else:
                change_text = "N/A"
                change_color = colors.HexColor("#757575")
        except (TypeError, ValueError):
            prev_val = curr_val = 0
            change_text = "N/A"
            change_color = colors.HexColor("#757575")

        comparison_data = [
            [Paragraph("<b>Metric</b>", table_header_style), Paragraph("<b>Value</b>", table_header_style)],
            [Paragraph("Previous Month Sales", table_cell_style),
             Paragraph(f"{prev_sales:,}" if prev_sales != "N/A" else "N/A", table_cell_style)],
            [Paragraph("Current Prediction", table_cell_style),
             Paragraph(f"<b>{curr_sales:,}</b>" if curr_sales != "N/A" else "N/A", table_cell_style)],
            [Paragraph("Change", table_cell_style),
             Paragraph(f"<font color='{change_color.hexval()}'><b>{change_text}</b></font>", table_cell_style)]
        ]
        story.append(styled_table(comparison_data, [1.2 * inch, 3.5 * inch]))
        story.append(Spacer(1, 0.15 * inch))

        if prev_val or curr_val:
            story.append(build_sales_bar_chart(prev_val, curr_val))
            story.append(Paragraph("Figure: previous month sales vs. current AI-predicted sales.", caption_style))

        story.append(Spacer(1, 0.15 * inch))

    # =====================================================
    # 4. WEATHER CONDITIONS (table + bar chart + pie chart)
    # =====================================================
    weather = result.get("weather_profile")

    if weather:
        story.append(Paragraph("4. Weather Conditions Used By AI", heading_style))

        weather_rows = [
            [Paragraph("<b>Weather Factor</b>", table_header_style), Paragraph("<b>Value</b>", table_header_style)],
            [Paragraph("Rainfall", table_cell_style), Paragraph(f"{weather.get('Rainfall_mm', 'N/A')} mm", table_cell_style)],
            [Paragraph("Humidity", table_cell_style), Paragraph(f"{weather.get('Humidity_pct', 'N/A')} %", table_cell_style)],
            [Paragraph("Avg High Temperature", table_cell_style), Paragraph(f"{weather.get('Avg_High_C', 'N/A')} C", table_cell_style)],
            [Paragraph("Avg Low Temperature", table_cell_style), Paragraph(f"{weather.get('Avg_Low_C', 'N/A')} C", table_cell_style)],
            [Paragraph("Rainy Days", table_cell_style), Paragraph(str(weather.get('Rainy_Days', 'N/A')), table_cell_style)],
            [Paragraph("Cloud Cover", table_cell_style), Paragraph(f"{weather.get('Cloud_pct', 'N/A')} %", table_cell_style)]
        ]
        story.append(styled_table(weather_rows, [1.5 * inch, 3.2 * inch]))
        story.append(Spacer(1, 0.15 * inch))

        story.append(build_weather_bar_chart(weather))
        story.append(Paragraph("Figure: relative magnitude of each weather input to the model.", caption_style))
        story.append(Spacer(1, 0.15 * inch))

        rainy_days = weather.get('Rainy_Days')
        if rainy_days is not None:
            story.append(build_rainy_days_pie(rainy_days))
            story.append(Paragraph("Figure: rainy vs. clear days over the reference period.", caption_style))

        story.append(Spacer(1, 0.15 * inch))

    # =====================================================
    # 5. AI DECISION SUPPORT GUIDE
    # =====================================================
    story.append(Paragraph("5. AI Decision Support Guide", heading_style))

    sales_level = result.get("sales_level", "N/A")

    if "high" in str(sales_level).lower():
        recommendation = "Prepare for High Demand"
        action_text = (
            "- Increase stock availability immediately<br/>"
            "- Verify raw material supply chain<br/>"
            "- Prepare production capacity for increased output<br/>"
            "- Consider hiring temporary staff if needed"
        )
        priority = "High Priority"
        timeline = "Immediate action required"
        bg_color = colors.HexColor("#FFEBEE")
    elif "low" in str(sales_level).lower():
        recommendation = "Optimize Operations"
        action_text = (
            "- Control inventory levels to avoid overstock<br/>"
            "- Reduce unnecessary production<br/>"
            "- Consider promotional activities<br/>"
            "- Review cost optimization opportunities"
        )
        priority = "Medium Priority"
        timeline = "Monitor demand changes"
        bg_color = colors.HexColor("#E3F2FD")
    else:
        recommendation = "Maintain Normal Operations"
        action_text = (
            "- Continue regular production schedule<br/>"
            "- Monitor market changes closely<br/>"
            "- Maintain quality standards<br/>"
            "- Review performance metrics weekly"
        )
        priority = "Normal Priority"
        timeline = "Regular monitoring"
        bg_color = colors.HexColor("#E8F5E9")

    decision_data = [
        [Paragraph("<b>Recommendation</b>", table_header_style), Paragraph("<b>Details</b>", table_header_style)],
        [Paragraph("Recommendation", table_cell_style), Paragraph(f"<b>{recommendation}</b>", table_cell_style)],
        [Paragraph("Action Required", table_cell_style), Paragraph(action_text, table_cell_style)],
        [Paragraph("Priority Level", table_cell_style), Paragraph(priority, table_cell_style)],
        [Paragraph("Timeline", table_cell_style), Paragraph(timeline, table_cell_style)]
    ]
    story.append(styled_table(decision_data, [1.2 * inch, 3.5 * inch], body_bg=bg_color))
    story.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # FOOTER
    # =====================================================
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("<hr/>", normal_style))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "Generated automatically by Coffee Quality AI Platform",
        ParagraphStyle("FooterStyle", parent=styles["Normal"], fontSize=9,
                        alignment=TA_CENTER, textColor=colors.HexColor("#999999"))
    ))

    doc.build(story)
    return file_path


if __name__ == "__main__":
    sample_result = {
        "predicted_sales_units": 5230,
        "sales_level": "High",
        "message": "Strong demand expected due to favorable weather and seasonal trends.",
        "predicted_quality_label": "GOOD",
        "quality_probabilities": {
            "EXCELLENT": 0.28,
            "GOOD": 0.52,
            "MEDIUM": 0.15,
            "POOR": 0.05
        },
        "monthly_comparison": {
            "previous_month": {"sales_units": 4100},
            "current_prediction": {"sales_units": 5230}
        },
        "weather_profile": {
            "Rainfall_mm": 145,
            "Humidity_pct": 78,
            "Avg_High_C": 27,
            "Avg_Low_C": 18,
            "Rainy_Days": 12,
            "Cloud_pct": 64
        }
    }
    
    print("Report generated.")