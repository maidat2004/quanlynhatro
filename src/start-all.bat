@echo off
echo ================================
echo   QUAN LY NHA TRO - START ALL
echo ================================
echo.

REM Start Backend (Atlas DB - không cần mongod local)
echo.
echo [1/3] Starting Backend...
cd Backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > NUL

REM Wait for Backend to be ready
echo.
echo [2/3] Waiting for Backend to be ready...
timeout /t 5 /nobreak > NUL

REM Start Frontend
echo.
echo [3/3] Starting Frontend...
cd ..\Frontend
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo ================================
echo   ALL SERVICES STARTED!
echo ================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Admin Login:
echo   Email: admin@nhatro.com
echo   Password: admin123
echo.
echo Press any key to exit this window...
pause > NUL
