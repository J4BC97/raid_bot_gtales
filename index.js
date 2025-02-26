require('dotenv').config(); // Load environment variables

const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./utils/eventLoader');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

loadEvents(client);

const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong\n');
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot de Discord está en funcionamiento.\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

client.login(process.env.DISCORD_BOT_TOKEN) // Use environment variable
    .then(() => {
        console.log('Bot iniciado correctamente.');
    })
    .catch((error) => {
        console.error('Error al iniciar sesión en Discord:', error);
    });