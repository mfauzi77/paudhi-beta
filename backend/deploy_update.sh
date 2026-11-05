#!/bin/bash
# ==========================================
# Script Instalasi Update PAUD HI Backend
# ==========================================

echo "🚀 Memulai proses update dependensi backend PAUD HI..."

# Pindah ke direktori tempat script ini berada (folder backend)
cd "$(dirname "$0")"

echo "📦 Menjalankan proses 'npm install'..."
echo "⏳ Mohon tunggu, ini akan mengunduh paket terbaru termasuk OpenRouter..."

# Paksa instalasi pustaka OpenRouter saja agar tidak menyentuh versi library lain
npm install @openrouter/sdk --no-audit --no-fund

if [ $? -eq 0 ]; then
   echo ""
   echo "✅ INSTALASI BERHASIL!"
   echo "Library @openrouter/sdk dan library lainnya sudah terpasang."
   echo "--------------------------------------------------------"
else
   echo ""
   echo "❌ INSTALASI GAGAL!"
   echo "Terjadi kesalahan saat menjalankan npm install. Periksa log di atas."
fi
