const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const translations = require('./translations');

module.exports = {
  createEmbed(bossData, selectedBoss, selectedElement, page) {
    // Verificar si bossData es un array y si la página es válida
    if (!Array.isArray(bossData) || page < 0 || page >= bossData.length) {
      return new EmbedBuilder()
        .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
        .setDescription('No se encontraron datos válidos para este equipo.')
        .setColor('#ff0000') // Rojo para indicar un error
        .setFooter({
          text: `Datos proporcionados por Guardian Tales TOP`,
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

    // Obtener las URLs de las imágenes de los héroes
    const heroImages = team.heroesAtr?.map(heroAtr => `https://www.gtales.top/assets/heroes/${heroAtr}.webp`) || [];

    // Crear un embed para cada héroe con su imagen
    const heroEmbeds = team.heroes.map((hero, index) => {
      const imageUrl = heroImages[index] || 'https://via.placeholder.com/150'; // Imagen de placeholder si no hay URL
      return new EmbedBuilder()
        .setTitle(hero.toUpperCase())
        .setImage(imageUrl)
        .setColor('#0099ff');
    });

    // Crear el embed principal con la información del equipo
    const mainEmbed = new EmbedBuilder()
      .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
      .setDescription('Aquí están los héroes recomendados:')
      .setColor('#0099ff')
      .setFooter({
        text: `Temporada: ${team.season} | Recomendado por: ${team.player || 'Desconocido'} | Página ${page + 1} de ${bossData.length}\nDatos proporcionados por Guardian Tales TOP`,
      });

    // Agregar la información de armas, cartas, accesorios, etc.
    const heroesInfo = team.heroes.map((hero, index) => {
      const weapon = team.weapons?.[index] || 'No disponible';
      const cards = team.cards?.[index] || 'No disponible';
      const accessories = team.access?.[index] || 'No disponible';

      const translatedAccessories = translations.access[accessories] || accessories;
      const translatedCards = translations.cards[cards] || cards;

      return `**${hero}**\n` +
             `- **Arma:** ${weapon}\n` +
             `- **Cartas:** ${translatedCards}\n` +
             `- **Accesorios:** ${translatedAccessories}`;
    }).join('\n\n');

    let chainsInfo = 'No disponible';
    if (team.chains && team.chains.P1) {
      chainsInfo = Object.entries(team.chains.P1)
        .map(([chainNumber, chainDescription]) => {
          let translatedDescription = chainDescription;
          for (const [key, value] of Object.entries(translations.infos)) {
            translatedDescription = translatedDescription.replace(new RegExp(key, 'g'), value);
          }
          return `**Cadena ${chainNumber}:** ${translatedDescription}`;
        })
        .join('\n');
    }

    const translatedRelic = translations.relic[team.relic] || team.relic || 'No disponible';
    let damageInfo = team.dmg ? String(team.dmg) : 'No disponible';

    mainEmbed.addFields(
      { name: '👥 Héroes, Armas, Cartas y Accesorios', value: heroesInfo, inline: false },
      { name: '⏳ Tiempos de Cadena', value: chainsInfo, inline: false },
      { name: '📜 Reliquia', value: translatedRelic, inline: false },
      { name: '💥 Daño', value: damageInfo, inline: false },
      { name: '🎥 Video Parte 1', value: team.videoP1 || 'No disponible', inline: false },
      { name: '🎥 Video Parte 2', value: team.videoP2 || 'No disponible', inline: false },
    );

    // Devolver un array con el embed principal y los embeds de los héroes
    return [mainEmbed, ...heroEmbeds];
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