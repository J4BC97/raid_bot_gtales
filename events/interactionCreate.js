const { handleAutocomplete } = require('../utils/autoCompleteHandler');
const { handleCommand } = require('../utils/commandHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction);
        }

        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction);
        }
    },
};