const { getBossData } = require('./api');

module.exports = {
  async handleAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const choices = [];

    try {
      if (focusedOption.name === 'jefe') {
        // Obtener la lista de jefes
        const bossData = await getBossData();
        if (Array.isArray(bossData)) {
          choices.push(...bossData.map(boss => ({ name: boss.boss.toUpperCase(), value: boss.boss })));
        }
      } else if (focusedOption.name === 'elemento') {
        // Obtener la lista de elementos para el jefe seleccionado
        const selectedBoss = interaction.options.getString('jefe');
        if (selectedBoss) {
          const bossData = await getBossData(); // Obtener la lista completa de jefes
          const boss = bossData.find(b => b.boss === selectedBoss);
          if (boss && Array.isArray(boss.element)) {
            choices.push(...boss.element.map(element => ({ name: element.toUpperCase(), value: element })));
          }
        } else {
          console.error('No boss selected for element autocomplete');
        }
      }

      // Filtrar las opciones según lo que el usuario ha escrito
      const filtered = choices.filter(choice =>
        choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())
      );

      // Responder con las opciones filtradas (máximo 25)
      await interaction.respond(filtered.slice(0, 25));
    } catch (error) {
      console.error('Error in handleAutocomplete:', error);
      await interaction.respond([]); // Responder con un array vacío en caso de error
    }
  },
};