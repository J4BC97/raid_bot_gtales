const bosses = require('./bosses');

module.exports = {
    async handleAutocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const choices = [];

        if (focusedOption.name === 'jefe') {
            choices.push(...bosses.map(boss => ({ name: boss.name.toUpperCase(), value: boss.name })));
        } else if (focusedOption.name === 'elemento') {
            const selectedBoss = interaction.options.getString('jefe');
            const bossData = bosses.find(boss => boss.name === selectedBoss);
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