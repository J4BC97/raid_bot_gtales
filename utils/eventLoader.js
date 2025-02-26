const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    loadEvents: async (client) => {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = await import(filePath); // Use dynamic import
            if (event.default.once) {
                client.once(event.default.name, (...args) => event.default.execute(...args));
            } else {
                client.on(event.default.name, (...args) => event.default.execute(...args));
            }
            console.log(`Se cargaron ${eventFiles.length} eventos correctamente.`);
        }
    }
}