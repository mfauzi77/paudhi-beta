const pool = require('../dbPostgres');

async function checkData() {
    try {
        const res = await pool.query('SELECT id, kl_name, program, indikators FROM ran_paud LIMIT 3');
        
        console.log('📊 Total records in database:', res.rows.length);
        console.log('');
        
        res.rows.forEach((row, idx) => {
            console.log(`\n=== Record ${idx + 1} ===`);
            console.log('Program:', row.program);
            console.log('K/L:', row.kl_name);
            
            const indikators = row.indikators || [];
            console.log('Total Indikators:', indikators.length);
            
            indikators.forEach((ind, i) => {
                const tahunData = ind.tahunData || [];
                const years = tahunData.map(td => td.tahun).sort();
                console.log(`  Indikator ${i + 1}: Years available:`, years);
            });
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkData();
