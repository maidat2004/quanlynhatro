@echo off
echo ================================
echo   BACKEND - SETUP & START
echo ================================
echo.

cd Backend

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Running seed data...
call npm run seed

echo.
echo [3/3] Starting development server...
call npm run dev
