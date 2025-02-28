const { getBossData } = require('./api');

module.exports = {
  async handleAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const choices = [];

    try {
      if (focusedOption.name === 'jefe') {
        const bossData = await getBossData();
        if (Array.isArray(bossData)) {
          choices.push(...bossData.map(boss => ({ name: boss.boss.toUpperCase(), value: boss.boss })));
        }
      } else if (focusedOption.name === 'elemento') {
        const selectedBoss = interaction.options.getString('jefe');
        if (selectedBoss) {
          const bossData = await getBossData(selectedBoss, ''); // Pasar el jefe y un elemento vacío
          if (Array.isArray(bossData)) {
            const boss = bossData.find(b => b.boss === selectedBoss);
            if (boss && Array.isArray(boss.element)) {
              choices.push(...boss.element.map(element => ({ name: element.toUpperCase(), value: element })));
            }
          }
        } else {
          console.error('No boss selected for element autocomplete');
        }
      }

      const filtered = choices.filter(choice =>
        choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())
      );

      // Asegúrate de que solo se responde una vez
      if (!interaction.responded) {
        await interaction.respond(filtered.slice(0, 25));
      }
    } catch (error) {
      console.error('Error in handleAutocomplete:', error);
      if (!interaction.responded) {
        await interaction.respond([]); // Responder con un array vacío en caso de error
      }
    }
  },
};