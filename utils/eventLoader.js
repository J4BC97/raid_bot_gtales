const fs = require('fs');
const path = require('path');

module.exports = {
    loadEvents(client) {
        const eventsPath = path.join(__dirname, '../events'); // Ruta a la carpeta de eventos
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }

        console.log(`Se cargaron ${eventFiles.length} eventos correctamente.`);
    },
};