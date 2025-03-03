const { SlashCommandBuilder } = require('discord.js');
const { fetchHeroes, fetchHeroDetails } = require('../utils/heroesUtils/heroApi');
const { createHeroEmbed } = require('../utils/heroesUtils/heroEmbed');
const translations = require('../translations/heroTranslations');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('Search for a hero and get their details.')
        .addStringOption(option =>
            option.setName('hero')
                .setDescription('The name of the hero')
                .setRequired(true)
                .setAutocomplete(true)), // Habilitar autocompletado
    async execute(interaction) {
        const selectedHeroKey = interaction.options.getString('hero');
        const lang = 'es'; // Puedes cambiar esto según el idioma del usuario

        try {
            // Obtener los detalles del héroe seleccionado
            const heroDetails = await fetchHeroDetails(selectedHeroKey);

            if (!heroDetails) {
                return interaction.reply({ content: translations[lang].heroNotFound, ephemeral: true });
            }

            // Verificar si el héroe está disponible
            if (!heroDetails.available) {
                const embed = createHeroEmbed(heroDetails, lang, true); // Pasar true para indicar que la información está incompleta
                return interaction.reply({ embeds: [embed], content: translations[lang].heroInfoIncomplete, ephemeral: true });
            }

            // Crear el embed con los detalles del héroe
            const heroEmbed = createHeroEmbed(heroDetails, lang);

            // Responder con el embed
            await interaction.reply({ embeds: [heroEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching hero details:', error);
            return interaction.reply({ content: translations[lang].heroDetailsError, ephemeral: true });
        }
    },
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const heroes = await fetchHeroes();

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
    },
};