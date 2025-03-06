const { MessageFlagsBitField } = require('discord.js'); // Cambiar MessageFlags a MessageFlagsBitField
const { loadCommands } = require('./commandLoader');

module.exports = {
  async handleCommand(interaction) {
    try {
      const commands = loadCommands();
      if (!Array.isArray(commands)) {
        throw new Error('Los comandos no se cargaron correctamente.');
      }

      const command = commands.find(cmd => cmd.data.name === interaction.commandName);
      if (!command) {
        return interaction.reply({ content: 'Comando no encontrado.', flags: MessageFlagsBitField.Flags.Ephemeral }); // Cambiar aquí
      }

      await command.execute(interaction);
    } catch (error) {
      console.error('Error en handleCommand:', error);
      await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', flags: MessageFlagsBitField.Flags.Ephemeral }); // Cambiar aquí
    }
  },
};