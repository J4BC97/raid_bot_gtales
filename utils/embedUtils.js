const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const translations = require('./translations');

module.exports = {
    createEmbed(bossData, selectedBoss, selectedElement, page) {
        const team = bossData[page];

        const heroesInfo = team.heroes.map((hero, index) => {
            const weapon = team.weapons[index];
            const cards = team.cards[index];
            const accessories = team.access[index];

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

        const translatedRelic = translations.relic[team.relic] || team.relic;
        let damageInfo = team.dmg ? String(team.dmg) : 'No disponible';

        return new EmbedBuilder()
            .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
            .addFields(
                { name: '👥 Héroes, Armas, Cartas y Accesorios', value: heroesInfo, inline: false },
                { name: '⏳ Tiempos de Cadena', value: chainsInfo, inline: false },
                { name: '📜 Reliquia', value: translatedRelic, inline: false },
                { name: '💥 Daño', value: damageInfo, inline: false },
                { name: '🎥 Video Parte 1', value: team.videoP1 || 'No disponible', inline: false },
                { name: '🎥 Video Parte 2', value: team.videoP2 || 'No disponible', inline: false },
            )
            .setColor('#0099ff')
            .setFooter({
                text: `Temporada: ${team.season} | Recomendado por: ${team.player || 'Desconocido'} | Página ${page + 1} de ${bossData.length}\nDatos proporcionados por Guardian Tales TOP`,
            });
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