const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../public/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'ceria_aggregated.json');

const FILES_TO_AGGREGATE = [
    'kesehatan_lingkungan.json',
    'perkawinan_anak.json',
    'kasus_perlindungan_anak.json',
    'paud_akreditasi.json',
    'paud_kualifikasi_guru.json',
    'anc.json',
    'gizi.json',
    'akta.json',
    'idl.json',
    'kemiskinan.json',
    'pkh.json',
    'sanitasi.json',
    'populasi_anak_usia_dini.json',
    'partisipasi_paud.json'
];

async function aggregateData() {
    console.log('🚀 Starting data aggregation for CERIA...');
    const aggregatedData = {};

    for (const fileName of FILES_TO_AGGREGATE) {
        const filePath = path.join(DATA_DIR, fileName);
        const key = fileName.replace('.json', '');
        
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                aggregatedData[key] = JSON.parse(content);
                console.log(`✅ Aggregated ${fileName}`);
            } else {
                console.warn(`⚠️ Warning: ${fileName} not found in ${DATA_DIR}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${fileName}:`, error.message);
        }
    }

    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(aggregatedData, null, 2));
        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`\n✨ Successfully created: ${OUTPUT_FILE}`);
        console.log(`📊 Total size: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
        console.error(`❌ Failed to write output file:`, error.message);
    }
}

aggregateData();
