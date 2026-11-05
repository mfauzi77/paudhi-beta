import React from 'react';
import { WrenchScrewdriverIcon } from './icons/Icons';
import { DataIntegrationItem } from './dataprocessing/DataIntegrationItem';

interface DataRequirement {
  name: string;
  platform: string;
}

interface MinistrySource {
  ministry: string;
  requirements: DataRequirement[];
}

const dataIntegrationSources: MinistrySource[] = [
  {
    ministry: "Kementerian Kesehatan (Kemenkes)",
    requirements: [
      { name: "Imunisasi (IDL per desa/kecamatan)", platform: "SatuSehat" },
      { name: "Gizi (stunting, wasting, underweight)", platform: "SatuSehat" },
      { name: "KIA (Kunjungan Antenatal K4, persalinan, AKB & AKI)", platform: "SatuSehat" },
      { name: "Penyakit (diare & ISPA balita)", platform: "SatuSehat" },
    ]
  },
  {
    ministry: "Kemendikdasmen",
    requirements: [
      { name: "Partisipasi PAUD (APM & APK)", platform: "Dapodik" },
      { name: "Satuan PAUD (jumlah lembaga, status akreditasi, rasio guru-murid)", platform: "Dapodik" },
      { name: "Kualitas Guru (kualifikasi akademik guru PAUD)", platform: "Dapodik" },
    ]
  },
  {
    ministry: "Kemendagri",
    requirements: [
      { name: "Identitas Anak (persentase kepemilikan Akta Kelahiran)", platform: "API Kependudukan Dukcapil" },
    ]
  },
  {
    ministry: "KemenPPPA",
    requirements: [
      { name: "Kasus Kekerasan (laporan kasus kekerasan terhadap anak)", platform: "SIMFONI PPA" },
      { name: "Perkawinan Anak (prevalensi perkawinan usia anak)", platform: "SIMFONI PPA" },
    ]
  },
  {
    ministry: "BPS",
    requirements: [
      { name: "Sosial-Ekonomi (kemiskinan & IPM)", platform: "BPS Open Data" },
      { name: "Perkawinan Anak", platform: "BPS Open Data" },
    ]
  },
  {
    ministry: "Kemensos",
    requirements: [
      { name: "Bantuan Sosial (data keluarga penerima manfaat, PKH)", platform: "Kemensos API" },
    ]
  },
  {
    ministry: "Kementerian PUPR",
    requirements: [
      { name: "Infrastruktur Dasar (akses air bersih & sanitasi layak)", platform: "PUPR API / BPS" },
    ]
  },
  {
    ministry: "BNPB",
    requirements: [
      { name: "Risiko Bencana (banjir, gempa, longsor, dll.)", platform: "InaRISK" },
    ]
  },
  {
    ministry: "BMKG",
    requirements: [
      { name: "Kualitas Lingkungan (kualitas udara & peringatan dini cuaca)", platform: "API Data Terbuka BMKG" },
    ]
  }
];

const DataProcessing: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <WrenchScrewdriverIcon className="w-6 h-6 mr-3 text-indigo-500" />
                    Manajemen Integrasi Data
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Kelola dan unggah data dari berbagai kementerian dan instansi. Gunakan AI untuk membaca dan memvalidasi data secara otomatis.
                </p>
            </div>

            <div className="space-y-8">
                {dataIntegrationSources.map(source => (
                    <div key={source.ministry}>
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{source.ministry}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {source.requirements.map(req => (
                                <DataIntegrationItem
                                    key={req.name}
                                    kementerian={source.ministry}
                                    platform={req.platform}
                                    dataName={req.name}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataProcessing;