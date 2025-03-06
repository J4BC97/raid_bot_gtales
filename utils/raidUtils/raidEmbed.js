const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
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

    // Crear un canvas para la imagen de héroes y armas
    const canvas = createCanvas(1000, 300); // Aumentamos el ancho y alto del canvas
    const ctx = canvas.getContext('2d');

    // Cargar las imágenes de los héroes y armas
    const heroImages = await Promise.all(team.heroesAtr.map(async (heroAtr) => {
      return await loadImage(`https://www.gtales.top/assets/heroes/${heroAtr}.webp`);
    }));

    const weaponImages = await Promise.all(team.weaponsAtr.map(async (weaponAtr) => {
      return await loadImage(`https://www.gtales.top/assets/weapons/${weaponAtr}.webp`);
    }));

    // Dibujar las imágenes en el canvas
    let x = 50; // Posición inicial en X
    const y = 50; // Posición en Y
    const spacing = 200; // Espaciado entre imágenes (aumentado para que las armas no se corten)

    heroImages.forEach((image, index) => {
      // Dibujar héroe (100x100)
      ctx.drawImage(image, x, y, 100, 100);

      // Dibujar arma debajo del héroe (100x100)
      ctx.drawImage(weaponImages[index], x, y + 120, 100, 100);

      // Mover la posición en X para el siguiente héroe y arma
      x += spacing;
    });

    // Convertir el canvas a un buffer de imagen
    const buffer = canvas.toBuffer('image/png');

    // Crear el embed con la imagen y el resto de la información
    const embed = new EmbedBuilder()
      .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
      .setImage('attachment://team.png') // La imagen se mostrará arriba del embed
      .setColor('#0099ff')
      .addFields(
        { name: '📜 Reliquia', value: translations.relic[team.relic] || team.relic || 'No disponible', inline: false },
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