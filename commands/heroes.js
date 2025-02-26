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

            // 2. Truncate labels and values to fit Discord's limits (if needed)
            heroes = heroes.map(hero => {
                const truncatedHero = hero.name.substring(0, 100); // Use hero.name and limit to 100
                return {
                    label: truncatedHero,
                    value: hero.key, // Use hero.key as value
                };
            });

            // 3. Build the select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('hero_select')
                .setPlaceholder('Select a hero...')
                .addOptions(heroes);

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
                const selectedHeroKey = i.values[0];

                try {
                    // 6. Fetch the hero details from the API
                    const heroDetailsResponse = await axios.get(`https://www.gtales.top/api/heroes?hero=${selectedHeroKey}`);
                    const heroDetails = heroDetailsResponse.data;

                    if (!heroDetails) {
                        return i.update({ content: 'Could not retrieve hero details.', components: [], ephemeral: true });
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
                        .setFooter({text: `Key: ${heroDetails.key}`}) //Added key
                        .setThumbnail(`https://www.gtales.top${heroDetails.atr}` || 'https://via.placeholder.com/150');

                    // 8. Reply with the hero details embed (ephemeral)
                    await i.update({ embeds: [heroEmbed], components: [], ephemeral: true });
                } catch (error) {
                    console.error('Error fetching hero details:', error);
                    return i.update({ content: 'An error occurred while fetching hero details.', components: [], ephemeral: true }); //Use i.update
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Hero selection timed out.', components: [], ephemeral: true }); // Use interaction.editReply
                }
            });

        } catch (error) {
            console.error('Error fetching hero list:', error);
            return interaction.reply({ content: 'An error occurred while fetching the hero list.', ephemeral: true });
        }
    },
};