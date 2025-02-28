const axios = require('axios');

// Función para obtener la lista de héroes desde la API
async function fetchHeroes() {
    try {
        const response = await axios.get('https://www.gtales.top/api/heroes');
        return response.data;
    } catch (error) {
        console.error('Error fetching heroes:', error);
        return null;
    }
}

// Función para obtener los detalles de un héroe específico
async function fetchHeroDetails(heroKey) {
    try {
        const response = await axios.get(`https://www.gtales.top/api/heroes?hero=${heroKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hero details:', error);
        return null;
    }
}

module.exports = {
    fetchHeroes,
    fetchHeroDetails,
};