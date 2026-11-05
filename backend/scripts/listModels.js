const axios = require('axios');

const key = "AIzaSyAs2A9La8pMJhDs7xN3hK--D5BuOOJWNX8";

async function listModels() {
  console.log("--- Listing Available Models ---");
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    console.log("Models Found:", response.data.models.length);
    response.data.models.forEach(m => {
        console.log(m.name);
    });
  } catch (err) {
    console.error("❌ Failed to list models");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Message:", err.response.data.error?.message);
    } else {
      console.log("Error:", err.message);
    }
  }
}

listModels();
