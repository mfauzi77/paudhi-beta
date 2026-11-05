# Mapping Dataset CERIA 2025

Urutan mengikuti 15 kelompok pada matriks pengguna. Tersimpan 13 dataset: 7 kelompok tersedia, 6 sebagian, dan 2 belum ada. Status menunjukkan cakupan tabel yang diberikan, bukan verifikasi sumber atau integrasi aplikasi.

Seluruh 13 dataset terhubung ke pilihan tahun 2025 pada dashboard CERIA. Dataset disaring menurut bidang sebelum dikirim ke AI. Nama instansi dan platform di bawah mengikuti matriks, bukan bukti pengambilan melalui API.

| No. | Kementerian/Lembaga | Platform/API dalam matriks | Kebutuhan matriks | File | Status | Isi tersedia / kekurangan |
|---|---|---|---|---|---|---|
| 1 | Kementerian Kesehatan (Kemenkes) | SatuSehat | Imunisasi (IDL per desa/kecamatan) | [imunisasi_idl.json](./imunisasi_idl.json) | Sebagian | IDL tingkat provinsi menurut perkotaan/perdesaan. Rincian desa/kecamatan belum tersedia; 2 nilai kosong. |
| 2 | Kementerian Kesehatan (Kemenkes) | SatuSehat | Gizi (stunting, wasting, underweight) | [gizi.json](./gizi.json) | Tersedia | Stunting, wasting, underweight. Keterangan tanda * pada 2 nilai stunting belum tersedia. |
| 3 | Kementerian Kesehatan (Kemenkes) | SatuSehat | KIA (Kunjungan Antenatal K4, persalinan, AKB & AKI) | [kia.json](./kia.json) | Sebagian | Kunjungan K4. Persalinan, AKB, AKI belum tersedia; K4 di 2 provinsi kosong. |
| 4 | Kementerian Kesehatan (Kemenkes) | SatuSehat | Penyakit (diare & ISPA balita) | [penyakit.json](./penyakit.json) | Tersedia | ISPA (Gejala), Diare (Gejala). Pertahankan definisi berbasis gejala. |
| 5 | Kemendikbudristek | Dapodik (sesuai matriks; sumber belum diverifikasi) | Partisipasi PAUD (APM & APK) | [apk_apm_pendidikan.json](./apk_apm_pendidikan.json) | Tersedia | APK/APM PAUD tahun ajaran 2025/2026. SD–SMA/SM sebagai pendukung. APM > APK pada sejumlah baris perlu verifikasi; belum masuk skor risiko/forecasting. [Partisipasi lama](./partisipasi_paud.json) dipertahankan. |
| 6 | Kemendikbudristek | Dapodik | Satuan PAUD (jumlah lembaga, status akreditasi, rasio guru-murid) | [satuan_paud.json](./satuan_paud.json) | Sebagian | Jumlah TK sederajat, KB sederajat, TPA, SPS. Akreditasi dan rasio guru-murid belum tersedia; Luar Negeri terpisah. |
| 7 | Kemendikbudristek | Dapodik | Kualitas Guru (kualifikasi akademik guru PAUD) | [kualifikasi_guru_paud.json](./kualifikasi_guru_paud.json) | Tersedia | Persentase Layak (≥ S1). Jumlah guru tidak diberikan; label ≥ S1 dipertahankan. |
| 8 | Kemendagri | API Kependudukan Dukcapil | Identitas Anak (persentase kepemilikan Akta Kelahiran) | [akta_kelahiran.json](./akta_kelahiran.json) | Tersedia | Kepemilikan akta, perkotaan/perdesaan/total. Perdesaan DKI Jakarta kosong; batas usia belum tersedia. |
| 9 | KemenPPPA | SIMFONI PPA | Kasus Kekerasan (laporan kasus kekerasan terhadap anak) | [kekerasan_anak.json](./kekerasan_anak.json) | Sebagian | Jumlah korban kekerasan terhadap anak. Korban tidak sama dengan kasus; jumlah kasus belum diberikan. |
| 10 | BPS | BPS Open Data | Sosial-Ekonomi (kemiskinan & IPM) | [kemiskinan.json](./kemiskinan.json) | Sebagian | Kemiskinan Maret dan September 2025. IPM belum tersedia; tahunan kosong; satuan persen masih berdasarkan konteks. |
| 11 | BPS | BPS Open Data | Perkawinan Anak | [perkawinan_anak.json](./perkawinan_anak.json) | Tersedia | Persentase perkawinan anak. Definisi indikator dan kelompok usia belum tersedia. |
| 12 | Kemensos | Kemensos API | Bantuan Sosial (data keluarga penerima manfaat, PKH) | [pkh.json](./pkh.json) | Sebagian | Persentase penerima PKH menurut perkotaan/perdesaan/total. Jumlah keluarga belum tersedia; pembagi persentase belum jelas; 3 nilai kosong. |
| 13 | Kementerian PUPR | PUPR API / BPS | Infrastruktur Dasar (akses air bersih & sanitasi layak) | [infrastruktur_dasar.json](./infrastruktur_dasar.json) | Tersedia | Rumah layak huni, air minum layak, sanitasi layak, fasilitas cuci tangan. Air minum layak dipertahankan sesuai tabel; referensi [1]–[4] belum tersedia. |
| 14 | BNPB | InaRISK | Risiko Bencana (banjir, gempa, longsor, dll.) | — | Belum ada | Belum ada dataset 2025. Layanan gempa BMKG pada kode bukan pengganti dataset risiko InaRISK. |
| 15 | BMKG | API Data Terbuka BMKG | Kualitas Lingkungan (kualitas udara & peringatan dini cuaca) | — | Belum ada | Belum ada dataset 2025. Layanan WAQI pada kode bukan dataset BMKG 2025; udara dan cuaca perlu dibedakan. |

## Aturan penggunaan

- Nama instansi/platform mengikuti matriks pengguna, bukan bukti koneksi API atau asal data yang terverifikasi.
- Tahun pada nama folder adalah tahun pengumpulan yang dituju; periksa yearBasis setiap dataset sebelum analisis.
- Nilai null berarti tidak tersedia, bukan nol. Pertahankan nol yang diberikan pengguna.
- Gunakan angka nasional yang diberikan. Jika national null, jangan mengklaim angka nasional resmi.
- Pertahankan footnotes dan missingValues setiap dataset.
- Kemiskinan Maret dan September adalah periode terpisah; tahunan tidak diisi rata-rata semester.
- Jumlah korban tidak boleh diberi label jumlah kasus; tabel partisipasi lama tidak disamakan dengan APK/APM 2025/2026.
- proposedDomain adalah usulan penempatan menurut struktur CERIA, belum implementasi dashboard.
- Data di luar matriks, termasuk Pengasuhan, belum ditambahkan untuk 2025.

## Usulan penempatan pada CERIA

- Kesehatan & Gizi: imunisasi, gizi, KIA, penyakit.
- Pendidikan: partisipasi PAUD, satuan PAUD, kualifikasi guru.
- Perlindungan: akta kelahiran, korban kekerasan, perkawinan anak.
- Kesejahteraan Sosial: kemiskinan, PKH, infrastruktur dasar.
- Bencana dan kondisi lingkungan: data belum tersedia; penempatan belum ditentukan.

Mapping terstruktur tersedia di [mapping.json](./mapping.json). Data 2024 tetap tersedia pada pilihan tahun 2024. Pilihan tahun berlaku bersama untuk seluruh menu CERIA melalui DataContext. Menu tanpa data pendukung 2025 menampilkan keterangan belum tersedia.



## Data pendukung populasi 2025

[populasi_aud.json](./populasi_aud.json): 38 provinsi dan angka nasional, proporsi usia 0–6 (%), jumlah usia 3–6 (jiwa), serta jumlah usia 5–6 (jiwa). Mendukung data per wilayah dan konteks AI, tanpa menambah atau mengubah 15 kelompok matriks utama. Tidak digunakan sebagai bobot risiko atau pasangan forecasting. Referensi belum diverifikasi; selisih jumlah provinsi/nasional dicatat pada qualityFlags.
