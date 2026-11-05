const pool = require('../dbPostgres');

const API_URL = 'http://localhost:5000/api/ai/generate';

async function testIsolation() {
  console.log('🚀 Starting AI Isolation Test...');
  
  const testRequest = async (source, prompt) => {
    console.log(`\n--- Testing ${source} Source ---`);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-App-Source': source 
        },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${source} Response: ${response.status}`, data.text ? 'OK (Text received)' : 'Warning: No Text');
      } else {
        console.error(`❌ ${source} Failed: ${response.status}`, data);
      }
    } catch (err) {
      console.error(`❌ ${source} Connection Error:`, err.message);
    }
  };

  await testRequest('CERIA', 'Jelaskan tentang stunting secara singkat.');
  await testRequest('SISMONEV', 'Bagaimana cara evaluasi program?');
  await testRequest('CHATBOT', 'Halo, siapa kamu?');
  await testRequest('GENERAL', 'Apa itu PAUD HI?');

  // Verify DB
  try {
    console.log('\n--- Verifying Database Silos ---');
    const res = await pool.query(`
      SELECT app_owner, count(*) as count 
      FROM ai_history 
      WHERE created_at > NOW() - INTERVAL '1 minute'
      GROUP BY app_owner
    `);
    console.table(res.rows);
    
    const ceriaCount = res.rows.find(r => r.app_owner === 'CERIA');
    const sismonevCount = res.rows.find(r => r.app_owner === 'SISMONEV');

    if (ceriaCount && sismonevCount) {
      console.log('✅ Data successfully siloed in ai_history!');
    } else {
      console.warn('⚠️ Warning: Data might not be fully siloed or one request failed. Check counts above.');
    }

  } catch (err) {
    console.error('❌ DB Verification Failed:', err);
  } finally {
      process.exit(0);
  }
}

// Run (Assuming server is running)
testIsolation();
