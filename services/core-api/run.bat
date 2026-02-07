@echo off
REM Quick start script for the backend (Windows)

echo Starting SigmaChain Backend...
echo Make sure you have:
echo 1. Created a virtual environment
echo 2. Installed dependencies (pip install -r requirements.txt)
echo 3. Created a .env file with your API keys
echo.
echo Starting server on http://localhost:8000
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

