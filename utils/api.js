const axios = require('axios');
const https = require('https');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = {
  async getBossData(boss = '', element = '') {
    const cacheKey = `${boss}-${element}`;

    try {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Returning cached data for ${boss} ${element}`);
        return cachedData;
      }

      // Solo incluir el parámetro 'element' si tiene un valor
      const params = { boss };
      if (element) {
        params.element = element;
      }

      const url = `https://www.gtales.top/api/raids?${new URLSearchParams(params)}`;
      console.log(`Fetching data from URL: ${url}`);

      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const data = response.data.list;
      if (Array.isArray(data)) {
        cache.set(cacheKey, data);
        return data;
      } else {
        throw new Error('API response list is not an array');
      }
    } catch (error) {
      const errorMessage = `Error fetching boss data for ${boss} ${element}: ${error.message}`;
      console.error(errorMessage);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(errorMessage);
    }
  },
};