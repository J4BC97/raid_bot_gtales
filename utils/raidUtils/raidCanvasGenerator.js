const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path'); // Importar el módulo path para manejar rutas de archivos

// Función para generar la imagen del equipo recomendado
async function generateTeamImage(team) {
  // Crear un canvas para la imagen de héroes, armas y reliquia
  const canvas = createCanvas(1200, 600); // Aumentamos el tamaño del canvas
  const ctx = canvas.getContext('2d');

  // Cargar una imagen de fondo local (ajusta la ruta según tu proyecto)
  const backgroundPath = path.join(__dirname, '../../assets/background_image.jpg'); // Ruta local
  const background = await loadImage(backgroundPath); // Cargar la imagen de fondo
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Dibujar el fondo

  // Cargar las imágenes de los héroes, armas y reliquia
  const heroImages = await Promise.all(team.heroesAtr.map(async (heroAtr) => {
    return await loadImage(`https://www.gtales.top/assets/heroes/${heroAtr}.webp`);
  }));

  const weaponImages = await Promise.all(team.weaponsAtr.map(async (weaponAtr) => {
    return await loadImage(`https://www.gtales.top/assets/weapons/${weaponAtr}.webp`);
  }));

  const relicImage = await loadImage(`https://www.gtales.top/assets/relics/${team.relic}.webp`);

  // Tamaños de las imágenes
  const heroWidth = 150; // Aumentamos el ancho de la imagen del héroe
  const heroHeight = 150; // Aumentamos el alto de la imagen del héroe
  const weaponWidth = 150; // Aumentamos el ancho de la imagen del arma
  const weaponHeight = 150; // Aumentamos el alto de la imagen del arma
  const relicWidth = 150; // Aumentamos el ancho de la imagen de la reliquia
  const relicHeight = 150; // Aumentamos el alto de la imagen de la reliquia

  // Calcular la posición inicial para centrar los héroes y las armas
  const totalWidth = heroImages.length * (heroWidth + 50); // Espacio total ocupado por los héroes y armas
  const startX = (canvas.width - totalWidth) / 2; // Posición inicial en X para centrar

  // Dibujar héroes y armas
  heroImages.forEach((image, index) => {
    const x = startX + index * (heroWidth + 50); // Posición en X para cada héroe y arma

    // Dibujar héroe (150x150)
    ctx.drawImage(image, x, 50, heroWidth, heroHeight);

    // Dibujar arma debajo del héroe (150x150)
    ctx.drawImage(weaponImages[index], x, 230, weaponWidth, weaponHeight); // Ajustamos la posición Y
  });

  // Dibujar la reliquia en el centro, debajo de las armas
  const relicX = (canvas.width - relicWidth) / 2; // Centrar la reliquia en X
  const relicY = 430; // Posición Y de la reliquia (debajo de las armas)
  ctx.drawImage(relicImage, relicX, relicY, relicWidth, relicHeight);

  // Convertir el canvas a un buffer de imagen
  return canvas.toBuffer('image/png');
}

module.exports = { generateTeamImage };