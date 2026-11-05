# Penyimpanan analisis CERIA

Untuk membatasi biaya keluaran saat mengisi cache, skrip mendukung
`--max-output-tokens=1000` (rentang 500–4000). Ini hanya berlaku pada permintaan
baru dalam antrean lokal. Respons OpenRouter dengan `finishReason=length`
ditolak agar hasil terpotong tidak disimpan sebagai analisis lengkap.

## Pengisian awal bertahap

Jalankan dari root proyek: `node backend/scripts/precomputeCeria.mjs`.
Antrean memakai fungsi prompt aplikasi yang sama dan mencakup 49 kombinasi data
2025: lima ringkasan dashboard, satu alert, 38 wilayah (juga dipakai laporan
wilayah), empat skenario forecasting, dan satu laporan perbandingan domain.
Pengasuhan belum memiliki data. Input bebas pengguna (chat, unggahan baru, feedback, skenario khusus)
tidak bisa diisi sebelumnya untuk semua kemungkinan.

Untuk arsip **2024**, gunakan:

```
node backend/scripts/precomputeCeria.mjs --year=2024 --max-output-tokens=1000
node backend/scripts/precomputeCeria.mjs --year=2024 --verify
```

Antrean 2024 berisi 47 pekerjaan: lima dashboard, tiga alert, 38 wilayah,
dan satu laporan perbandingan domain. Progres terpisah di
`.local/ceria-precompute/2024/progress.json`. Menjalankan ulang melanjutkan
dari cache; tidak meminta ulang hasil yang sudah tersimpan.

Browser dan batch memakai adapter `year2024.ts` yang sama, langsung dari
`public/data/ceria_aggregated.json`. Tidak menggunakan generator acak
`mockData.ts`, angka nasional hardcoded, atau nilai hilang sebagai nol.
Sumber asli/tahun pengamatan arsip belum diverifikasi. Tabel parsial lama
akreditasi, guru, kasus perlindungan, dan populasi belum dimasukkan ke adapter.
Pengasuhan, forecasting 2024, laporan bulanan, serta alokasi sumber daya
tidak dihasilkan tanpa data pendukung. Angka nasional tidak disimpulkan dari
rata-rata sederhana provinsi.

Antrean menjalankan satu permintaan baru dengan jeda minimal 20 detik. Cache dicek
lebih dulu tanpa memanggil provider. Jika provider memberi HTTP 402/429 dengan
Retry-After maksimal 600 detik, antrean menunggu minimal 120 detik lalu mencoba
ulang sekali. Jika tetap gagal, atau penyimpanan database gagal, antrean berhenti.
Jalankan ulang untuk melanjutkan: hasil yang sudah tersimpan dibaca tanpa biaya AI.
Catatan progres ada di `.local/ceria-precompute/progress.json`.
Untuk verifikasi tanpa izin memanggil provider, jalankan
`node backend/scripts/precomputeCeria.mjs --verify`. Proses berhenti jika ada
pilihan yang belum tersimpan; hasilnya ada di `verification.json`.

Untuk memindahkan hasil ke hosting:

```
node backend/scripts/transferCeriaCache.cjs export .local/ceria-precompute/cache.json
```

Salin file backup secara privat ke server tujuan, lalu jalankan dengan konfigurasi
PostgreSQL server tujuan:

```
node backend/scripts/transferCeriaCache.cjs import /path/ke/cache.json
```

Gunakan kode prompt, data, model dan instruksi sistem yang sama agar kunci cache
cocok. Simpan backup di luar direktori publik website.

Untuk website publik yang hanya menyajikan analisis sebelumnya, atur
`CERIA_CACHE_ONLY=true` di environment backend hosting dan restart backend.
Permintaan cache-miss kemudian tidak memanggil provider. Skrip precompute lokal
tetap diizinkan mengisi cache. Tanpa pengaturan ini, perilaku default tetap
cache-first dengan pemanggilan AI untuk input yang belum disimpan.

Antarmuka browser CERIA sekarang mengirim `cacheOnly: true` pada permintaan AI,
sehingga semua menu hanya membaca hasil siap pakai. Pilihan yang belum tersimpan
menampilkan keterangan dan tidak memanggil provider. Flag ini tidak menjadi bagian
dari kunci cache, sehingga 49 hasil yang telah disiapkan tetap cocok. Restart
backend setelah memperbarui route agar pengaturan per permintaan ini berlaku.

Semua permintaan CERIA melalui `/api/ai/generate` menyimpan respons sukses ke
PostgreSQL, tabel `ceria_analysis_cache`. Tabel dibuat otomatis saat pertama
digunakan; akun database membutuhkan izin CREATE TABLE. Kegagalan cache tidak
menghalangi pemanggilan AI.

Kunci SHA-256 mencakup isi permintaan, konfigurasi respons, model, instruksi
sistem, dan tools. Tahun/wilayah/data yang berubah dalam prompt mendapatkan
hasil terpisah. Hasil tersimpan dibaca sebelum memanggil provider, termasuk saat
kunci provider tidak tersedia. Tidak ada kedaluwarsa otomatis untuk hasil di
database; perubahan input menghasilkan kunci baru. Respons kosong dan JSON yang
tidak valid tidak disimpan. Candidates/sumber respons ikut disimpan.

Browser menyimpan hingga 100 respons terakhir di localStorage sebagai cadangan
per origin dan perangkat. Cache browser tidak ikut pindah ketika mengganti domain
atau mengunggah source code. Cache browser juga tidak menggantikan hosting berkas
aplikasi jika website sendiri tidak dapat dibuka.

Saat deployment, gunakan database persisten yang sama atau pindahkan tabel ini
bersama backup database. Upload source code saja tidak memindahkan hasil lama.
Hasil dari sebelum fitur ini dibuat tidak otomatis masuk ke tabel; jalankan
analisis yang dibutuhkan setidaknya sekali. Data yang belum pernah dianalisis
tetap membutuhkan layanan AI. Restart backend setelah memperbarui kode.

Cache memuat teks analisis; perlakukan backup sebagai data aplikasi dan gunakan
kontrol akses database yang sama seperti data lainnya. Jangan commit backup
hasil analisis ke repository publik.
