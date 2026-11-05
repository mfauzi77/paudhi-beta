@echo off
:: Pindah ke direktori tempat file .bat ini berada
cd /d "%~dp0"

echo Starting Frontend...
start cmd /k "npm run dev"

echo Menunggu 5 detik sebelum menjalankan Backend...
timeout /t 5 /nobreak >nul

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Membuka Google Chrome...
timeout /t 2 /nobreak >nul
start chrome "http://localhost:5173"

echo Selesai! Kedua server sedang berjalan...
