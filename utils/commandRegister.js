require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('node:fs');
const path = require('node:path');

// Some asynchronous operation
const commands = await fs.promises.readdir(path.join(__dirname, '../commands')); // Top-level await!

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    const commands = loadCommands();
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands.map(command => command.data.toJSON()) },
    );

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}