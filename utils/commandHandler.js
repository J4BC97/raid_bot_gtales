const { loadCommands } = require('./commandLoader'); // Importa el cargador de comandos

module.exports = {
    async handleCommand(interaction) {
        const commands = loadCommands(); // Carga los comandos
        const command = commands.find(cmd => cmd.data.name === interaction.commandName);

        if (!command) {
            return interaction.reply({ content: 'Comando no encontrado.', ephemeral: true });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    },
};