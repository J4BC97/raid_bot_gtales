const { MessageFlags } = require('discord.js'); // Añadir MessageFlags
const { handleRaidAutocomplete } = require('../utils/raidUtils/raidAutoCompleteHandler');
const { handleHeroAutocomplete } = require('../utils/heroesUtils/heroAutoCompleteHandler');
const { handleCommand } = require('../utils/commandHandler');

// Mapeo de comandos a sus manejadores de autocompletado
const autocompleteHandlers = {
  'raid': handleRaidAutocomplete,
  'heroes': handleHeroAutocomplete,
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // Manejar autocompletado
      if (interaction.isAutocomplete()) {
        const handler = autocompleteHandlers[interaction.commandName];
        if (handler) {
          await handler(interaction);
        } else {
          console.warn(`No autocomplete handler found for command: ${interaction.commandName}`);
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

      // Responder al usuario en caso de error (solo si no se ha respondido antes)
      if (interaction.isChatInputCommand() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.', flags: MessageFlags.Ephemeral }); // Cambiar aquí
      } else if (interaction.isAutocomplete() && !interaction.responded) {
        await interaction.respond([]); // Responder con un array vacío en caso de error
      }
    }
  },
};