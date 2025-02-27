const { getBossData } = require('./api');

module.exports = {
    async handleAutocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const choices = [];

        if (focusedOption.name === 'jefe') {
            const bossData = await getBossData();
            choices.push(...bossData.map(boss => ({ name: boss.name.toUpperCase(), value: boss.name })));
        } else if (focusedOption.name === 'elemento') {
            const selectedBoss = interaction.options.getString('jefe');
            const bossData = await getBossData(selectedBoss);
            if (bossData) {
                choices.push(...bossData.elements.map(element => ({ name: element.toUpperCase(), value: element })));
            }
        }

        const filtered = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );

        await interaction.respond(filtered.slice(0, 25));
    },
};