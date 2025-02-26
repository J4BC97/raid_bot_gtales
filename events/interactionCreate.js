const { handleAutocomplete } = require('../utils/autoCompleteHandler');
const { handleHeroAutocomplete } = require('../utils/heroAutoCompleteHandler'); // Importar el nuevo manejador
const { handleCommand } = require('../utils/commandHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'heroes') {
                await handleHeroAutocomplete(interaction); // Manejar autocompletado para héroes
            } else {
                await handleAutocomplete(interaction); // Manejar autocompletado para otros comandos
            }
        }

        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction);
        }
    },
};