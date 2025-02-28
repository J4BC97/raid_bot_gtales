const axios = require('axios');

module.exports = {
    async handleHeroAutocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        try {
            // Verificar si la interacción ya ha sido respondida
            if (interaction.responded) {
                console.warn('La interacción ya ha sido respondida.');
                return;
            }

            // Obtener la lista de héroes desde la API
            const response = await axios.get('https://www.gtales.top/api/heroes');
            const heroes = response.data;

            if (!Array.isArray(heroes) || heroes.length === 0) {
                // Si no hay héroes, responder con un array vacío
                if (!interaction.responded) {
                    await interaction.respond([]);
                }
                return;
            }

            // Filtrar los héroes basados en lo que el usuario está escribiendo
            const filteredHeroes = heroes
                .filter(hero => hero.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25); // Limitar a 25 opciones para el autocompletado

            // Responder con las opciones filtradas
            if (!interaction.responded) {
                await interaction.respond(
                    filteredHeroes.map(hero => ({
                        name: hero.name, // Usar el nombre del héroe para mostrar en el autocompletado
                        value: hero.key, // Usar el key del héroe como valor
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching heroes for autocomplete:', error);

            // Si ocurre un error, responder con un array vacío (solo si no se ha respondido antes)
            if (!interaction.responded) {
                await interaction.respond([]);
            }
        }
    },
};