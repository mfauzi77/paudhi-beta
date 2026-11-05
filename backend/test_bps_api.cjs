const axios = require('axios');
const https = require('https');

const apiKey = 'ba8deb0677a47ad516caa2348aeb8b79';
const var_id = 2207;
const year_id = 125;
const url = `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/${var_id}/th/${year_id}/key/${apiKey}`;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

console.log('Testing BPS API URL:', url);

axios.get(url, { httpsAgent })
    .then(res => {
        console.log('Status:', res.data.status);
        console.log('Message:', res.data.message);
        if (res.data.status !== 'OK') {
            console.log('Full Response:', JSON.stringify(res.data, null, 2));
        } else {
            console.log('Success! Data keys:', Object.keys(res.data));
            if (res.data.var) console.log('Variable label:', res.data.var[0].label);
        }
    })
    .catch(err => {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    });
