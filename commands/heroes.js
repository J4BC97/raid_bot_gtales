const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('Search for a hero and get their details.'),
    async execute(interaction) {
        try {
            // 1. Fetch the list of heroes from the API
            const heroesResponse = await axios.get('https://www.gtales.top/api/heroes');
            let heroes = heroesResponse.data;

            if (!Array.isArray(heroes) || heroes.length === 0) {
                return interaction.reply({ content: 'Could not retrieve hero list.', ephemeral: true });
            }

            // 2. Structure the data correctly for addOptions, and ensure values are strings
            const selectOptions = heroes.map(hero => ({
                label: hero.name.substring(0, 100), // Use hero.name and limit to 100
                value: `hero_${hero.key}`, // Use hero.key as value and prepend "hero_" to force string
            }));

            // 3. Build the select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('hero_select')
                .setPlaceholder('Select a hero...')
                .addOptions(selectOptions); // Pass the correctly structured array

            const actionRow = new ActionRowBuilder()
                .addComponents(selectMenu);

            // 4. Send the initial response with the select menu
            try {
                await interaction.reply({
                    content: 'Choose a hero to view their details:',
                    components: [actionRow],
                    ephemeral: true,
                });
            } catch (error) {
                console.error("Error sending initial reply:", error);
                return; // Exit if initial reply fails
            }

            // 5. Create a collector to handle select menu interactions
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.customId === 'hero_select' && i.user.id === interaction.user.id,
                time: 60000, // 60 seconds
            });

            collector.on('collect', async i => {
                try {
                    await i.deferUpdate(); // Tell Discord we're handling the interaction

                    const selectedHeroKey = i.values[0].replace('hero_', ''); // Extract the actual key

                    // 6. Fetch the hero details from the API
                    const heroDetailsResponse = await axios.get(`https://www.gtales.top/api/heroes?hero=${selectedHeroKey}`);
                    const heroDetails = heroDetailsResponse.data;

                    if (!heroDetails) {
                        return i.editReply({ content: 'Could not retrieve hero details.', components: [], ephemeral: true });
                    }

                    // 7. Build the embed with hero details
                    const heroEmbed = new EmbedBuilder()
                        .setTitle(heroDetails.name || 'Unknown Hero')
                        .setDescription(`Role: ${heroDetails.role || 'N/A'}\nElement: ${heroDetails.element || 'N/A'}`) //Added role and element
                        .addFields(
                            { name: 'Rarity', value: heroDetails.rarity || 'N/A', inline: true },
                            { name: 'Collection', value: heroDetails.collection || 'N/A', inline: true },
                            { name: 'Attack', value: heroDetails.stats.atk || 'N/A', inline: true },
                            { name: 'HP', value: heroDetails.stats.hp || 'N/A', inline: true },
                            { name: 'Defense', value: heroDetails.stats.def || 'N/A', inline: true },
                        )
                        .setFooter({ text: `Key: ${heroDetails.key}` }) //Added key
                        .setThumbnail(`https://www.gtales.top${heroDetails.atr}` || 'https://via.placeholder.com/150');

                    // 8. Reply with the hero details embed (ephemeral)
                    await i.editReply({ embeds: [heroEmbed], components: [], ephemeral: true });
                } catch (error) {
                    console.error('Error fetching hero details:', error);
                    return i.editReply({ content: 'An error occurred while fetching hero details.', components: [], ephemeral: true }); //Use i.editReply
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Hero selection timed out.', components: [], ephemeral: true }).catch(console.error); // Use interaction.editReply and catch errors
                }
            });

        } catch (error) {
            console.error('Error fetching hero list:', error);
            return interaction.reply({ content: 'An error occurred while fetching the hero list.', ephemeral: true });
        }
    },
};