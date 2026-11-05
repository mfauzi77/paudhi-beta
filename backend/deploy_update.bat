@echo off
title Script Instalasi Update PAUD HI Backend
echo ==========================================
echo Script Instalasi Update PAUD HI Backend
echo ==========================================
echo.

echo [INFO] Memulai proses update dependensi backend PAUD HI...

:: Pindah ke direktori tempat script ini berada (folder backend)
cd /d "%~dp0"

echo [INFO] Menjalankan proses 'npm install'...
echo [INFO] Mohon tunggu, ini akan mengunduh paket terbaru termasuk OpenRouter...
echo.
call npm install @openrouter/sdk --no-audit --no-fund

if %ERRORLEVEL% EQU 0 (
   echo.
   echo [SUCCESS] INSTALASI BERHASIL!
   echo Library @openrouter/sdk dan library lainnya sudah terpasang.
   echo --------------------------------------------------------
   echo TINDAKAN SELANJUTNYA UNTUK TIM DEPLOY:
   echo 1. Pastikan file .env sudah berisikan API Key yang valid.
   echo 2. Restart service Node.js/PM2 Anda sekarang.
   echo    Contoh perintah: pm2 restart nama-aplikasi
   echo --------------------------------------------------------
) else (
   echo.
   echo [ERROR] INSTALASI GAGAL!
   echo Terjadi kesalahan saat menjalankan npm install. Periksa log di atas.
)

echo.
pause
