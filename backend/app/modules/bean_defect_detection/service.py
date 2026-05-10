from pathlib import Path
from ultralytics import YOLO
import cv2
import uuid

# Project paths
CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[4]
BACKEND_DIR = PROJECT_ROOT / "backend"

MODEL_PATH = PROJECT_ROOT / "models" / "bean_defect_detection" / "best.pt"
PREDICTION_DIR = BACKEND_DIR / "app" / "static" / "predictions" / "beans"

PREDICTION_DIR.mkdir(parents=True, exist_ok=True)

# Load YOLO model one time
model = YOLO(str(MODEL_PATH))


def predict_bean_image(image_path: str):
    """
    Predict coffee bean defects using YOLO model.
    """

    results = model.predict(
        source=image_path,
        conf=0.25,
        imgsz=640,
        save=False
    )

    result = results[0]

    # Save annotated image
    output_filename = f"prediction_{uuid.uuid4().hex}.jpg"
    output_path = PREDICTION_DIR / output_filename

    annotated_image = result.plot()
    cv2.imwrite(str(output_path), annotated_image)

    detections = []
    defect_counts = {}

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = model.names[class_id]

        x1, y1, x2, y2 = box.xyxy[0].tolist()

        detections.append({
            "class_id": class_id,
            "class_name": class_name,
            "confidence": round(confidence, 3),
            "box": {
                "x1": round(x1, 2),
                "y1": round(y1, 2),
                "x2": round(x2, 2),
                "y2": round(y2, 2)
            }
        })

        defect_counts[class_name] = defect_counts.get(class_name, 0) + 1

    total_defects = len(detections)

    return {
        "status": "success",
        "total_defects": total_defects,
        "defect_counts": defect_counts,
        "detections": detections,
        "predicted_image_url": f"/static/predictions/beans/{output_filename}"
    }