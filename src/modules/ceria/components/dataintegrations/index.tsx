import React from 'react';
import DataImportPage from './DataImportPage';

export const ImportKemenkesImunisasi: React.FC = () => (
  <DataImportPage title="Kemenkes - Imunisasi" templatePath="/templates/kemenkes_imunisasi.csv" endpoint="/api/import/kemenkes/imunisasi" description="Imunisasi IDL per desa/kecamatan." />
);

export const ImportKemenkesGizi: React.FC = () => (
  <DataImportPage title="Kemenkes - Gizi" templatePath="/templates/kemenkes_gizi.csv" endpoint="/api/import/kemenkes/gizi" description="Data stunting, wasting, underweight." />
);

export const ImportKemenkesKIA: React.FC = () => (
  <DataImportPage title="Kemenkes - KIA" templatePath="/templates/kemenkes_kia.csv" endpoint="/api/import/kemenkes/kia" description="K4, persalinan, AKB & AKI." />
);

export const ImportKemenkesPenyakit: React.FC = () => (
  <DataImportPage title="Kemenkes - Penyakit" templatePath="/templates/kemenkes_penyakit.csv" endpoint="/api/import/kemenkes/penyakit" description="Kasus diare & ISPA balita." />
);

export const ImportDapodikAPM: React.FC = () => (
  <DataImportPage title="Dapodik - APM & APK" templatePath="/templates/dapodik_apm_apk.csv" endpoint="/api/import/dapodik/apm-apk" description="Partisipasi PAUD (APM & APK)." />
);

export const ImportDapodikSatuan: React.FC = () => (
  <DataImportPage title="Dapodik - Satuan PAUD" templatePath="/templates/dapodik_satuan.csv" endpoint="/api/import/dapodik/satuan" description="Jumlah, akreditasi, rasio guru-murid." />
);

export const ImportDapodikGuru: React.FC = () => (
  <DataImportPage title="Dapodik - Kualitas Guru" templatePath="/templates/dapodik_kualitas_guru.csv" endpoint="/api/import/dapodik/kualitas-guru" description="Kualifikasi akademik guru PAUD." />
);

export const ImportDukcapilIdentitas: React.FC = () => (
  <DataImportPage title="Dukcapil - Identitas Anak" templatePath="/templates/dukcapil_identitas_anak.csv" endpoint="/api/import/dukcapil/identitas-anak" description="Persentase kepemilikan akta kelahiran." />
);

export const ImportKPPPAKekerasan: React.FC = () => (
  <DataImportPage title="KemenPPPA - Kasus Kekerasan" templatePath="/templates/kpppa_kekerasan.csv" endpoint="/api/import/kpppa/kekerasan" description="Laporan kasus kekerasan terhadap anak." />
);

export const ImportKPPPPAPerkawinan: React.FC = () => (
  <DataImportPage title="KemenPPPA - Perkawinan Anak" templatePath="/templates/kpppa_perkawinan_anak.csv" endpoint="/api/import/kpppa/perkawinan-anak" description="Prevalensi perkawinan usia anak." />
);

export const ImportBPSSosialEkonomi: React.FC = () => (
  <DataImportPage title="BPS - Sosial Ekonomi" templatePath="/templates/bps_sosial_ekonomi.csv" endpoint="/api/import/bps/sosial-ekonomi" description="Kemiskinan & IPM." />
);

export const ImportBPSPerkawinan: React.FC = () => (
  <DataImportPage title="BPS - Perkawinan Anak" templatePath="/templates/bps_perkawinan_anak.csv" endpoint="/api/import/bps/perkawinan-anak" description="Statistik perkawinan anak." />
);

export const ImportKemensosBansos: React.FC = () => (
  <DataImportPage title="Kemensos - Bansos" templatePath="/templates/kemensos_bansos.csv" endpoint="/api/import/kemensos/bansos" description="Data keluarga penerima manfaat, PKH." />
);

export const ImportPUPRInfrastruktur: React.FC = () => (
  <DataImportPage title="PUPR/BPS - Infrastruktur Dasar" templatePath="/templates/pupr_infrastruktur.csv" endpoint="/api/import/pupr/infrastruktur" description="Akses air bersih & sanitasi layak." />
);

export const ImportBNPBRisiko: React.FC = () => (
  <DataImportPage title="BNPB - Risiko Bencana" templatePath="/templates/bnpb_risiko_bencana.csv" endpoint="/api/import/bnpb/risiko-bencana" description="Banjir, gempa, longsor." />
);

export const ImportBMKGKualitas: React.FC = () => (
  <DataImportPage title="BMKG - Kualitas Lingkungan" templatePath="/templates/bmkg_kualitas_lingkungan.csv" endpoint="/api/import/bmkg/kualitas-lingkungan" description="Kualitas udara & peringatan dini cuaca." />
);


