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

      // Construir la URL según los parámetros proporcionados
      let url;
      if (!boss && !element) {
        // Si no se proporciona ningún parámetro, obtener la lista completa de jefes
        url = 'https://www.gtales.top/api/raids';
      } else if (boss && element) {
        // Si se proporciona un jefe y un elemento, obtener los equipos recomendados
        url = `https://www.gtales.top/api/raids?boss=${encodeURIComponent(boss)}&element=${encodeURIComponent(element)}`;
      } else {
        throw new Error('Both boss and element parameters are required for team data.');
      }

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