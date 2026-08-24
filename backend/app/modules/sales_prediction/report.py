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

    # Title style
    title_style = ParagraphStyle(
        "TitleCustom",
        parent=styles["Title"],
        fontSize=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#5A2D0C"),
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )

    # Subtitle style
    subtitle_style = ParagraphStyle(
        "SubtitleCustom",
        parent=styles["Heading2"],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#7A3E12"),
        spaceAfter=20,
        fontName='Helvetica'
    )

    # Section header style
    heading_style = ParagraphStyle(
        "HeadingCustom",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#5A2D0C"),
        spaceBefore=20,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    # Normal text style
    normal_style = ParagraphStyle(
        "NormalCustom",
        parent=styles["Normal"],
        fontSize=10,
        leading=15
    )

    # Table header style
    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=10,
        fontName='Helvetica-Bold',
        textColor=colors.white,
        alignment=TA_CENTER
    )

    # Table cell style
    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontSize=10,
        alignment=TA_LEFT,
        leading=12
    )

    story = []

    # =====================================================
    # HEADER
    # =====================================================
    story.append(
        Paragraph(
            "☕ Coffee Quality AI Platform",
            title_style
        )
    )

    story.append(
        Paragraph(
            "AI Sales Intelligence & Quality Prediction Report",
            subtitle_style
        )
    )

    # Date line
    story.append(
        Paragraph(
            f"<b>Generated Date:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            normal_style
        )
    )
    story.append(Spacer(1, 0.2*inch))

    # Separator line
    story.append(Paragraph("<hr/>", normal_style))
    story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # 1. SALES FORECAST SUMMARY
    # =====================================================
    story.append(
        Paragraph(
            "1. Sales Forecast Summary",
            heading_style
        )
    )

    # Get sales data
    predicted_sales = result.get('predicted_sales_units', 0)
    sales_level = result.get('sales_level', 'N/A')
    message = result.get('message', 'N/A')

    # Format sales level with icon
    if "high" in str(sales_level).lower():
        sales_level_display = "📈 High Demand"
        level_color = colors.HexColor("#D32F2F")
    elif "low" in str(sales_level).lower():
        sales_level_display = "📉 Low Demand"
        level_color = colors.HexColor("#1976D2")
    else:
        sales_level_display = "➡️ Medium Demand"
        level_color = colors.HexColor("#F57C00")

    sales_data = [
        [
            Paragraph("<b>Metric</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("Predicted Sales", table_cell_style),
            Paragraph(f"<b>{predicted_sales:,}</b> coffee units", table_cell_style)
        ],
        [
            Paragraph("Demand Level", table_cell_style),
            Paragraph(f"<font color='{level_color.hexval()}'><b>{sales_level_display}</b></font>", table_cell_style)
        ],
        [
            Paragraph("Prediction Message", table_cell_style),
            Paragraph(message, table_cell_style)
        ]
    ]

    sales_table = Table(sales_data, colWidths=[1.2*inch, 3.5*inch])
    sales_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#5A2D0C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FDF5E6")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D4C4A8")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', (0, 0), (-1, -1), 3),
    ]))

    story.append(sales_table)
    story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # 2. COFFEE QUALITY PREDICTION
    # =====================================================
    story.append(
        Paragraph(
            "2. Coffee Quality Prediction",
            heading_style
        )
    )

    quality_label = result.get('predicted_quality_label', 'N/A')
    
    # Format quality with color
    quality_colors = {
        'EXCELLENT': colors.HexColor("#2E7D32"),
        'GOOD': colors.HexColor("#1976D2"),
        'MEDIUM': colors.HexColor("#F57C00"),
        'POOR': colors.HexColor("#D32F2F")
    }
    quality_color = quality_colors.get(str(quality_label).upper(), colors.HexColor("#757575"))

    quality_data = [
        [
            Paragraph("<b>Category</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("Predicted Quality", table_cell_style),
            Paragraph(f"<font color='{quality_color.hexval()}'><b>{quality_label}</b></font>", table_cell_style)
        ]
    ]

    quality_table = Table(quality_data, colWidths=[1.2*inch, 3.5*inch])
    quality_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#5A2D0C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FDF5E6")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D4C4A8")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', (0, 0), (-1, -1), 3),
    ]))

    story.append(quality_table)
    story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # 3. MONTHLY COMPARISON
    # =====================================================
    monthly = result.get("monthly_comparison")

    if monthly:
        story.append(
            Paragraph(
                "3. Monthly Performance Comparison",
                heading_style
            )
        )

        previous = monthly.get("previous_month", {})
        current = monthly.get("current_prediction", {})
        
        prev_sales = previous.get("sales_units", "N/A")
        curr_sales = current.get("sales_units", "N/A")
        
        # Calculate change
        try:
            prev_val = float(prev_sales) if prev_sales != "N/A" else 0
            curr_val = float(curr_sales) if curr_sales != "N/A" else 0
            if prev_val > 0:
                change = ((curr_val - prev_val) / prev_val) * 100
                change_text = f"{'↑' if change > 0 else '↓'} {abs(change):.1f}%"
                change_color = colors.HexColor("#2E7D32") if change > 0 else colors.HexColor("#D32F2F")
            else:
                change_text = "N/A"
                change_color = colors.HexColor("#757575")
        except:
            change_text = "N/A"
            change_color = colors.HexColor("#757575")

        comparison_data = [
            [
                Paragraph("<b>Metric</b>", table_header_style),
                Paragraph("<b>Value</b>", table_header_style)
            ],
            [
                Paragraph("Previous Month Sales", table_cell_style),
                Paragraph(f"{prev_sales:,}" if prev_sales != "N/A" else "N/A", table_cell_style)
            ],
            [
                Paragraph("Current Prediction", table_cell_style),
                Paragraph(f"<b>{curr_sales:,}</b>" if curr_sales != "N/A" else "N/A", table_cell_style)
            ],
            [
                Paragraph("Change", table_cell_style),
                Paragraph(f"<font color='{change_color.hexval()}'><b>{change_text}</b></font>", table_cell_style)
            ]
        ]

        comparison_table = Table(comparison_data, colWidths=[1.2*inch, 3.5*inch])
        comparison_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#5A2D0C")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FDF5E6")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D4C4A8")),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('ROUNDEDCORNERS', (0, 0), (-1, -1), 3),
        ]))

        story.append(comparison_table)
        story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # 4. WEATHER CONDITIONS
    # =====================================================
    weather = result.get("weather_profile")

    if weather:
        story.append(
            Paragraph(
                "4. Weather Conditions Used By AI",
                heading_style
            )
        )

        weather_data = [
            [Paragraph("<b>Weather Factor</b>", table_header_style), 
             Paragraph("<b>Value</b>", table_header_style)],
            ["Rainfall", f"{weather.get('Rainfall_mm', 'N/A')} mm"],
            ["Humidity", f"{weather.get('Humidity_pct', 'N/A')} %"],
            ["Avg High Temperature", f"{weather.get('Avg_High_C', 'N/A')} °C"],
            ["Avg Low Temperature", f"{weather.get('Avg_Low_C', 'N/A')} °C"],
            ["Rainy Days", str(weather.get('Rainy_Days', 'N/A'))],
            ["Cloud Cover", f"{weather.get('Cloud_pct', 'N/A')} %"]
        ]

        # Convert to Paragraph objects for better formatting
        weather_data_formatted = []
        for row in weather_data:
            formatted_row = []
            for cell in row:
                if isinstance(cell, str):
                    formatted_row.append(Paragraph(cell, table_cell_style))
                else:
                    formatted_row.append(cell)
            weather_data_formatted.append(formatted_row)

        weather_table = Table(weather_data_formatted, colWidths=[1.5*inch, 3.2*inch])
        weather_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#5A2D0C")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FDF5E6")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D4C4A8")),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('ROUNDEDCORNERS', (0, 0), (-1, -1), 3),
        ]))

        story.append(weather_table)
        story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # 5. AI DECISION SUPPORT GUIDE
    # =====================================================
    story.append(
        Paragraph(
            "5. AI Decision Support Guide",
            heading_style
        )
    )

    # Get demand level
    sales_level = result.get("sales_level", "N/A")

    # Create recommendation dynamically
    if "high" in str(sales_level).lower():
        recommendation = "🚀 Prepare for High Demand"
        action_text = (
            "• Increase stock availability immediately\n"
            "• Verify raw material supply chain\n"
            "• Prepare production capacity for increased output\n"
            "• Consider hiring temporary staff if needed"
        )
        priority = "🔴 High Priority"
        timeline = "⏰ Immediate action required"
        bg_color = colors.HexColor("#FFEBEE")

    elif "low" in str(sales_level).lower():
        recommendation = "📊 Optimize Operations"
        action_text = (
            "• Control inventory levels to avoid overstock\n"
            "• Reduce unnecessary production\n"
            "• Consider promotional activities\n"
            "• Review cost optimization opportunities"
        )
        priority = "🟡 Medium Priority"
        timeline = "⏰ Monitor demand changes"
        bg_color = colors.HexColor("#E3F2FD")

    else:
        recommendation = "⚖️ Maintain Normal Operations"
        action_text = (
            "• Continue regular production schedule\n"
            "• Monitor market changes closely\n"
            "• Maintain quality standards\n"
            "• Review performance metrics weekly"
        )
        priority = "🟢 Normal Priority"
        timeline = "⏰ Regular monitoring"
        bg_color = colors.HexColor("#E8F5E9")

    decision_data = [
        [
            Paragraph("<b>Recommendation</b>", table_header_style),
            Paragraph("<b>Details</b>", table_header_style)
        ],
        [
            Paragraph("Recommendation", table_cell_style),
            Paragraph(f"<b>{recommendation}</b>", table_cell_style)
        ],
        [
            Paragraph("Action Required", table_cell_style),
            Paragraph(action_text.replace('\n', '<br/>'), table_cell_style)
        ],
        [
            Paragraph("Priority Level", table_cell_style),
            Paragraph(priority, table_cell_style)
        ],
        [
            Paragraph("Timeline", table_cell_style),
            Paragraph(timeline, table_cell_style)
        ]
    ]

    decision_table = Table(decision_data, colWidths=[1.2*inch, 3.5*inch])
    decision_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#5A2D0C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), bg_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D4C4A8")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', (0, 0), (-1, -1), 3),
    ]))

    story.append(decision_table)
    story.append(Spacer(1, 0.2*inch))

    # =====================================================
    # FOOTER
    # =====================================================
    story.append(Spacer(1, 0.3*inch))
    
    # Separator line
    story.append(Paragraph("<hr/>", normal_style))
    story.append(Spacer(1, 0.1*inch))

    story.append(
        Paragraph(
            "Generated automatically by Coffee Quality AI Platform",
            ParagraphStyle(
                "FooterStyle",
                parent=styles["Normal"],
                fontSize=9,
                alignment=TA_CENTER,
                textColor=colors.HexColor("#999999")
            )
        )
    )

    # Build the PDF
    doc.build(story)
    return file_path