import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from pathlib import Path
import uuid

import cv2
from ultralytics import YOLO


# =========================================================
# 1. PROJECT PATHS
# =========================================================

CURRENT_FILE = Path(__file__).resolve()

PROJECT_ROOT = CURRENT_FILE.parents[4]

BACKEND_DIR = (
    PROJECT_ROOT
    / "backend"
)

MODEL_DIR = (
    PROJECT_ROOT
    / "models"
    / "bean_defect_detection"
)


# =========================================================
# 2. MODEL PATHS
# =========================================================

DETECTOR_MODEL_PATH = (
    MODEL_DIR
    / "detector"
    / "best.pt"
)

COLOR_MODEL_PATH = (
    MODEL_DIR
    / "color_classifier"
    / "best.pt"
)

SHAPE_MODEL_PATH = (
    MODEL_DIR
    / "shape_classifier"
    / "best.pt"
)


# =========================================================
# 3. OUTPUT DIRECTORY
# =========================================================

PREDICTION_DIR = (
    BACKEND_DIR
    / "app"
    / "static"
    / "predictions"
    / "beans"
)

PREDICTION_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# 4. CHECK MODEL FILES
# =========================================================

if not DETECTOR_MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Detector model not found: "
        f"{DETECTOR_MODEL_PATH}"
    )

if not COLOR_MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Color classifier not found: "
        f"{COLOR_MODEL_PATH}"
    )

if not SHAPE_MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Shape classifier not found: "
        f"{SHAPE_MODEL_PATH}"
    )


# =========================================================
# 5. LOAD AI MODELS
# =========================================================

print("========================================")
print("Loading Coffee Bean AI Models...")
print("----------------------------------------")

detector = YOLO(
    str(DETECTOR_MODEL_PATH)
)

color_model = YOLO(
    str(COLOR_MODEL_PATH)
)

shape_model = YOLO(
    str(SHAPE_MODEL_PATH)
)

print("✓ Bean detector loaded")
print("✓ Color classifier loaded")
print("✓ Shape classifier loaded")
print("----------------------------------------")
print("All Coffee Bean AI Models Loaded")
print("========================================")


# =========================================================
# 6. MODEL SETTINGS
# =========================================================

DETECTOR_CONFIDENCE = 0.50

DETECTOR_IMAGE_SIZE = 832

CLASSIFIER_IMAGE_SIZE = 224


# =========================================================
# 7. FINAL CLASS IDS
# =========================================================

FINAL_CLASS_IDS = {
    "good": 0,
    "broken": 1,
    "black": 2,
    "black_and_broken": 3,
    "unknown": 4,
}


# =========================================================
# 8. FINAL BOX COLORS
# =========================================================
#
# OpenCV uses BGR
#

BOX_COLORS = {
    "good": (
        0,
        255,
        0,
    ),

    "broken": (
        0,
        165,
        255,
    ),

    "black": (
        0,
        0,
        255,
    ),

    "black_and_broken": (
        255,
        0,
        255,
    ),

    "unknown": (
        255,
        255,
        0,
    ),
}


# =========================================================
# 9. COLOR CLASSIFICATION
# =========================================================

def classify_color(bean_crop):

    """
    Predict bean color using the original
    COLOR bean crop.

    Tested Notebook logic:

    normal / brown -> normal_brown
    black          -> black_dark
    anything else  -> original class name
    """

    color_results = color_model.predict(
        source=bean_crop,
        imgsz=CLASSIFIER_IMAGE_SIZE,
        verbose=False,
    )

    color_result = color_results[0]


    if color_result.probs is None:

        return {
            "class_id": -1,
            "class_name": "unknown",
            "original_class_name": "unknown",
            "confidence": 0.0,
        }


    color_class_id = int(
        color_result.probs.top1
    )

    color_confidence = float(
        color_result.probs.top1conf
    )


    color_name = (
        color_result.names[
            color_class_id
        ]
    )


    color_lower = (
        color_name
        .strip()
        .lower()
    )


    # =====================================================
    # SAME MAPPING AS JUPYTER NOTEBOOK
    # =====================================================

    if (
        "normal" in color_lower
        or
        "brown" in color_lower
    ):

        color = "normal_brown"


    elif "black" in color_lower:

        color = "black_dark"


    else:

        color = color_lower


    return {

        "class_id":
            color_class_id,

        "class_name":
            color,

        "original_class_name":
            color_name,

        "confidence":
            round(
                color_confidence,
                3,
            ),
    }


# =========================================================
# 10. SHAPE CLASSIFICATION
# =========================================================

def classify_shape(bean_crop):

    """
    Shape model was trained using GRAYSCALE images.

    Pipeline:

    Original bean crop
            ↓
    BGR -> Grayscale
            ↓
    Grayscale -> 3-channel grayscale
            ↓
    Shape classifier
    """


    # =====================================================
    # BGR -> GRAYSCALE
    # =====================================================

    gray_crop = cv2.cvtColor(
        bean_crop,
        cv2.COLOR_BGR2GRAY,
    )


    # =====================================================
    # GRAYSCALE -> 3 CHANNEL
    # =====================================================
    #
    # This does NOT restore color.
    # All 3 channels contain identical gray values.
    #

    gray_crop_3channel = cv2.cvtColor(
        gray_crop,
        cv2.COLOR_GRAY2BGR,
    )


    # =====================================================
    # SHAPE PREDICTION
    # =====================================================

    shape_results = shape_model.predict(
        source=gray_crop_3channel,
        imgsz=CLASSIFIER_IMAGE_SIZE,
        verbose=False,
    )

    shape_result = shape_results[0]


    if shape_result.probs is None:

        return {
            "class_id": -1,
            "class_name": "unknown",
            "confidence": 0.0,
        }


    shape_class_id = int(
        shape_result.probs.top1
    )

    shape_confidence = float(
        shape_result.probs.top1conf
    )


    shape_name = (
        shape_result.names[
            shape_class_id
        ]
    )


    shape = (
        shape_name
        .strip()
        .lower()
    )


    return {

        "class_id":
            shape_class_id,

        "class_name":
            shape,

        "confidence":
            round(
                shape_confidence,
                3,
            ),
    }


# =========================================================
# 11. FINAL BEAN CATEGORY
# =========================================================

def determine_final_result(
    color,
    shape,
):

    """
    Same final combination logic
    used in the tested Jupyter Notebook.
    """


    # =====================================================
    # GOOD
    # =====================================================

    if (
        color == "normal_brown"
        and
        shape == "whole"
    ):

        return "good"


    # =====================================================
    # BROKEN
    # =====================================================

    elif (
        color == "normal_brown"
        and
        shape == "broken"
    ):

        return "broken"


    # =====================================================
    # BLACK
    # =====================================================

    elif (
        color == "black_dark"
        and
        shape == "whole"
    ):

        return "black"


    # =====================================================
    # BLACK + BROKEN
    # =====================================================

    elif (
        color == "black_dark"
        and
        shape == "broken"
    ):

        return "black_and_broken"


    # =====================================================
    # UNKNOWN
    # =====================================================

    else:

        return "unknown"


# =========================================================
# 12. DISPLAY CONFIDENCE
# =========================================================

def calculate_display_confidence(
    color_confidence,
    shape_confidence,
):

    """
    Used only for frontend compatibility / display.

    This is NOT a scientifically calibrated
    combined probability.
    """

    return round(
        (
            float(color_confidence)
            +
            float(shape_confidence)
        )
        / 2,
        3,
    )


# =========================================================
# 13. DRAW BEAN RESULT
# =========================================================

def draw_bean_result(
    output_image,
    x1,
    y1,
    x2,
    y2,
    final_result,
    color_confidence,
    shape_confidence,
):

    box_color = BOX_COLORS.get(
        final_result,
        BOX_COLORS["unknown"],
    )


    # =====================================================
    # BOUNDING BOX
    # =====================================================

    cv2.rectangle(
        output_image,
        (
            x1,
            y1,
        ),
        (
            x2,
            y2,
        ),
        box_color,
        2,
    )


    # =====================================================
    # LABEL
    # =====================================================

    label = (
        f"{final_result} "
        f"C:{color_confidence:.2f} "
        f"S:{shape_confidence:.2f}"
    )


    cv2.putText(
        output_image,
        label,
        (
            x1,
            max(
                y1 - 5,
                15,
            ),
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.40,
        box_color,
        1,
        cv2.LINE_AA,
    )


# =========================================================
# 14. DRAW IMAGE SUMMARY
# =========================================================

def draw_summary(
    output_image,
    total_count,
    good_count,
    broken_count,
    black_count,
    black_broken_count,
):

    # =====================================================
    # TOTAL
    # =====================================================

    cv2.putText(
        output_image,
        f"Total: {total_count}",
        (
            20,
            30,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        (
            255,
            255,
            255,
        ),
        2,
        cv2.LINE_AA,
    )


    # =====================================================
    # GOOD
    # =====================================================

    cv2.putText(
        output_image,
        f"Good: {good_count}",
        (
            20,
            60,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.70,
        (
            0,
            255,
            0,
        ),
        2,
        cv2.LINE_AA,
    )


    # =====================================================
    # BROKEN
    # =====================================================

    cv2.putText(
        output_image,
        f"Broken: {broken_count}",
        (
            20,
            90,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.70,
        (
            0,
            165,
            255,
        ),
        2,
        cv2.LINE_AA,
    )


    # =====================================================
    # BLACK
    # =====================================================

    cv2.putText(
        output_image,
        f"Black: {black_count}",
        (
            20,
            120,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.70,
        (
            0,
            0,
            255,
        ),
        2,
        cv2.LINE_AA,
    )


    # =====================================================
    # BLACK + BROKEN
    # =====================================================

    cv2.putText(
        output_image,
        (
            "Black + Broken: "
            f"{black_broken_count}"
        ),
        (
            20,
            150,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.70,
        (
            255,
            0,
            255,
        ),
        2,
        cv2.LINE_AA,
    )


# =========================================================
# 15. MAIN PHYSICAL AI PREDICTION
# =========================================================

def predict_bean_image(
    image_path: str
):

    """
    Complete Physical AI Pipeline:

    Uploaded Image
        ↓
    Coffee Bean Detector
        ↓
    Crop Each Bean
        ↓
    Color Classification
        +
    Shape Classification
        ↓
    Final Bean Category
        ↓
    Counts + Annotated Image
        ↓
    JSON Response
    """


    # =====================================================
    # READ IMAGE
    # =====================================================

    image = cv2.imread(
        image_path
    )


    if image is None:

        raise ValueError(
            "Unable to read uploaded coffee bean image."
        )


    # =====================================================
    # ORIGINAL IMAGE
    # =====================================================
    #
    # original_image:
    # classification / cropping
    #
    # output_image:
    # bounding boxes / labels
    #

    original_image = (
        image.copy()
    )

    output_image = (
        image.copy()
    )


    image_height, image_width = (
        original_image.shape[:2]
    )


    # =====================================================
    # STEP 1 - COFFEE BEAN DETECTION
    # =====================================================

    detection_results = (
        detector.predict(
            source=original_image,
            conf=DETECTOR_CONFIDENCE,
            imgsz=DETECTOR_IMAGE_SIZE,
            save=False,
            verbose=False,
        )
    )


    detection_result = (
        detection_results[0]
    )


    # =====================================================
    # COUNTERS
    # =====================================================

    total_count = 0

    good_count = 0

    broken_count = 0

    black_count = 0

    black_broken_count = 0

    unknown_count = 0


    detections = []


    # =====================================================
    # STEP 2 - PROCESS EACH DETECTED BEAN
    # =====================================================

    for box in detection_result.boxes:


        # =================================================
        # DETECTOR DATA
        # =================================================

        detector_class_id = int(
            box.cls[0]
        )

        detector_confidence = float(
            box.conf[0]
        )


        raw_x1, raw_y1, raw_x2, raw_y2 = (
            box.xyxy[0].tolist()
        )


        # =================================================
        # SAFE COORDINATES
        # =================================================

        x1 = max(
            0,
            int(raw_x1),
        )

        y1 = max(
            0,
            int(raw_y1),
        )

        x2 = min(
            image_width,
            int(raw_x2),
        )

        y2 = min(
            image_height,
            int(raw_y2),
        )


        # =================================================
        # INVALID BOX CHECK
        # =================================================

        if (
            x2 <= x1
            or
            y2 <= y1
        ):

            continue


        # =================================================
        # CROP FROM ORIGINAL COLOR IMAGE
        # =================================================

        bean_crop = original_image[
            y1:y2,
            x1:x2
        ]


        if bean_crop.size == 0:

            continue


        # =================================================
        # STEP 3 - COLOR CLASSIFICATION
        # =================================================

        color_result = classify_color(
            bean_crop
        )


        color = (
            color_result[
                "class_name"
            ]
        )

        color_confidence = float(
            color_result[
                "confidence"
            ]
        )


        # =================================================
        # STEP 4 - SHAPE CLASSIFICATION
        # =================================================

        shape_result = classify_shape(
            bean_crop
        )


        shape = (
            shape_result[
                "class_name"
            ]
        )

        shape_confidence = float(
            shape_result[
                "confidence"
            ]
        )


        # =================================================
        # STEP 5 - FINAL RESULT
        # =================================================

        final_result = (
            determine_final_result(
                color,
                shape,
            )
        )


        # =================================================
        # COUNTERS
        # =================================================

        if final_result == "good":

            good_count += 1


        elif final_result == "broken":

            broken_count += 1


        elif final_result == "black":

            black_count += 1


        elif (
            final_result
            ==
            "black_and_broken"
        ):

            black_broken_count += 1


        else:

            unknown_count += 1


        total_count += 1


        # =================================================
        # DISPLAY CONFIDENCE
        # =================================================

        display_confidence = (
            calculate_display_confidence(
                color_confidence,
                shape_confidence,
            )
        )


        # =================================================
        # TERMINAL DEBUG
        # =================================================

        print(

            f"Bean {total_count}: "

            f"Color={color} "
            f"({color_confidence:.2f}) | "

            f"Shape={shape} "
            f"({shape_confidence:.2f}) | "

            f"Final={final_result}"

        )


        # =================================================
        # SAVE DETECTION JSON
        # =================================================

        detections.append({

            "bean_id":
                total_count,


            # ---------------------------------------------
            # OLD FRONTEND COMPATIBILITY
            # ---------------------------------------------

            "class_id":
                FINAL_CLASS_IDS[
                    final_result
                ],

            "class_name":
                final_result,

            "confidence":
                display_confidence,


            # ---------------------------------------------
            # BOX
            # ---------------------------------------------

            "box": {

                "x1":
                    round(
                        raw_x1,
                        2,
                    ),

                "y1":
                    round(
                        raw_y1,
                        2,
                    ),

                "x2":
                    round(
                        raw_x2,
                        2,
                    ),

                "y2":
                    round(
                        raw_y2,
                        2,
                    ),
            },


            # ---------------------------------------------
            # DETECTOR
            # ---------------------------------------------

            "detector": {

                "class_id":
                    detector_class_id,

                "confidence":
                    round(
                        detector_confidence,
                        3,
                    ),
            },


            # ---------------------------------------------
            # COLOR AI
            # ---------------------------------------------

            "color": (
                color_result
            ),


            # ---------------------------------------------
            # SHAPE AI
            # ---------------------------------------------

            "shape": (
                shape_result
            ),

        })


        # =================================================
        # STEP 6 - DRAW RESULT
        # =================================================

        draw_bean_result(
            output_image,
            x1,
            y1,
            x2,
            y2,
            final_result,
            color_confidence,
            shape_confidence,
        )


    # =====================================================
    # STEP 7 - SUMMARY
    # =====================================================

    draw_summary(
        output_image,
        total_count,
        good_count,
        broken_count,
        black_count,
        black_broken_count,
    )


    # =====================================================
    # DEFECT COUNT
    # =====================================================

    total_defects = (
        broken_count
        +
        black_count
        +
        black_broken_count
    )


    # =====================================================
    # PERCENTAGES
    # =====================================================

    if total_count > 0:

        good_percentage = (
            good_count
            /
            total_count
        ) * 100


        defect_percentage = (
            total_defects
            /
            total_count
        ) * 100


    else:

        good_percentage = 0.0

        defect_percentage = 0.0


    # =====================================================
    # STEP 8 - SAVE OUTPUT IMAGE
    # =====================================================

    output_filename = (
        f"prediction_"
        f"{uuid.uuid4().hex}"
        f".jpg"
    )


    output_path = (
        PREDICTION_DIR
        / output_filename
    )


    success = cv2.imwrite(
        str(output_path),
        output_image,
    )


    if not success:

        raise RuntimeError(
            "Unable to save prediction image."
        )


    # =====================================================
    # TERMINAL SUMMARY
    # =====================================================

    print("\n========================================")

    print(
        "Image:",
        image_path,
    )

    print(
        "----------------------------------------"
    )

    print(
        "Total Beans        :",
        total_count,
    )

    print(
        "Good               :",
        good_count,
    )

    print(
        "Broken             :",
        broken_count,
    )

    print(
        "Black              :",
        black_count,
    )

    print(
        "Black and Broken   :",
        black_broken_count,
    )

    print(
        "Unknown            :",
        unknown_count,
    )

    print(
        "----------------------------------------"
    )

    print(
        "Saved:",
        output_path,
    )

    print(
        "========================================\n"
    )


    # =====================================================
    # STEP 9 - API RESPONSE
    # =====================================================

    return {

        "status":
            "success",


        # =================================================
        # COUNTS
        # =================================================

        "total_beans":
            total_count,

        "total_count":
            total_count,

        "good_count":
            good_count,

        "broken_count":
            broken_count,

        "black_count":
            black_count,

        "black_broken_count":
            black_broken_count,

        "unknown_count":
            unknown_count,


        # =================================================
        # QUALITY SUMMARY
        # =================================================

        "total_good":
            good_count,

        "total_defects":
            total_defects,

        "good_percentage":
            round(
                good_percentage,
                2,
            ),

        "defect_percentage":
            round(
                defect_percentage,
                2,
            ),


        # =================================================
        # OLD FRONTEND COMPATIBILITY
        # =================================================

        "defect_counts": {

            "broken":
                broken_count,

            "black":
                black_count,

            "black_and_broken":
                black_broken_count,

            "unknown":
                unknown_count,
        },


        # =================================================
        # COMPLETE CATEGORY COUNTS
        # =================================================

        "category_counts": {

            "good":
                good_count,

            "broken":
                broken_count,

            "black":
                black_count,

            "black_and_broken":
                black_broken_count,

            "unknown":
                unknown_count,
        },


        # =================================================
        # PER-BEAN AI RESULTS
        # =================================================

        "detections":
            detections,


        # =================================================
        # ANNOTATED IMAGE
        # =================================================

        "predicted_image_url": (
            "/static/"
            "predictions/"
            "beans/"
            f"{output_filename}"
        ),

    }