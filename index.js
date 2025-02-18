const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const https = require('https');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env.DISCORD_BOT_TOKEN;

// Datos de jefes y elementos
const bosses = [
    { name: 'gast', elements: ['light', 'water', 'earth'] },
    { name: 'harvester', elements: ['fire', 'basic', 'light'] },
    { name: 'demon', elements: ['basic', 'fire', 'light'] },
    { name: 'minotaur', elements: ['earth', 'fire'] },
    { name: 'marina', elements: ['water', 'basic'] },
    { name: 'sandy', elements: ['light', 'dark'] },
    { name: 'goblin', elements: ['fire'] },
    { name: 'slime', elements: ['dark', 'fire'] },
    { name: 'shadow', elements: ['dark', 'basic'] },
    { name: 'commander', elements: ['basic', 'dark'] },
    { name: 'erina', elements: ['earth', 'light'] },
    { name: 'panda', elements: ['earth', 'basic'] },
    { name: 'fairy', elements: ['water', 'light'] },
    { name: 'viper', elements: ['light', 'dark'] },
    { name: 'elphaba', elements: ['dark', 'basic'] },
    { name: 'worm', elements: ['earth'] },
    { name: 'garam', elements: ['light', 'water'] },
    { name: 'director', elements: ['light', 'water', 'dark'] },
    { name: 'duncan', elements: ['basic', 'dark', 'earth'] },
    { name: 'knight', elements: ['earth', 'dark', 'fire'] },
    { name: 'terrorist', elements: ['earth', 'water', 'light'] },
    { name: 'carmen', elements: ['water'] },
    { name: 'jerry', elements: ['dark'] },
];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!raid')) {
        // Mostrar menú de selección de jefes (respuesta efímera)
        const bossMenu = new StringSelectMenuBuilder()
            .setCustomId('select-boss')
            .setPlaceholder('Selecciona un jefe')
            .addOptions(
                bosses.map(boss => ({
                    label: boss.name.toUpperCase(),
                    value: boss.name,
                }))
            );

        const row = new ActionRowBuilder().addComponents(bossMenu);

        await message.reply({
            content: 'Selecciona un jefe de la lista:',
            components: [row],
            flags: 64, // Mensaje efímero (solo visible para el usuario)
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

    // Manejar selección de jefe
    if (interaction.customId === 'select-boss') {
        const selectedBoss = interaction.values[0];
        const bossData = bosses.find(boss => boss.name === selectedBoss);

        // Mostrar menú de selección de elementos (respuesta efímera)
        const elementMenu = new StringSelectMenuBuilder()
            .setCustomId('select-element')
            .setPlaceholder('Selecciona un elemento')
            .addOptions(
                bossData.elements.map(element => ({
                    label: element.toUpperCase(),
                    value: element,
                }))
            );

        const row = new ActionRowBuilder().addComponents(elementMenu);

        // Eliminar el mensaje anterior de selección de jefe
        await interaction.deferUpdate(); // Asegura que la interacción esté completada
        await interaction.deleteReply(); // Elimina el mensaje anterior

        // Enviar el nuevo mensaje de selección de elementos
        await interaction.followUp({
            content: `Selecciona un elemento para el jefe **${selectedBoss.toUpperCase()}**:`,
            components: [row],
            flags: 64, // Mensaje efímero (solo visible para el usuario)
        });
    }

    // Manejar selección de elemento
    if (interaction.customId === 'select-element') {
        const selectedElement = interaction.values[0];
        const selectedBoss = interaction.message.content.match(/\*\*(.*?)\*\*/)[1].toLowerCase();

        // Indicar que el bot está procesando la interacción
        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await axios.get(`https://www.gtales.top/api/raids?boss=${selectedBoss}&element=${selectedElement}`, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });
            const bossData = response.data;

            if (!Array.isArray(bossData) || bossData.length === 0) {
                return interaction.editReply({
                    content: 'No se encontraron equipos recomendados para este jefe y elemento.',
                });
            }

            // Eliminar el mensaje de selección de elementos
            await interaction.deleteReply();

            // Enviar la información de cada equipo en un embed con paginación
            let currentPage = 0;
            const teamsPerPage = 1; // Número de equipos por página

            const createEmbed = (page) => {
                const team = bossData[page];
                return new EmbedBuilder()
                    .setTitle(`Equipo recomendado para ${selectedBoss.toUpperCase()} (${selectedElement.toUpperCase()})`)
                    .addFields(
                        { name: '👥 Héroes', value: team.heroes.join(', '), inline: false },
                        { name: '⚔️ Armas', value: team.weapons.join(', '), inline: false },
                        { name: '📿 Accesorios', value: team.access.join(', '), inline: false },
                        { name: '🃏 Cartas', value: team.cards.join(', '), inline: false },
                        { name: '📜 Reliquia', value: team.relic, inline: false },
                        { name: '💥 Daño', value: team.dmg, inline: false },
                        { name: '🎥 Video Parte 1', value: team.videoP1 || 'No disponible', inline: false },
                        { name: '🎥 Video Parte 2', value: team.videoP2 || 'No disponible', inline: false },
                    )
                    .setColor('#0099ff')
                    .setFooter({ text: `Recomendado por: ${team.player || 'Desconocido'} | Página ${page + 1} de ${bossData.length}` });
            };

            const createButtons = (page) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === bossData.length - 1),
                );
            };

            const sendPage = async (page) => {
                await interaction.followUp({
                    embeds: [createEmbed(page)],
                    components: [createButtons(page)],
                    flags: 64, // Mensaje efímero (solo visible para el usuario)
                });
            };

            await sendPage(currentPage);

            // Manejar paginación
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                await i.update({
                    embeds: [createEmbed(currentPage)],
                    components: [createButtons(currentPage)],
                });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }); // Eliminar botones al finalizar
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: 'Hubo un error al obtener la información del jefe de raid.',
            });
        }
    }
});

client.login(token);