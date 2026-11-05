# Script PowerShell untuk sinkronisasi data JSON CERIA
Write-Host "Sinkronisasi data JSON CERIA..." -ForegroundColor Cyan

# Buat direktori public/data jika belum ada
if (!(Test-Path "public\data")) {
    New-Item -ItemType Directory -Path "public\data" -Force
    Write-Host "Membuat direktori public\data" -ForegroundColor Yellow
}

# Salin semua file JSON dari src ke public
$sourcePath = "src\components\ceria\components\data\*.json"
$destPath = "public\data\"

if (Test-Path $sourcePath) {
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    $fileCount = (Get-ChildItem $destPath -Filter "*.json").Count
    Write-Host "Data JSON berhasil disinkronisasi ke public\data\" -ForegroundColor Green
    Write-Host "Total file yang disalin: $fileCount" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "File yang disalin:" -ForegroundColor Yellow
    Get-ChildItem $destPath -Filter "*.json" | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor White }
    
    Write-Host ""
    Write-Host "CERIA sekarang menggunakan data dari:" -ForegroundColor Cyan
    Write-Host "   Source: src\components\ceria\components\data\" -ForegroundColor White
    Write-Host "   Runtime: public\data\" -ForegroundColor White
} else {
    Write-Host "Direktori source tidak ditemukan: $sourcePath" -ForegroundColor Red
}