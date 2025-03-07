const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { generateTeamImage } = require('./raidCanvasGenerator'); // Importar la función del canvas
const translations = require('../../translations/raidTranslations');

module.exports = {
  async createEmbed(bossData, selectedBoss, selectedElement, page) {
    // Verificar si bossData es un array y si la página es válida
    if (!Array.isArray(bossData) || page < 0 || page >= bossData.length) {
      return new EmbedBuilder()
        .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
        .setDescription('No se encontraron datos válidos para este equipo.')
        .setColor('#ff0000') // Rojo para indicar un error
        .setFooter({
          text: `Datos proporcionados por Guardian Tales TOP: https://www.gtales.top/api`,
        });
    }

    const team = bossData[page];

    // Verificar si el equipo es válido
    if (!team || !team.heroes || !Array.isArray(team.heroes)) {
      return new EmbedBuilder()
        .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
        .setDescription('No se encontraron datos válidos para este equipo.')
        .setColor('#ff0000') // Rojo para indicar un error
        .setFooter({
          text: `Página ${page + 1} de ${bossData.length}\nDatos proporcionados por Guardian Tales TOP`,
        });
    }

    // Generar la imagen del equipo recomendado
    const buffer = await generateTeamImage(team);

    // Crear el embed con la imagen y el resto de la información
    const embed = new EmbedBuilder()
      .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
      .setImage('attachment://team.png') // La imagen se mostrará arriba del embed
      .setColor('#0099ff')
      .addFields(
        // Agregar información de cartas (cards) arriba del daño
        { name: '🃏 Cartas', value: team.cards.map((card, index) => {
          const translatedHero = translations.heroes[team.heroes[index]] || team.heroes[index]; // Traducir nombre del héroe
          const translatedCard = translations.cards[card] || card; // Traducir carta si es necesario
          return `**${translatedHero}:** ${translatedCard}`;
        }).join('\n'), inline: false },
        { name: '💥 Daño', value: team.dmg ? `Daño base: ${team.dmg}` : 'No disponible', inline: false },
        { name: '🎥 Video Parte 1', value: team.videoP1 || 'No disponible', inline: false },
        { name: '🎥 Video Parte 2', value: team.videoP2 || 'No disponible', inline: false },
      )
      .setFooter({
        text: `Temporada: ${team.season} | Recomendado por: ${team.player || 'Desconocido'} | Página ${page + 1} de ${bossData.length}\nDatos proporcionados por Guardian Tales TOP: https://www.gtales.top/api`,
      });

    // Si hay información de cadenas, agregarla al embed
    if (team.chains && team.chains.P1) {
      const chainsInfo = Object.entries(team.chains.P1)
        .map(([chainNumber, chainDescription]) => {
          let translatedDescription = chainDescription;
          for (const [key, value] of Object.entries(translations.infos)) {
            translatedDescription = translatedDescription.replace(new RegExp(key, 'g'), value);
          }
          return `**Cadena ${chainNumber}:** ${translatedDescription}`;
        })
        .join('\n');

      embed.addFields({ name: '⏳ Tiempos de Cadena', value: chainsInfo, inline: false });
    }

    return {
      embeds: [embed],
      files: [{ attachment: buffer, name: 'team.png' }], // Adjuntar la imagen como archivo
    };
  },

  createButtons(page, totalPages) {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`previous-${page}`)
          .setLabel('Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId(`next-${page}`)
          .setLabel('Siguiente')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1),
      );
  },
};