# Tindak lanjut keamanan deployment

Perubahan kode tidak mengganti sertifikat atau rahasia server yang sedang aktif.

1. `srv/ssl/server.key` pernah dilacak Git. Identifikasi sertifikat/lingkungan yang memakai key tersebut; buat private key baru dan terbitkan ulang sertifikat melalui pengelola TLS. Jangan memakai kembali key lama.
2. File key, sertifikat, dan backup database dikeluarkan dari index Git tetapi salinan lokal dipertahankan. Riwayat commit dan clone lama masih dapat memuat file tersebut. Tinjau akses repositori dan isi backup secara privat; rotasi rahasia yang ditemukan. Pembersihan history memerlukan koordinasi semua pemilik clone sebelum force push.
3. Simpan key aktif di secret store atau `/etc/ssl/kemenkopmk/` dengan akses terbatas, di luar checkout. Jangan menyalin backup ke direktori web.
4. Jalankan `npm ci --omit=dev` di backend saat deployment; sharp harus tersedia untuk platform server. Unggahan JPEG/PNG/GIF/WebP divalidasi, diubah ke WebP, maksimum 5 MB/berkas dan 25 juta piksel. GIF menjadi gambar statis.
5. Proxy tepercaya default adalah loopback. Bila reverse proxy ada di host/container lain, isi TRUST_PROXY dengan alamat/subnet proxy yang tepat dan blok akses langsung backend. Jangan gunakan true secara umum.
6. Verifikasi HTTPS, redirect HTTP, masa berlaku sertifikat, dan header keamanan di server aktual setelah deployment.
7. File lama tanpa prefix pemilik hanya dapat dikelola melalui API file oleh admin/super_admin. Pengguna lain dapat mengunggah dan mengelola file baru miliknya.

Pengujian otomatis memakai database tiruan dan file fixture sementara; tidak menguji atau mengubah produksi.

Frontend dan backend kini membutuhkan Node.js >=22. Saat pengembangan backend gunakan `npm run dev` (watcher bawaan Node). Penghapusan dependency frontend xlsx tidak menghapus fitur impor/ekspor: kode frontend tidak mengimpornya, dan pemrosesan Excel backend tetap menggunakan ExcelJS. Audit npm adalah pemeriksaan advisory dependency, bukan jaminan keamanan menyeluruh.

Pemeriksaan lanjutan menemukan `.env` dan `backend/.env` juga terlacak Git. Keduanya dikeluarkan dari index tanpa mengubah nilai atau menghapus file lokal. Tinjau dan rotasi kredensial aktif yang pernah disimpan di dalamnya; jangan menyalin nilainya ke laporan atau log.
