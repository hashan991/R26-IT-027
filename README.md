# Smart Coffee Manufacturing: End-to-End Quality Control from Bean to Pack

## Project Overview

**Smart Coffee Manufacturing: End-to-End Quality Control from Bean to Pack** is an AI-powered quality control and decision-support platform designed for the coffee manufacturing industry.

The system focuses on improving coffee production quality from the raw coffee bean stage to the final packed product. It integrates multiple AI-based components to support raw coffee bean quality identification, coffee powder batch quality evaluation, real-time packaging quality detection, and market suitability prediction.

By combining computer vision, machine learning, and a modular web-based architecture, this platform helps coffee manufacturers reduce manual inspection effort, improve production quality, maintain batch-level quality records, and support better decision-making throughout the coffee manufacturing process.

---

## Main Objective

The main objective of this project is to develop an end-to-end AI-based smart coffee manufacturing system that supports quality control from raw coffee beans to final packaging while also predicting the market suitability of coffee products.

---

## Sub Functions

### 1. Develop an Algorithm to Identify Quality of Raw Coffee Bean

This component focuses on identifying the quality of raw coffee beans using AI-based image processing and object detection techniques.

The system analyzes uploaded coffee bean images and detects visible defects such as black beans, broken beans, fungus-affected beans, and insect-damaged beans. A trained object detection model is used to identify defect types, count detected defects, and generate annotated output images.

#### Main Features

- Upload raw coffee bean images
- Detect defective coffee beans using AI
- Identify different defect categories
- Count detected defects
- Generate annotated prediction images
- Store detection results for future reference

#### Expected Output

- Detected defect types
- Defect count
- Confidence values
- Annotated image with bounding boxes
- Raw bean quality identification result

---

### 2. Evaluate Coffee Powder Quality in Every Batch

This component focuses on evaluating coffee powder quality in every production batch.

The system can support quality checking based on coffee powder characteristics such as moisture level, color consistency, texture, and granulation uniformity. This helps ensure that each batch of coffee powder maintains the required quality level before moving to the packaging stage.

#### Main Features

- Evaluate coffee powder quality batch by batch
- Analyze powder quality characteristics
- Support moisture, color, and granulation-based quality checks
- Identify abnormal quality variations
- Store batch-level quality results

#### Expected Output

- Powder quality status
- Batch quality result
- Moisture-related analysis
- Color consistency result
- Granulation or particle uniformity result

---

### 3. Develop a System for Real-Time Packaging Quality Detection

This component focuses on detecting packaging defects in real time before the final coffee product is released.

The system uses AI-based visual inspection to identify packaging-related quality issues such as seal defects, improper sealing, damaged packaging, and other visible packaging failures. This helps prevent defective coffee packets from reaching customers.

#### Main Features

- Detect packaging quality issues
- Identify packet seal defects
- Support real-time inspection workflow
- Generate packaging defect results
- Store packaging inspection history
- Improve final product quality assurance

#### Expected Output

- Packaging defect detection result
- Seal quality status
- Defect location in the package image
- Annotated image output
- Packaging inspection history

---

### 4. Develop an Algorithm for Predicting Market Suitability

This component focuses on predicting the market suitability of coffee products based on quality-related and business-related factors.

The system can analyze product quality data, production results, defect levels, and market-related inputs to predict whether a coffee product is suitable for the intended market. This helps manufacturers make better decisions about product release, pricing, production planning, and market targeting.

#### Main Features

- Analyze product quality and business-related data
- Predict market suitability
- Support production and sales decision-making
- Identify suitable market categories
- Provide data-driven product suitability insights

#### Expected Output

- Market suitability prediction
- Product suitability status
- Decision-support result
- Market category prediction
- Prediction history

---

## System Components

The complete system consists of four major AI components:

| No | Component | Description |
|---|---|---|
| 1 | Raw Coffee Bean Quality Identification | Detects raw coffee bean defects and identifies bean quality |
| 2 | Coffee Powder Quality Evaluation | Evaluates powder quality in every production batch |
| 3 | Real-Time Packaging Quality Detection | Detects packet seal and packaging defects |
| 4 | Market Suitability Prediction | Predicts whether the coffee product is suitable for the market |

---

## Technology Stack

### Frontend

- React.js
- Vite
- Axios
- React Router DOM
- CSS / UI components

### Backend

- Python
- FastAPI
- Uvicorn
- OpenCV
- Ultralytics YOLO
- Python Dotenv
- Motor / PyMongo

### Database

- MongoDB
- MongoDB Atlas support

### AI / Machine Learning

- YOLO object detection models
- Machine learning prediction models
- Image processing techniques
- Data-driven prediction algorithms

---

## System Architecture

```text
User
 |
 | Upload image / enter production or market data
 v
React Frontend
 |
 | API Request
 v
FastAPI Backend
 |
 | Module Router
 v
AI / ML Processing Service
 |
 | Detection / Evaluation / Prediction
 v
MongoDB Database
 |
 | Save Result and History
 v
Frontend Result Display
```

---

## Project Folder Structure

```text
coffee-quality-ai-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   │
│   │   ├── auth/
│   │   │
│   │   ├── common/
│   │   │
│   │   ├── core/
│   │   │
│   │   ├── modules/
│   │   │   ├── bean_defect_detection/
│   │   │   │   ├── routes.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schema.py
│   │   │   │   ├── crud.py
│   │   │   │   └── README.md
│   │   │   │
│   │   │   ├── powder_quality_checking/
│   │   │   │   ├── routes.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schema.py
│   │   │   │   ├── crud.py
│   │   │   │   └── README.md
│   │   │   │
│   │   │   ├── packet_seal_detection/
│   │   │   │   ├── routes.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schema.py
│   │   │   │   ├── crud.py
│   │   │   │   └── README.md
│   │   │   │
│   │   │   └── market_suitability_prediction/
│   │   │       ├── routes.py
│   │   │       ├── service.py
│   │   │       ├── schema.py
│   │   │       ├── crud.py
│   │   │       └── README.md
│   │   │
│   │   └── static/
│   │       ├── uploads/
│   │       │   ├── beans/
│   │       │   ├── powder/
│   │       │   ├── packaging/
│   │       │   └── market/
│   │       │
│   │       ├── predictions/
│   │       │   ├── beans/
│   │       │   ├── powder/
│   │       │   ├── packaging/
│   │       │   └── market/
│   │       │
│   │       └── reports/
│   │           ├── beans/
│   │           ├── powder/
│   │           ├── packaging/
│   │           └── market/
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── layouts/
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── utils/
│   │   │
│   │   ├── features/
│   │   │   ├── bean-defect-detection/
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── powder-quality-checking/
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── packet-seal-detection/
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   │
│   │   │   └── market-suitability-prediction/
│   │   │       ├── pages/
│   │   │       ├── components/
│   │   │       └── services/
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── models/
│   ├── bean_defect_detection/
│   ├── powder_quality_checking/
│   ├── packet_seal_detection/
│   └── market_suitability_prediction/
│
├── datasets/
│   ├── bean_defect_detection/
│   ├── powder_quality_checking/
│   ├── packet_seal_detection/
│   └── market_suitability_prediction/
│
├── docs/
│   ├── project_overview.md
│   ├── api_documentation.md
│   ├── git_workflow.md
│   ├── member_tasks.md
│   └── system_architecture.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## Module Responsibilities

| Member | Sub Function | Backend Module | Frontend Feature | Model Folder |
|---|---|---|---|---|
| Member 1 | Raw Coffee Bean Quality Identification | `bean_defect_detection` | `bean-defect-detection` | `bean_defect_detection` |
| Member 2 | Coffee Powder Quality Evaluation | `powder_quality_checking` | `powder-quality-checking` | `powder_quality_checking` |
| Member 3 | Real-Time Packaging Quality Detection | `packet_seal_detection` | `packet-seal-detection` | `packet_seal_detection` |
| Member 4 | Market Suitability Prediction | `market_suitability_prediction` | `market-suitability-prediction` | `market_suitability_prediction` |

---

## Backend Module Pattern

Each backend AI module should follow this structure:

```text
module_name/
├── routes.py
├── service.py
├── schema.py
├── crud.py
└── README.md
```

### Backend File Responsibilities

| File | Purpose |
|---|---|
| `routes.py` | Defines API endpoints for the module |
| `service.py` | Contains AI/ML model loading and prediction logic |
| `schema.py` | Defines request and response data structures |
| `crud.py` | Handles database create, read, update, and delete operations |
| `README.md` | Explains the module-specific logic and usage |

---

## Frontend Feature Pattern

Each frontend feature should follow this structure:

```text
feature-name/
├── pages/
├── components/
└── services/
```

### Frontend Folder Responsibilities

| Folder | Purpose |
|---|---|
| `pages/` | Main screens/pages displayed to the user |
| `components/` | Reusable UI components for that feature |
| `services/` | API call functions for communicating with backend endpoints |

---

## Main API Endpoints

### Raw Coffee Bean Quality Identification

```text
POST /api/beans/predict
GET  /api/beans/history
GET  /api/beans/history/{id}
```

### Coffee Powder Quality Evaluation

```text
POST /api/powder/check-quality
GET  /api/powder/history
GET  /api/powder/history/{id}
```

### Real-Time Packaging Quality Detection

```text
POST /api/packaging/detect
GET  /api/packaging/history
GET  /api/packaging/history/{id}
```

### Market Suitability Prediction

```text
POST /api/market/predict
GET  /api/market/history
GET  /api/market/history/{id}
```

---

## Database Collections

The system uses MongoDB to store prediction and quality evaluation results.

Recommended database name:

```text
coffee_manufacturing_ai
```

Recommended collections:

```text
coffee_manufacturing_ai
├── bean_quality_results
├── powder_quality_results
├── packaging_quality_results
├── market_suitability_results
├── users
└── reports
```

---

## Expected System Outputs

The final system is expected to provide:

- Raw coffee bean defect detection results
- Coffee powder batch quality evaluation results
- Real-time packaging defect detection results
- Market suitability prediction results
- Prediction history
- Quality inspection records
- Annotated output images
- Dashboard-based result visualization
- Future report generation support

---

## How to Run the Project

### Backend

Go to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI backend server:

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

Go to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend `.env`

Create a `.env` file inside the `backend/` folder and add:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=coffee_manufacturing_ai
```

Important:

- Do not push the real `.env` file to GitHub.
- Do not expose MongoDB usernames or passwords.
- Use `.env.example` to share environment variable names with team members.

### Backend `.env.example`

```env
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=coffee_manufacturing_ai
```

---

### Frontend `.env`

Create a `.env` file inside the `frontend/` folder and add:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Frontend `.env.example`

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## AI Model Storage

AI and machine learning model files should be stored in the `models/` folder.

```text
models/
├── bean_defect_detection/
│   └── best.pt
├── powder_quality_checking/
│   └── best.pt
├── packet_seal_detection/
│   └── best.pt
└── market_suitability_prediction/
    └── market_model.pkl
```

Important:

- Large model files may exceed GitHub size limits.
- Use Git LFS if model files must be version controlled.
- Otherwise, store large model files in cloud storage and document the download link.

---

## Dataset Storage

Datasets should not be pushed directly to GitHub if they are large.

Recommended dataset folder structure:

```text
datasets/
├── bean_defect_detection/
├── powder_quality_checking/
├── packet_seal_detection/
└── market_suitability_prediction/
```

For shared datasets, add dataset links inside the `docs/` folder.

---

## Git Workflow

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd coffee-quality-ai-platform
```

### 2. Create a Feature Branch

Each member should work on their own branch.

```bash
git checkout -b feature/your-module-name
```

Examples:

```bash
git checkout -b feature/bean-defect-detection
git checkout -b feature/powder-quality-checking
git checkout -b feature/packet-seal-detection
git checkout -b feature/market-suitability-prediction
```

### 3. Work Only Inside Assigned Folders

Example for Coffee Bean Quality Identification:

```text
backend/app/modules/bean_defect_detection/
frontend/src/features/bean-defect-detection/
models/bean_defect_detection/
```

Example for Coffee Powder Quality Evaluation:

```text
backend/app/modules/powder_quality_checking/
frontend/src/features/powder-quality-checking/
models/powder_quality_checking/
```

Example for Packaging Quality Detection:

```text
backend/app/modules/packet_seal_detection/
frontend/src/features/packet-seal-detection/
models/packet_seal_detection/
```

Example for Market Suitability Prediction:

```text
backend/app/modules/market_suitability_prediction/
frontend/src/features/market-suitability-prediction/
models/market_suitability_prediction/
```

### 4. Commit Changes

```bash
git add .
git commit -m "Add module feature"
```

### 5. Push Branch

```bash
git push origin feature/your-module-name
```

### 6. Create Pull Request

Create a Pull Request from the feature branch to the `main` branch.

---

## Git Conflict Prevention Rules

To reduce merge conflicts:

- Each member should work only inside their assigned backend module and frontend feature folder.
- Common files should be edited carefully.
- One member should manage common routing and sidebar updates.
- Do not commit `.env`, `node_modules`, `venv`, datasets, or temporary prediction outputs.
- Pull latest changes before starting new work.

Common files that may create conflicts:

```text
backend/app/main.py
frontend/src/routes/AppRoutes.jsx
frontend/src/shared/components/Sidebar.jsx
frontend/src/App.jsx
```

---

## Recommended `.gitignore`

```gitignore
# Python
__pycache__/
*.pyc
backend/venv/
.env
backend/.env
frontend/.env

# React
frontend/node_modules/
frontend/dist/

# Backend generated files
backend/app/static/uploads/*
backend/app/static/predictions/*
backend/app/static/reports/*

# Keep static folder structure
!backend/app/static/uploads/
!backend/app/static/uploads/*/
!backend/app/static/uploads/*/.gitkeep

!backend/app/static/predictions/
!backend/app/static/predictions/*/
!backend/app/static/predictions/*/.gitkeep

!backend/app/static/reports/
!backend/app/static/reports/*/
!backend/app/static/reports/*/.gitkeep

# Datasets
datasets/

# Training outputs
runs/
wandb/

# OS files
.DS_Store
Thumbs.db
```

---

## Current Development Status

### Completed

- Project folder structure
- FastAPI backend skeleton
- React frontend skeleton
- Coffee bean image upload API
- YOLO model integration for bean defect detection
- Annotated image generation
- Defect count extraction
- MongoDB connection setup
- Prediction result saving
- Basic frontend upload page



## Future Enhancements

The following improvements can be added in future development:

- User authentication and role-based access control
- Advanced quality grading
- Defect-based production recommendations
- PDF quality report generation
- Real-time dashboard analytics
- Batch tracking system
- Production profile prediction
- Model performance monitoring
- Cloud deployment
- Docker-based deployment

---

## Project Purpose

The purpose of this project is to provide a smart AI-based solution for coffee manufacturers to monitor and improve product quality throughout the production process.

The system supports decision-making from raw bean quality checking to coffee powder evaluation, packaging inspection, and market suitability prediction.

---

## License

This project is developed for academic and research purposes.