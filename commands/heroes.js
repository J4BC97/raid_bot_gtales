const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function fetchHeroes() {
    try {
        const response = await axios.get('https://www.gtales.top/api/heroes');
        return response.data;
    } catch (error) {
        console.error('Error fetching heroes:', error);
        return null;
    }
}

async function fetchHeroDetails(heroKey) {
    try {
        const response = await axios.get(`https://www.gtales.top/api/heroes?hero=${heroKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hero details:', error);
        return null;
    }
}

function createSelectMenu(heroes) {
    return new StringSelectMenuBuilder()
        .setCustomId('hero_select')
        .setPlaceholder('Select a hero...')
        .addOptions(heroes.map(hero => ({
            label: hero.name.substring(0, 100), // Limita el nombre a 100 caracteres
            value: `hero_${hero.key}`, // Usa el key del héroe como valor
        })));
}

function createHeroEmbed(heroDetails) {
    return new EmbedBuilder()
        .setTitle(heroDetails.name || 'Unknown Hero')
        .setDescription(`Role: ${heroDetails.role || 'N/A'}\nElement: ${heroDetails.element || 'N/A'}`)
        .addFields(
            { name: 'Rarity', value: heroDetails.rarity || 'N/A', inline: true },
            { name: 'Collection', value: heroDetails.collection || 'N/A', inline: true },
            { name: 'Attack', value: heroDetails.stats.atk || 'N/A', inline: true },
            { name: 'HP', value: heroDetails.stats.hp || 'N/A', inline: true },
            { name: 'Defense', value: heroDetails.stats.def || 'N/A', inline: true },
        )
        .setFooter({ text: `Key: ${heroDetails.key}` })
        .setThumbnail(`https://www.gtales.top${heroDetails.atr}` || 'https://via.placeholder.com/150');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('Search for a hero and get their details.'),
    async execute(interaction) {
        try {
            // 1. Obtener la lista de héroes desde la API
            const heroes = await fetchHeroes();
            if (!Array.isArray(heroes) || heroes.length === 0) {
                return interaction.reply({ content: 'Could not retrieve hero list.', ephemeral: true });
            }

            // 2. Crear el menú de selección
            const selectMenu = createSelectMenu(heroes);
            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            // 3. Enviar la respuesta con el menú de selección
            await interaction.reply({
                content: 'Choose a hero to view their details:',
                components: [actionRow],
                ephemeral: true, // Esto hace que la respuesta sea visible solo para el usuario que ejecutó el comando
            });

            // 4. Crear un collector para manejar la interacción del menú de selección
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.customId === 'hero_select' && i.user.id === interaction.user.id,
                time: 60000, // 60 segundos
            });

            collector.on('collect', async i => {
                try {
                    await i.deferUpdate(); // Indicar a Discord que estamos manejando la interacción

                    // 5. Extraer el key del héroe seleccionado
                    const selectedHeroKey = i.values[0].replace('hero_', '');

                    // 6. Obtener los detalles del héroe desde la API
                    const heroDetails = await fetchHeroDetails(selectedHeroKey);
                    if (!heroDetails) {
                        return i.editReply({ content: 'Could not retrieve hero details.', components: [], ephemeral: true });
                    }

                    // 7. Crear el embed con los detalles del héroe
                    const heroEmbed = createHeroEmbed(heroDetails);

                    // 8. Responder con el embed de los detalles del héroe
                    await i.editReply({ embeds: [heroEmbed], components: [], ephemeral: true });
                } catch (error) {
                    console.error('Error fetching hero details:', error);
                    return i.editReply({ content: 'An error occurred while fetching hero details.', components: [], ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Hero selection timed out.', components: [], ephemeral: true }).catch(console.error);
                }
            });

        } catch (error) {
            console.error('Error fetching hero list:', error);
            return interaction.reply({ content: 'An error occurred while fetching the hero list.', ephemeral: true });
        }
    },
};