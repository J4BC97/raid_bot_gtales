const fs = require('fs');
const path = require('path');

module.exports = {
    loadCommands() {
        const commands = [];
        const commandsPath = path.join(__dirname, '../commands'); // Ruta a la carpeta de comandos
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            commands.push(command);
        }

        return commands;
    },
};