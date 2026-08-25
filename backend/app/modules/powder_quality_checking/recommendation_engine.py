# ============================================================
# Smart Coffee Manufacturing
# Dynamic AI Recommendation Engine
#
# Explainable AI Decision Support Layer
#
# Generates recommendations based on:
# - Moisture condition
# - Temperature condition
# - Humidity condition
# - Coffee colour evidence
#
# Not fixed recommendations.
# Actions are generated from detected quality factors.
# ============================================================


def analyze_quality_conditions(
    moisture,
    humidity,
    temperature,
    moisture_status,
    humidity_status,
    temperature_status,
    color_status
):


    findings = []


    # -------------------------------
    # Moisture Intelligence
    # -------------------------------

    if moisture_status in ["WARN", "HOLD"]:


        findings.append({

            "parameter": "moisture",

            "severity": moisture_status,

            "value": moisture,

            "issue":
            (
                "Moisture level variation detected"
            ),

            "cause":
            (
                "Possible drying process variation "
                "or insufficient moisture control"
            ),

            "action":
            (
                "Review drying condition and "
                "perform moisture validation"
            )

        })



    # -------------------------------
    # Humidity Intelligence
    # -------------------------------

    if humidity_status in ["WARN", "HOLD"]:


        findings.append({

            "parameter": "humidity",

            "severity": humidity_status,

            "value": humidity,

            "issue":
            (
                "Storage humidity condition detected"
            ),

            "cause":
            (
                "Possible environmental storage "
                "condition variation"
            ),

            "action":
            (
                "Inspect storage environment and "
                "control humidity condition"
            )

        })



    # -------------------------------
    # Temperature Intelligence
    # -------------------------------

    if temperature_status in ["WARN", "HOLD"]:


        findings.append({

            "parameter": "temperature",

            "severity": temperature_status,

            "value": temperature,

            "issue":
            (
                "Temperature variation detected"
            ),

            "cause":
            (
                "Possible roasting or thermal "
                "process instability"
            ),

            "action":
            (
                "Review roasting temperature "
                "profile and processing condition"
            )

        })



    # -------------------------------
    # Colour Intelligence
    # Supporting Evidence Only
    # -------------------------------

    # -------------------------------
    # Colour Intelligence
    # Supporting Evidence Only
    # Only show when batch is not PASS
    # -------------------------------

    if color_status in ["WARN", "HOLD"]:


        findings.append({

            "parameter": "color",

            "severity": color_status,

            "value": None,

            "issue":
            (
                "Coffee colour inconsistency detected"
            ),

            "cause":
            (
                "Possible roasting parameter variation"
            ),

            "action":
            (
                "Review roasting consistency "
                "using RGB evidence"
            )

        })



    return findings





# ============================================================
# Dynamic Root Cause Generator
# ============================================================


def generate_root_causes(findings):


    causes = []


    for item in findings:


        causes.append(
            item["cause"]
        )



    if not causes:


        causes.append(
            "No abnormal production condition detected"
        )



    return causes





# ============================================================
# Dynamic Action Generator
# ============================================================


def generate_actions(
    findings,
    status
):


    actions = []


    step = 1



    if status == "HOLD":


        actions.append({

            "step": step,

            "action":
            "Isolate batch before packaging",

            "reason":
            (
                "Quality evidence indicates "
                "batch requires correction "
                "before release."
            )

        })

        step += 1




    for item in findings:


        actions.append({

            "step": step,

            "action":
            item["action"],

            "reason":
            (
                f'{item["issue"]} '
                f'identified from quality analysis.'
            )

        })


        step += 1





    if status in ["WARN", "HOLD"]:


        actions.append({

            "step": step,

            "action":
            "Perform AI quality validation again",

            "reason":
            (
                "Confirm improvement before "
                "final production decision."
            )

        })
        
        
    
    



    if status == "PASS":


        actions.append({

            "step":1,

            "action":
            "Approve batch for packaging",

            "reason":
            (
                "All monitored quality parameters "
                "are within acceptable limits."
            )

        })



    return actions





# ============================================================
# Dynamic Prevention Generator
# ============================================================


def generate_prevention(findings):


    prevention = []



    parameters = [

        item["parameter"]

        for item in findings

    ]



    if "moisture" in parameters:

        prevention.append(
            "Maintain moisture control limits during processing"
        )



    if "humidity" in parameters:

        prevention.append(
            "Maintain controlled storage humidity conditions"
        )



    if "temperature" in parameters:

        prevention.append(
            "Maintain consistent roasting temperature profile"
        )



    if "color" in parameters:

        prevention.append(
            "Monitor coffee colour variation using RGB analysis"
        )



    if not prevention:


        prevention = [

            "Continue regular quality monitoring",

            "Maintain production consistency",

            "Perform routine sensor verification"

        ]



    return prevention



# ============================================================
# MAIN AI RECOMMENDATION GENERATOR
# ============================================================


def generate_recommendation(
    moisture,
    humidity,
    temperature,
    red,
    green,
    blue,
    status,
    moisture_status="PASS",
    color_status="PASS",
    temperature_status="PASS",
    humidity_status="PASS",
    quality_score=0,
):


    moisture = float(moisture or 0)

    humidity = float(humidity or 0)

    temperature = float(temperature or 0)


    status = str(
        status or "UNKNOWN"
    ).upper()



    moisture_status = str(
        moisture_status or "PASS"
    ).upper()


    humidity_status = str(
        humidity_status or "PASS"
    ).upper()


    temperature_status = str(
        temperature_status or "PASS"
    ).upper()


    color_status = str(
        color_status or "PASS"
    ).upper()



    # ========================================================
    # Dynamic Quality Understanding
    # ========================================================


    findings = analyze_quality_conditions(

        moisture,

        humidity,

        temperature,

        moisture_status,

        humidity_status,

        temperature_status,

        color_status

    )
    
    
    # PASS batches should not show abnormal evidence
    # because no corrective intelligence is required
    if status == "PASS":
        findings = []



    root_causes = generate_root_causes(
        findings
    )
    
    
    if status == "PASS":
        findings = []


    actions = generate_actions(
        findings,
        status
    )


    prevention = generate_prevention(
        findings
    )





    # ========================================================
    # Recovery Intelligence
    # ========================================================


    if status == "PASS":


        risk_level = "LOW"

        release_status = "APPROVED"

        recovery_status = "NOT REQUIRED"

        recovery_probability = 100

        recovery_possible = False



        title = (
            "Production Ready - Packaging Approved"
        )


        description = (
            "AI verification confirms that "
            "the batch satisfies current "
            "quality requirements."
        )



    elif status == "WARN":


        risk_level = "MEDIUM"

        release_status = "PENDING REVIEW"

        recovery_status = "RECOVERY POSSIBLE"

        recovery_probability = 90

        recovery_possible = True



        title = (
            "Minor Quality Deviation Detected"
        )


        description = (
            "AI identified quality variations "
            "requiring verification before release."
        )



    else:


        risk_level = "HIGH"

        release_status = "BLOCKED"

        recovery_status = "RECOVERY REQUIRED"

        recovery_probability = max(
            60,
            100 - (len(findings) * 10)
        )

        recovery_possible = True



        title = (
            "Critical Quality Deviation Detected"
        )


        description = (
            "AI detected production parameters "
            "outside acceptable limits. "
            "Corrective action is required."
        )





    # ========================================================
    # Final AI Recommendation Object
    # ========================================================


    recommendation = {


        "quality_issue": {


            "title":
            title,


            "severity":
            risk_level,


            "description":
            description


        },



        "root_causes":
        root_causes,



        "immediate_actions":
        actions,



        # Frontend compatibility

        "recommended_actions":
        actions,



        "future_prevention":
        prevention,



        "expected_outcome":

        (

            "Batch approved for packaging."

            if status == "PASS"

            else

            "Batch quality improvement required "
            "before final release."

        ),



        "next_action":

        (

            "Proceed with packaging"

            if status == "PASS"

            else

            "Complete corrective validation "
            "before release decision."

        ),



        "risk_level":
        risk_level,



        "release_status":
        release_status,



        "recovery_status":
        recovery_status,



        "recovery_probability":
        recovery_probability,



        "recovery_possible":
        recovery_possible,



        "quality_score":
        quality_score,



        "analysis_evidence":{


            "moisture":
            moisture,


            "humidity":
            humidity,


            "temperature":
            temperature,


            "rgb":{

                "red":red,

                "green":green,

                "blue":blue

            },


            "detected_factors":

            [

                item["parameter"]

                for item in findings

            ]

        }


    }



    return recommendation