const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const commands = await loadCommands(); // Ensure loadCommands is async
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands.map(command => command.data.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

async function loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const commands = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath); // Use dynamic import here!
        if ('data' in command && 'execute' in command) {
            commands.push(command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    return commands;
}

registerCommands();