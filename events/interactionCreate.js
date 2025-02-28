const { handleAutocomplete } = require('../utils/autoCompleteHandler');
const { handleHeroAutocomplete } = require('../utils/heroAutoCompleteHandler'); // Importar el nuevo manejador
const { handleCommand } = require('../utils/commandHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // Manejar autocompletado
      if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'heroes') {
          await handleHeroAutocomplete(interaction); // Manejar autocompletado para héroes
        } else {
          await handleAutocomplete(interaction); // Manejar autocompletado para otros comandos
        }
        return; // Salir después de manejar el autocompletado
      }

      // Manejar comandos de chat
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
        return; // Salir después de manejar el comando
      }

      // Si la interacción no es de autocompletado ni un comando de chat, ignorarla
      console.warn(`Interacción no manejada: ${interaction.type}`);
    } catch (error) {
      console.error('Error en interactionCreate:', error);

      // Responder al usuario en caso de error
      if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
        await interaction.reply({ content: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.', ephemeral: true });
      }
    }
  },
};