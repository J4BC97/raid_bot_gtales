const { EmbedBuilder } = require('discord.js');
const translations = require('./heroTranslations'); // Importar las traducciones

// Función para validar si una URL es válida
function isValidUrl(url) {
    try {
        new URL(url); // Intenta crear un objeto URL
        return true;
    } catch (error) {
        return false;
    }
}

// Función para crear el embed con los detalles del héroe
function createHeroEmbed(heroDetails, lang = 'en') {
    const t = translations[lang]; // Obtener las traducciones para el idioma seleccionado

    // Definir colores según el elemento del héroe
    const elementColors = {
        fire: '#FF5733',    // Rojo
        water: '#3399FF',   // Azul
        earth: '#8B4513',   // Marrón
        light: '#FFD700',   // Dorado
        dark: '#4B0082',    // Morado oscuro
        basic: '#A9A9A9',   // Gris
    };

    // Obtener el color basado en el elemento del héroe
    const embedColor = elementColors[heroDetails.element.toLowerCase()] || '#0099FF'; // Color por defecto

    // Crear el embed
    const embed = new EmbedBuilder()
        .setTitle(`**${heroDetails.name || 'Unknown Hero'}**`)
        .setDescription(`**${t.role}:** ${heroDetails.role || 'N/A'} | **${t.element}:** ${heroDetails.element || 'N/A'}`)
        .setColor(embedColor) // Color dinámico basado en el elemento
        .setFooter({ text: `Key: ${heroDetails.key}` });

    // Añadir campos de información básica
    embed.addFields(
        { name: `⭐ ${t.rarity}`, value: heroDetails.rarity || 'N/A', inline: true },
        { name: `📚 ${t.collection}`, value: heroDetails.collection || 'N/A', inline: true },
        { name: `⚔️ ${t.attack}`, value: heroDetails.stats.atk || 'N/A', inline: true },
        { name: `❤️ ${t.hp}`, value: heroDetails.stats.hp || 'N/A', inline: true },
        { name: `🛡️ ${t.defense}`, value: heroDetails.stats.def || 'N/A', inline: true },
    );

    // Construir la URL del thumbnail del héroe
    if (heroDetails.atr) {
        const heroThumbnailUrl = `https://gtales.top/assets/heroes/${heroDetails.atr}.webp`;
        if (isValidUrl(heroThumbnailUrl)) {
            embed.setThumbnail(heroThumbnailUrl);
        } else {
            console.warn(`Invalid hero thumbnail URL for ${heroDetails.name}: ${heroThumbnailUrl}`);
        }
    }

    // Añadir detalles de las habilidades, armas y variantes
    if (heroDetails.variants && heroDetails.variants.length > 0) {
        const variant = heroDetails.variants[0]; // Usar la primera variante

        // Añadir habilidades
        if (variant.na) {
            embed.addFields(
                { name: `🎯 ${t.normalAttack}`, value: variant.na.description || 'N/A', inline: false },
            );
        }
        if (variant.ability) {
            embed.addFields(
                { name: `✨ ${t.ability}`, value: variant.ability.description || 'N/A', inline: false },
            );
        }
        if (variant.chain) {
            embed.addFields(
                { name: `🌀 ${t.chainSkill}`, value: variant.chain.description || 'N/A', inline: false },
            );
        }
        if (variant.skill) {
            embed.addFields(
                { name: `🔥 ${t.skill}`, value: `**${variant.skill.title}**\n${variant.skill.description}\n**${t.damage}:** ${variant.skill.dmg}%\n**${t.cooldown}:** ${variant.skill.cd}s`, inline: false },
            );
        }

        // Añadir detalles del arma
        if (variant.weapon) {
            embed.addFields(
                { name: `⚔️ ${t.weapon}`, value: `**${variant.weapon.name}**\n**${t.type}:** ${variant.weapon.type}\n**${t.effect}:** ${variant.weapon.effect}\n**${t.damage}:** ${variant.weapon.dmg}\n**${t.attack}:** ${variant.weapon.atk}\n**${t.stats}:** ${variant.weapon.stats}\n**${t.options}:** ${variant.weapon.options}`, inline: false },
            );

            // Construir la URL del arma
            if (heroDetails.atr) {
                const weaponThumbnailUrl = `https://gtales.top/assets/weapons/${heroDetails.atr}.webp`;
                if (isValidUrl(weaponThumbnailUrl)) {
                    embed.setImage(weaponThumbnailUrl); // Usar setImage para mostrar el arma
                } else {
                    console.warn(`Invalid weapon thumbnail URL for ${heroDetails.name}: ${weaponThumbnailUrl}`);
                }
            }
        }
    }

    return embed;
}

module.exports = {
    createHeroEmbed,
};