@echo off
echo ================================
echo   FRONTEND - SETUP & START
echo ================================
echo.

cd Frontend

echo [1/2] Installing dependencies...
call npm install

echo.
echo [2/2] Starting development server...
call npm run dev
