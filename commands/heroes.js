const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('Busca algun heroe y mira los detalles.'),
    async execute(interaction) {
        try {
            // 1. Fetch the list of heroes from the API
            const heroesResponse = await axios.get('https://www.gtales.top/api/heroes');
            const heroes = heroesResponse.data;

            if (!Array.isArray(heroes) || heroes.length === 0) {
                return interaction.reply({ content: 'Could not retrieve hero list.', ephemeral: true });
            }

            // 2. Create the select menu options
            const selectOptions = heroes.map(hero => ({
                label: hero,
                value: hero,
            }));

            // 3. Build the select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('hero_select')
                .setPlaceholder('Selecciona un heroe...')
                .addOptions(selectOptions);

            const actionRow = new ActionRowBuilder()
                .addComponents(selectMenu);

            // 4. Send the initial response with the select menu
            await interaction.reply({
                content: 'Choose a hero to view their details:',
                components: [actionRow],
                ephemeral: true,
            });

            // 5. Create a collector to handle select menu interactions
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.customId === 'hero_select' && i.user.id === interaction.user.id,
                time: 60000, // 60 seconds
            });

            collector.on('collect', async i => {
                const selectedHero = i.values[0];

                try {
                    // 6. Fetch the hero details from the API
                    const heroDetailsResponse = await axios.get(`https://www.gtales.top/api/heroes?hero=${selectedHero}`);
                    const heroDetails = heroDetailsResponse.data;

                    if (!heroDetails) {
                        return i.reply({ content: 'Could not retrieve hero details.', ephemeral: true });
                    }

                    // 7. Build the embed with hero details
                    const heroEmbed = new EmbedBuilder()
                        .setTitle(heroDetails.name || selectedHero) // Use selectedHero if name is missing
                        .setDescription(heroDetails.description || 'No description available')
                        .addFields(
                            { name: 'Element', value: heroDetails.element || 'N/A', inline: true },
                            { name: 'Class', value: heroDetails.class || 'N/A', inline: true },
                            // Add more fields as needed based on the API response
                        )
                        .setThumbnail(heroDetails.image || 'https://via.placeholder.com/150'); // Use placeholder if image is missing

                    // 8. Reply with the hero details embed (ephemeral)
                    await i.update({ embeds: [heroEmbed], components: [], ephemeral: true });
                } catch (error) {
                    console.error('Error fetching hero details:', error);
                    return i.reply({ content: 'An error occurred while fetching hero details.', ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Hero selection timed out.', components: [], ephemeral: true });
                }
            });

        } catch (error) {
            console.error('Error fetching hero list:', error);
            return interaction.reply({ content: 'An error occurred while fetching the hero list.', ephemeral: true });
        }
    },
};