require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./utils/eventLoader');

// Crear una nueva instancia del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Cargar eventos
loadEvents(client);

// Iniciar sesión en Discord con el token
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        console.log('Bot iniciado correctamente.');
    })
    .catch((error) => {
        console.error('Error al iniciar sesión en Discord:', error);
    });