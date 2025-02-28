const axios = require('axios');
const https = require('https');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL: 1 hour, check every 10 minutes

module.exports = {
  async getBossData(boss = '', element = '') {
    const cacheKey = `${boss}-${element}`;

    try {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Returning cached data for ${boss} ${element}`);
        return cachedData;
      }

      const response = await axios.get(`https://www.gtales.top/api/raids?boss=${boss}&element=${element}`, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const data = response.data;
      if (Array.isArray(data)) {
        cache.set(cacheKey, data);
        return data;
      } else {
        throw new Error('API response is not an array');
      }
    } catch (error) {
      const errorMessage = `Error fetching boss data for ${boss} ${element}: ${error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
};