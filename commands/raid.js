const { SlashCommandBuilder } = require('discord.js');
const { getBossData } = require('../utils/api');
const { createEmbed, createButtons } = require('../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Obtén los equipos recomendados para un jefe y elemento específico.')
    .addStringOption(option =>
      option.setName('jefe')
        .setDescription('El nombre del jefe')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('elemento')
        .setDescription('El elemento del jefe')
        .setRequired(true)
        .setAutocomplete(true)),
  async execute(interaction) {
    const selectedBoss = interaction.options.getString('jefe').toLowerCase();
    const selectedElement = interaction.options.getString('elemento').toLowerCase();

    try {
      const bossData = await getBossData(selectedBoss, selectedElement);

      // Verificar si bossData es válido y es un array
      if (!bossData || !Array.isArray(bossData) || bossData.length === 0) {
        return interaction.reply({
          content: 'No se encontraron equipos recomendados para este jefe y elemento.',
          ephemeral: true,
        });
      }

      let currentPage = 0;

      // Obtener los embeds (principal + héroes)
      const embeds = createEmbed(bossData, selectedBoss, selectedElement, currentPage);

      // Responder con los embeds y los botones de paginación
      await interaction.reply({
        embeds: embeds, // Enviar todos los embeds
        components: [createButtons(currentPage, bossData.length)],
        ephemeral: true,
      });

      // Manejar paginación
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (i) => {
        const customId = i.customId;
        const page = parseInt(customId.split('-')[1]);

        if (customId.startsWith('previous')) {
          currentPage = Math.max(0, page - 1);
        } else if (customId.startsWith('next')) {
          currentPage = Math.min(bossData.length - 1, page + 1);
        }

        // Actualizar los embeds y los botones con la nueva página
        const updatedEmbeds = createEmbed(bossData, selectedBoss, selectedElement, currentPage);
        await i.update({
          embeds: updatedEmbeds,
          components: [createButtons(currentPage, bossData.length)],
        });
      });

      collector.on('end', async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      console.error('Error en el comando raid:', error);
      await interaction.reply({
        content: 'Hubo un error al obtener los datos del jefe. Por favor, inténtalo de nuevo.',
        ephemeral: true,
      });
    }
  },
};