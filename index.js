require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./utils/eventLoader');
const http = require('http'); // Importar el módulo http

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

// Crear un servidor HTTP básico
const server = http.createServer((req, res) => {
    // Ruta para UptimeRobot
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong\n'); // Responde con "pong" cuando se accede a /ping
        return;
    }

    // Ruta principal
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot de Discord está en funcionamiento.\n');
});

// Escuchar en el puerto proporcionado por Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Iniciar sesión en Discord con el token
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        console.log('Bot iniciado correctamente.');
    })
    .catch((error) => {
        console.error('Error al iniciar sesión en Discord:', error);
    });