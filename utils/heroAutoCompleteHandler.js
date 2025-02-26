const axios = require('axios');

module.exports = {
    async handleHeroAutocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        try {
            // Obtener la lista de héroes desde la API
            const response = await axios.get('https://www.gtales.top/api/heroes');
            const heroes = response.data;

            if (!Array.isArray(heroes) || heroes.length === 0) {
                return interaction.respond([]); // Si no hay héroes, no mostrar opciones
            }

            // Filtrar los héroes basados en lo que el usuario está escribiendo
            const filteredHeroes = heroes
                .filter(hero => hero.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25); // Limitar a 25 opciones para el autocompletado

            // Responder con las opciones filtradas
            await interaction.respond(
                filteredHeroes.map(hero => ({
                    name: hero.name, // Usar el nombre del héroe para mostrar en el autocompletado
                    value: hero.key, // Usar el key del héroe como valor
                }))
            );
        } catch (error) {
            console.error('Error fetching heroes for autocomplete:', error);
            return interaction.respond([]); // En caso de error, no mostrar opciones
        }
    },
};