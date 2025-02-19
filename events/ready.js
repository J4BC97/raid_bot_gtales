const { registerCommands } = require('../utils/commandRegister');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        await registerCommands(client); // Registra los comandos
    },
};