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
      const url = `https://www.gtales.top/api/raids?boss=${encodeURIComponent(boss)}&element=${encodeURIComponent(element)}`;
      console.log(`Fetching data from URL: ${url}`);

      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      // Verificar si la respuesta tiene la estructura esperada
      if (!response.data || !Array.isArray(response.data.list)) {
        throw new Error('La respuesta de la API no tiene la estructura esperada.');
      }

      const data = response.data.list;
      console.log('API Response:', data); // <-- Verifica la respuesta aquí

      cache.set(cacheKey, data);
      return data;
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