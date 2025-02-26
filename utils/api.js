const axios = require('axios');
const https = require('https');

function ApiError(message, originalError) {
  this.name = 'ApiError';
  this.message = message;
  this.originalError = originalError;
  this.stack = (new Error()).stack; // Optional: include stack trace
}

ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

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
      const errorMessage = `Error fetching boss data for ${boss} ${element}: ${error.message}`;
      console.error(errorMessage);
      throw new ApiError(errorMessage, error);
    }
  },
};