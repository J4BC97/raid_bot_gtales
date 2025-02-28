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

      // Asegurarse de que la respuesta sea un array
      let data = response.data.list;
      if (!Array.isArray(data)) {
        // Si la respuesta no es un array, convertirlo en un array
        data = [data];
      }

      console.log('API Response:', data); // <-- Añade este console.log para ver la respuesta

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