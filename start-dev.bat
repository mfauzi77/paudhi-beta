@echo off
echo 🚀 Starting PAUD HI SISMONEV Development Environment...

echo.
echo 📋 Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB service not found. Please start MongoDB manually.
    echo    Run: mongod --dbpath "C:\data\db"
    pause
    exit /b 1
)
echo ✅ MongoDB is running

echo.
echo 📋 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo.
echo 📋 Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Development environment started!
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo.
pause
