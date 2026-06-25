@echo off
echo ================================
echo   QUICK SETUP - FULL STACK
echo ================================
echo.

echo This will install all dependencies for both Backend and Frontend.
echo.
pause

REM Setup Backend
echo.
echo [1/2] Setting up Backend...
cd Backend
echo Installing Backend dependencies...
call npm install
echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please review and update if needed.
) else (
    echo .env already exists, skipping...
)
cd ..

REM Setup Frontend
echo.
echo [2/2] Setting up Frontend...
cd Frontend
echo Installing Frontend dependencies...
call npm install
cd ..

echo.
echo ================================
echo   SETUP COMPLETED!
echo ================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Review Backend/.env configuration
echo 3. Run Backend seed: cd Backend ^&^& npm run seed
echo 4. Start all services: start-all.bat
echo.
echo Or start services individually:
echo   Backend:  cd Backend ^&^& npm run dev
echo   Frontend: cd Frontend ^&^& npm run dev
echo.
pause
