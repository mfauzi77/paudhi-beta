const pool = require('../dbPostgres');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('--- Updating ceria_bps_settings table ---');
        
        // Add new columns
        await client.query(`
            ALTER TABLE ceria_bps_settings 
            ADD COLUMN IF NOT EXISTS name TEXT,
            ADD COLUMN IF NOT EXISTS category TEXT,
            ADD COLUMN IF NOT EXISTS variable_id TEXT,
            ADD COLUMN IF NOT EXISTS frequency TEXT,
            ADD COLUMN IF NOT EXISTS platform TEXT,
            ADD COLUMN IF NOT EXISTS last_status TEXT
        `);

        console.log('--- Seeding initial integration data ---');

        const initialData = [
            ['Imunisasi', 'Kementerian Kesehatan (Kemenkes)', 'SatuSehat', '', 'Bulanan/Harian'],
            ['Gizi (stunting, wasting, underweight)', 'Kementerian Kesehatan (Kemenkes)', 'SatuSehat', '', 'Bulanan'],
            ['KIA (Kunjungan Antenatal K4, persalinan, AKB & AKI)', 'Kementerian Kesehatan (Kemenkes)', 'SatuSehat', '', 'Bulanan'],
            ['Penyakit (diare & ISPA balita)', 'Kementerian Kesehatan (Kemenkes)', 'SatuSehat', '', 'Bulanan'],
            ['Partisipasi PAUD (APM & APK)', 'Kemendikdasmen', 'Dapodik', '', 'Bulanan/Tahunan'],
            ['Satuan PAUD (jumlah lembaga, status akreditasi, rasio guru-murid)', 'Kemendikdasmen', 'Dapodik', '', 'Bulanan/Tahunan'],
            ['Kualitas Guru (kualifikasi akademik guru PAUD)', 'Kemendikdasmen', 'Dapodik', '', 'Bulanan/Tahunan'],
            ['Identitas Anak (persentase kepemilikan Akta Kelahiran)', 'Kemendagri', 'API Kependudukan Dukcapil', '', 'Real-time/Bulanan'],
            ['Kasus Kekerasan (laporan kasus kekerasan terhadap anak)', 'KemenPPPA', 'SIMFONI PPA', '', 'Real-time/Bulanan'],
            ['Perkawinan Anak (prevalensi perkawinan usia anak)', 'KemenPPPA', 'SIMFONI PPA', '', 'Real-time/Bulanan'],
            ['Sosial-Ekonomi (kemiskinan & IPM)', 'BPS', 'BPS Open Data', '2207', 'Bulanan/Semi-annual'],
            ['Perkawinan Anak', 'BPS', 'BPS Open Data', '', 'Bulanan/Semi-annual'],
            ['Bantuan Sosial (data keluarga penerima manfaat, PKH)', 'Kemensos', 'Kemensos API', '', 'Bulanan'],
            ['Infrastruktur Dasar (akses air bersih & sanitasi layak)', 'Kementerian PUPR', 'PUPR API / BPS', '', 'Tahunan/Bulanan'],
            ['Risiko Bencana (banjir, gempa, longsor, dll.)', 'BNPB', 'InaRISK', '', 'Real-time'],
            ['Kualitas Lingkungan (kualitas udara & peringatan dini cuaca)', 'BMKG', 'API Data Terbuaka BMKG', '', 'Real-time']
        ];

        // Clear existing data to avoid confusion in this transition phase
        await client.query('DELETE FROM ceria_bps_settings');

        for (const [name, category, platform, variable_id, frequency] of initialData) {
            await client.query(
                `INSERT INTO ceria_bps_settings (name, category, platform, variable_id, frequency, api_key, base_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [name, category, platform, variable_id, frequency, 'ba8deb0677a47ad516caa2348aeb8b79', 'https://webapi.bps.go.id/v1/api']
            );
        }

        await client.query('COMMIT');
        console.log('✅ Migration and seeding completed successfully');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
