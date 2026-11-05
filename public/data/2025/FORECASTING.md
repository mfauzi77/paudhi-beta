# Forecasting CERIA 2025

Menu Forecasting & Prediction memakai layout yang sama untuk 2024 dan 2025. Implementasi 2024 tetap merupakan simulasi lama. Pada 2025, proyeksi deterministik memakai data dasar `ceria_aggregated.json` sebagai 2024 dan tabel pengguna pada folder 2025.

## Cakupan sementara

- Kesehatan & Gizi: stunting, wasting, underweight, IDL, dan K4.
- Perlindungan: kepemilikan akta kelahiran dan perkawinan anak.
- Pendidikan, Pengasuhan, serta Kesejahteraan Sosial belum diproyeksikan: definisi, populasi, atau pasangan indikator belum cukup jelas. Jumlah korban tidak dipasangkan dengan jumlah kasus.

Pemetaan ini berdasar nama indikator; kesetaraan metodologi, kelompok usia, dan tahun pengamatan masih perlu verifikasi. Hasil diberi label **skenario sementara**, bukan ramalan tervalidasi. Catatan bintang pada gizi Papua Tengah/Papua Pegunungan belum dijelaskan sumbernya.

## Perhitungan

Untuk setiap provinsi dan bidang, gunakan hanya indikator yang memiliki angka sah pada kedua tahun. `null`, `NA`, dan `-` tidak menjadi nol; nol eksplisit tetap dipakai. Skor indikator adalah nilai persentase untuk indikator negatif, atau `100 − nilai` untuk indikator positif. Rata-ratakan indikator berpasangan dengan bobot sama pada kedua tahun.

`Proyeksi(h) = batas_0_100(skor2025 + (skor2025 − skor2024) × h / 12)`

Horizon `h` adalah 3 atau 6 bulan setelah titik data 2025, bukan setelah tanggal hari ini. Tidak ada bulan pengamatan yang diasumsikan. Rata-rata grafik menggunakan kelompok provinsi yang sama, tanpa pembobotan populasi. Skor ini dapat berbeda dari dashboard yang memakai indikator lebih banyak.

Grafik hanya memuat titik 2024, 2025, dan proyeksi horizon terpilih dengan jarak waktu proporsional. Tidak ada rentang keyakinan atau seri bulanan buatan. AI menjelaskan hasil hitungan dan keterbatasannya; AI tidak menghasilkan angka proyeksi.
