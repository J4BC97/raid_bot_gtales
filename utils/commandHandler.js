const { MessageFlags } = require('discord.js'); // Añadir MessageFlags
const { loadCommands } = require('./commandLoader'); // Importa el cargador de comandos

module.exports = {
  async handleCommand(interaction) {
    try {
      const commands = loadCommands(); // Carga los comandos
      if (!Array.isArray(commands)) {
        throw new Error('Los comandos no se cargaron correctamente.');
      }

      const command = commands.find(cmd => cmd.data.name === interaction.commandName);
      if (!command) {
        return interaction.reply({ content: 'Comando no encontrado.', flags: MessageFlags.Ephemeral }); // Cambiar aquí
      }

      await command.execute(interaction);
    } catch (error) {
      console.error('Error en handleCommand:', error);
      await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', flags: MessageFlags.Ephemeral }); // Cambiar aquí
    }
  },
};