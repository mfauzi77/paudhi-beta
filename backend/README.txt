===============================================================
SOP UPDATE BACKEND CERIA PAUD-HI (Integrasi OpenRouter Baru)
===============================================================

Tujuan Update:
Menyelesaikan isu error AI (ESM require dan Error 429 Too Many Requests dari Google) dengan memasang modul OpenRouter menggunakan metode Dynamic Import agar lebih aman di server.

LANGKAH 1: UPLOAD SOURCE CODE BHARU
Upload dan timpa file-file backend terbaru ke server Kemenko PMK. File yang paling krusial mengalami perubahan adalah:
- backend/routes/ai.js
- backend/config/aiConfig.js
- backend/deploy_update.sh (Script baru)

LANGKAH 2: EKSEKUSI INSTALASI LIBRARY OPENROUTER
Agar tidak merusak tatanan library yang sudah berjalan stabil di server, kita HANYA akan mengunduh satu library baru (@openrouter/sdk).

Cara Otomatis (Rekomendasi jika di Linux):
1. Masuk ke direktori backend (contoh: cd /var/www/paudhi/backend)
2. Jalankan perintah: sh deploy_update.sh 

Cara Manual:
Jika tidak ingin menggunakan script jalankan perintah di bawah ini pada direktori backend:
npm install @openrouter/sdk --no-audit --no-fund

LANGKAH 3: UPDATE ENVIRONMENT VARIABLE (.env)
Buka file .env pada folder backend di server production Kemenko PMK.
Edit dan pastikan variabel khusus untuk CERIA menggunakan API Key dari platform OpenRouter. 
Formatnya harus berawalan sk-or-:

CERIA_AI_KEY="sk-or-v1-xxxxxxxxxxxxxxxxx"

LANGKAH 4: RESTART LAYANAN (PM2)
Agar aplikasi Node.js membaca susunan kode terbaru, layanan service web WAJIB direstart.
Jalankan perintah restart pada PM2 (ganti nama-service sesuai yang berjalan):

pm2 restart nama-service-backend ATAU pm2 restart all

(Opsional) - Cek log untuk memastikan backend berhasil menyala tanpa error:
pm2 logs nama-service-backend
===============================================================
