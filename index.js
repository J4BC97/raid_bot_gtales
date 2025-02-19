require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
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
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Log the value of the token
console.log('Token from environment:', token);
console.log('Client ID from environment:', clientId);
console.log('Guild ID from environment:', guildId);

// Diccionario de traducciones
const translations = {
    access: {
        mino: "Minotaur Necklace",
        sg: "Sniper Goggles",
        shar: "Sharpshooter",
        mad: "Mad Panda Brooch",
        earth: "Earth Necklace",
        light: "Light Earrings",
        dark: "Dark Earrings",
        basic: "Basic Earrings",
        fire: "Fire Earrings",
        water: "Water Earrings",
        // Agrega más traducciones de accesorios aquí
    },
    cards: {
        "skill-skill": "Skill Damage + Skill Damage",
        "crit-crit": "Critical Rate + Critical Rate",
        "atk-atk": "Attack + Attack",
        "def-def": "Defense + Defense",
        "hp-hp": "HP + HP",
        "skill-crit": "Skill Damage + Critical Rate",
        "atk-crit": "Attack + Critical Rate",
        // Agrega más traducciones de cartas aquí
    },
    relic: {
        book: "Libro",
        cup: "Copa",
        shield: "Shield of Faith",
        sword: "Sword of Justice",
        // Agrega más traducciones de reliquias aquí
    },
    chains: {
        "P1": "Parte 1",
        "P2": "Parte 2",
        "WS": "Weapon Skill",
        // Agrega más traducciones de cadenas aquí
    },
    infos: {
        "def": "Defensa",
        "crit": "Tasa de Crítico",
        "skill": "Daño de Habilidad",
        "atk": "Ataque",
        "hp": "Vida",
        // Agrega más traducciones de términos comunes aquí
    },
};

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

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Register slash command
    const commands = [
        new SlashCommandBuilder()
            .setName('raid')
            .setDescription('Obtén los equipos recomendados para un jefe y elemento específico.')
            .addStringOption(option =>
                option.setName('jefe')
                    .setDescription('El nombre del jefe')
                    .setRequired(true)
                    .setAutocomplete(true)) // Habilitar autocompletado para jefe
            .addStringOption(option =>
                option.setName('elemento')
                    .setDescription('El elemento del jefe')
                    .setRequired(true)
                    .setAutocomplete(true)) // Habilitar autocompletado para elemento
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) {
        // Manejar autocompletado para jefe y elemento
        const focusedOption = interaction.options.getFocused(true);
        const choices = [];

        if (focusedOption.name === 'jefe') {
            // Mostrar lista de jefes
            choices.push(...bosses.map(boss => ({ name: boss.name.toUpperCase(), value: boss.name })));
        } else if (focusedOption.name === 'elemento') {
            // Mostrar elementos válidos para el jefe seleccionado
            const selectedBoss = interaction.options.getString('jefe');
            const bossData = bosses.find(boss => boss.name === selectedBoss);
            if (bossData) {
                choices.push(...bossData.elements.map(element => ({ name: element.toUpperCase(), value: element })));
            }
        }

        // Filtrar opciones basadas en la entrada del usuario
        const filtered = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );

        await interaction.respond(filtered.slice(0, 25)); // Discord solo permite 25 opciones
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'raid') {
        const selectedBoss = interaction.options.getString('jefe').toLowerCase();
        const selectedElement = interaction.options.getString('elemento').toLowerCase();

        // Validar jefe y elemento
        const bossData = bosses.find(boss => boss.name === selectedBoss);
        if (!bossData || !bossData.elements.includes(selectedElement)) {
            return interaction.reply({
                content: 'El jefe o elemento seleccionado no es válido. Por favor, usa el autocompletado para seleccionar opciones válidas.',
                ephemeral: true,
            });
        }

        try {
            const response = await axios.get(`https://www.gtales.top/api/raids?boss=${selectedBoss}&element=${selectedElement}`, {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });
            const bossData = response.data;

            if (!Array.isArray(bossData) || bossData.length === 0) {
                return interaction.reply({
                    content: 'No se encontraron equipos recomendados para este jefe y elemento.',
                    ephemeral: true,
                });
            }

            let currentPage = 0;

            const createEmbed = (page) => {
                const team = bossData[page];

                // Formatear héroes, armas, cartas y accesorios
                const heroesInfo = team.heroes.map((hero, index) => {
                    const weapon = team.weapons[index];
                    const cards = team.cards[index];
                    const accessories = team.access[index]; // Accesorios para este héroe

                    // Traducir accesorios y cartas
                    const translatedAccessories = translations.access[accessories] || accessories;
                    const translatedCards = translations.cards[cards] || cards;

                    return `**${hero}**\n` +
                           `- **Arma:** ${weapon}\n` +
                           `- **Cartas:** ${translatedCards}\n` +
                           `- **Accesorios:** ${translatedAccessories}`;
                }).join('\n\n');

                // Formatear tiempos de cadena
                let chainsInfo = 'No disponible';
                if (team.chains && team.chains.P1) {
                    chainsInfo = Object.entries(team.chains.P1)
                        .map(([chainNumber, chainDescription]) => {
                            // Traducir términos comunes en las cadenas
                            let translatedDescription = chainDescription;
                            for (const [key, value] of Object.entries(translations.infos)) {
                                translatedDescription = translatedDescription.replace(new RegExp(key, 'g'), value);
                            }
                            return `**Cadena ${chainNumber}:** ${translatedDescription}`;
                        })
                        .join('\n');
                }

                // Traducir reliquia
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
            };

            const createButtons = (page) => {
                const buttons = new ActionRowBuilder()
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
                            .setDisabled(page === bossData.length - 1),
                    );
                return buttons;
            };

            // Enviar la primera página
            await interaction.reply({
                embeds: [createEmbed(currentPage)],
                components: [createButtons(currentPage)],
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

                try {
                    // Actualizar el mensaje con la nueva página
                    await i.update({
                        embeds: [createEmbed(currentPage)],
                        components: [createButtons(currentPage)],
                    });
                } catch (updateError) {
                    console.error('Error updating interaction:', updateError);
                }
            });

            collector.on('end', async () => {
                try {
                    await interaction.editReply({ components: [] }); // Eliminar botones al finalizar
                } catch (editError) {
                    console.error('Error editing reply:', editError);
                }
            });
        } catch (apiError) {
            console.error('Error fetching data or processing interaction:', apiError);
            interaction.reply({
                content: 'Hubo un error al obtener la información del jefe de raid.',
                ephemeral: true,
            });
        }
    }
});

// Log the token before attempting to log in
console.log('Attempting to log in with token:', token);

client.login(token).catch(error => {
    console.error('Failed to login to Discord:', error);
});