const { MessageFlagsBitField } = require('discord.js'); // Cambiar MessageFlags a MessageFlagsBitField
const { handleRaidAutocomplete } = require('../utils/raidUtils/raidAutoCompleteHandler');
const { handleHeroAutocomplete } = require('../utils/heroesUtils/heroAutoCompleteHandler');
const { handleCommand } = require('../utils/commandHandler');

const autocompleteHandlers = {
  'raid': handleRaidAutocomplete,
  'heroes': handleHeroAutocomplete,
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isAutocomplete()) {
        const handler = autocompleteHandlers[interaction.commandName];
        if (handler) {
          await handler(interaction);
        } else {
          console.warn(`No autocomplete handler found for command: ${interaction.commandName}`);
        }
        return;
      }

      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
        return;
      }

      console.warn(`Interacción no manejada: ${interaction.type}`);
    } catch (error) {
      console.error('Error en interactionCreate:', error);

      if (interaction.isChatInputCommand() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.', flags: MessageFlagsBitField.Flags.Ephemeral }); // Cambiar aquí
      } else if (interaction.isAutocomplete() && !interaction.responded) {
        await interaction.respond([]);
      }
    }
  },
};