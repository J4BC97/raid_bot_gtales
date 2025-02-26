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