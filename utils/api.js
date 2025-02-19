const axios = require('axios');
const https = require('https');

module.exports = {
    async getBossData(boss, element) {
        try {
            const response = await axios.get(`https://www.gtales.top/api/raids?boss=${boss}&element=${element}`, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching boss data:', error);
            return null;
        }
    },
};