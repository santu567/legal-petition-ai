@echo off
echo Starting LegalAI...

:: Start Backend
start "LegalAI Backend" cmd /k "cd /d D:\Court_petition_decision\backend && C:\Users\hp\anaconda3\Scripts\activate.bat legal-ai && set CUDA_VISIBLE_DEVICES=-1 && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 5 seconds for backend to load
timeout /t 5

:: Start Frontend
start "LegalAI Frontend" cmd /k "cd /d D:\Court_petition_decision\frontend && npm start"

echo Both servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000