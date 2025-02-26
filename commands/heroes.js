const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

// Función para crear el embed con los detalles del héroe
function createHeroEmbed(heroDetails) {
    const embed = new EmbedBuilder()
        .setTitle(heroDetails.name || 'Unknown Hero')
        .setDescription(`**Role:** ${heroDetails.role || 'N/A'}\n**Element:** ${heroDetails.element || 'N/A'}`)
        .addFields(
            { name: 'Rarity', value: heroDetails.rarity || 'N/A', inline: true },
            { name: 'Collection', value: heroDetails.collection || 'N/A', inline: true },
            { name: 'Attack', value: heroDetails.stats.atk || 'N/A', inline: true },
            { name: 'HP', value: heroDetails.stats.hp || 'N/A', inline: true },
            { name: 'Defense', value: heroDetails.stats.def || 'N/A', inline: true },
        )
        .setFooter({ text: `Key: ${heroDetails.key}` })
        .setThumbnail(`https://www.gtales.top${heroDetails.atr}` || 'https://via.placeholder.com/150');

    // Añadir detalles de las habilidades, armas y variantes
    if (heroDetails.variants && heroDetails.variants.length > 0) {
        const variant = heroDetails.variants[0]; // Usar la primera variante

        // Añadir habilidades
        if (variant.na) {
            embed.addFields(
                { name: 'Normal Attack', value: variant.na.description || 'N/A', inline: false },
            );
        }
        if (variant.ability) {
            embed.addFields(
                { name: 'Ability', value: variant.ability.description || 'N/A', inline: false },
            );
        }
        if (variant.chain) {
            embed.addFields(
                { name: 'Chain Skill', value: variant.chain.description || 'N/A', inline: false },
            );
        }
        if (variant.skill) {
            embed.addFields(
                { name: 'Skill', value: `${variant.skill.title}: ${variant.skill.description}\n**Damage:** ${variant.skill.dmg}%\n**Cooldown:** ${variant.skill.cd}s`, inline: false },
            );
        }

        // Añadir detalles del arma
        if (variant.weapon) {
            embed.addFields(
                { name: 'Weapon', value: `**${variant.weapon.name}**\n**Type:** ${variant.weapon.type}\n**Effect:** ${variant.weapon.effect}\n**Damage:** ${variant.weapon.dmg}\n**Attack:** ${variant.weapon.atk}\n**Stats:** ${variant.weapon.stats}\n**Options:** ${variant.weapon.options}`, inline: false },
            );
        }
    }

    return embed;
}

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

        try {
            // Obtener los detalles del héroe seleccionado
            const heroDetails = await fetchHeroDetails(selectedHeroKey);

            if (!heroDetails) {
                return interaction.reply({ content: 'Could not retrieve hero details.', ephemeral: true });
            }

            // Crear el embed con los detalles del héroe
            const heroEmbed = createHeroEmbed(heroDetails);

            // Responder con el embed
            await interaction.reply({ embeds: [heroEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching hero details:', error);
            return interaction.reply({ content: 'An error occurred while fetching hero details.', ephemeral: true });
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