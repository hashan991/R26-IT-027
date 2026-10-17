# Coffee Sales Backend Setup
# Run this file from PowerShell inside the backend folder:
# .\setup_backend.ps1

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Coffee Sales Backend Environment Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Check Python
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Python is not installed or not available in PATH." -ForegroundColor Red
    Write-Host "Install Python first, then run this file again."
    exit 1
}

# 2. Create virtual environment if it does not exist
if (-Not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "`nCreating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
else {
    Write-Host "`nVirtual environment already exists." -ForegroundColor Green
}

# 3. Allow activation for this PowerShell session only
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# 4. Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# 5. Upgrade pip
Write-Host "`nUpgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# 6. Install backend requirements
if (Test-Path ".\requirements_sales.txt") {
    Write-Host "`nInstalling requirements_sales.txt..." -ForegroundColor Yellow
    pip install -r requirements_sales.txt
}
elseif (Test-Path ".\requirements.txt") {
    Write-Host "`nrequirements_sales.txt not found. Installing requirements.txt instead..." -ForegroundColor Yellow
    pip install -r requirements.txt
}
else {
    Write-Host "`nNo requirements file found in this backend folder." -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " Setup completed successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Virtual environment is ready."
Write-Host "Starting FastAPI backend at http://127.0.0.1:8000"
Write-Host ""

# 7. Start backend
python -m uvicorn app.main:app --reload
