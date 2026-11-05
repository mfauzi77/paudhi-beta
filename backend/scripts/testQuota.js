const axios = require('axios');

const key = "AIzaSyAs2A9La8pMJhDs7xN3hK--D5BuOOJWNX8";
const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"];

async function testQuota() {
  console.log("--- Quota Diagnostic ---");
  for (const model of models) {
    console.log(`\nTesting ${model}...`);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { contents: [{ parts: [{ text: "Hi" }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(`✅ Success with ${model}!`);
    } catch (err) {
      console.log(`❌ Failed with ${model}`);
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Message:", err.response.data.error?.message);
      } else {
        console.log("Error:", err.message);
      }
    }
  }
}

testQuota();
