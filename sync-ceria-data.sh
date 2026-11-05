#!/bin/bash
# Script untuk sinkronisasi data JSON dari src ke public
# Jalankan script ini setiap kali ada perubahan data JSON

echo "🔄 Sinkronisasi data JSON CERIA..."

# Buat direktori public/data jika belum ada
mkdir -p public/data

# Salin semua file JSON dari src ke public
cp src/components/ceria/components/data/*.json public/data/

echo "✅ Data JSON berhasil disinkronisasi ke public/data/"
echo "📁 File yang disalin:"
ls -la public/data/*.json | wc -l | xargs echo "   - Total file:"
ls public/data/*.json | sed 's/.*\///' | sed 's/^/   - /'

echo ""
echo "🚀 CERIA sekarang menggunakan data dari:"
echo "   Source: src/components/ceria/components/data/"
echo "   Runtime: public/data/"

