const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const translations = require('../utils/translations'); // Importar las traducciones

// Función para obtener la lista de héroes desde la API
async function fetchHeroes() {
    try {
        const response = await axios.get('https://www.gtales.top/api/heroes');
        return response.data;
    } catch (error) {
        console.error('Error fetching heroes:', error);
        return null;
    }
}

// Función para obtener los detalles de un héroe específico
async function fetchHeroDetails(heroKey) {
    try {
        const response = await axios.get(`https://www.gtales.top/api/heroes?hero=${heroKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hero details:', error);
        return null;
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

// Función para validar si una URL es válida
function isValidUrl(url) {
    try {
        new URL(url); // Intenta crear un objeto URL
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('Search for a hero and get their details.')
        .addStringOption(option =>
            option.setName('hero')
                .setDescription('The name of the hero')
                .setRequired(true)
                .setAutocomplete(true)), // Habilitar autocompletado
    async execute(interaction) {
        const selectedHeroKey = interaction.options.getString('hero');
        const lang = 'es'; // Puedes cambiar esto según el idioma del usuario

        try {
            // Obtener los detalles del héroe seleccionado
            const heroDetails = await fetchHeroDetails(selectedHeroKey);

            if (!heroDetails) {
                return interaction.reply({ content: translations[lang].heroNotFound, ephemeral: true });
            }

            // Crear el embed con los detalles del héroe
            const heroEmbed = createHeroEmbed(heroDetails, lang);

            // Responder con el embed
            await interaction.reply({ embeds: [heroEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching hero details:', error);
            return interaction.reply({ content: translations[lang].heroDetailsError, ephemeral: true });
        }
    },
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const heroes = await fetchHeroes();

        if (!Array.isArray(heroes) || heroes.length === 0) {
            return interaction.respond([]); // Si no hay héroes, no mostrar opciones
        }

        // Filtrar los héroes basados en lo que el usuario está escribiendo
        const filteredHeroes = heroes
            .filter(hero => hero.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
            .slice(0, 25); // Limitar a 25 opciones para el autocompletado

        // Responder con las opciones filtradas
        await interaction.respond(
            filteredHeroes.map(hero => ({
                name: hero.name, // Usar el nombre del héroe para mostrar en el autocompletado
                value: hero.key, // Usar el key del héroe como valor
            }))
        );
    },
};