const { createCanvas, loadImage } = require('@napi-rs/canvas');

// Función para generar la imagen del equipo recomendado
async function generateTeamImage(team) {
  // Crear un canvas para la imagen de héroes, armas y reliquia
  const canvas = createCanvas(1000, 500); // Tamaño del canvas
  const ctx = canvas.getContext('2d');

  // Cargar un fondo bonito (puedes cambiar la URL por la imagen que prefieras)
  const background = await loadImage('https://i.imgur.com/3QZQZQZ.png'); // Cambia esta URL por la de tu fondo
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Dibujar el fondo

  // Cargar las imágenes de los héroes, armas y reliquia
  const heroImages = await Promise.all(team.heroesAtr.map(async (heroAtr) => {
    return await loadImage(`https://www.gtales.top/assets/heroes/${heroAtr}.webp`);
  }));

  const weaponImages = await Promise.all(team.weaponsAtr.map(async (weaponAtr) => {
    return await loadImage(`https://www.gtales.top/assets/weapons/${weaponAtr}.webp`);
  }));

  const relicImage = await loadImage(`https://www.gtales.top/assets/relics/${team.relic}.webp`);

  // Dibujar las imágenes en el canvas
  const heroWidth = 100; // Ancho de la imagen del héroe
  const heroHeight = 100; // Alto de la imagen del héroe
  const weaponWidth = 100; // Ancho de la imagen del arma
  const weaponHeight = 100; // Alto de la imagen del arma
  const relicWidth = 100; // Ancho de la imagen de la reliquia
  const relicHeight = 100; // Alto de la imagen de la reliquia

  // Calcular la posición inicial para centrar los héroes y las armas
  const totalWidth = heroImages.length * (heroWidth + 50); // Espacio total ocupado por los héroes y armas
  const startX = (canvas.width - totalWidth) / 2; // Posición inicial en X para centrar

  // Dibujar héroes y armas
  heroImages.forEach((image, index) => {
    const x = startX + index * (heroWidth + 50); // Posición en X para cada héroe y arma

    // Dibujar héroe (100x100)
    ctx.drawImage(image, x, 50, heroWidth, heroHeight);

    // Dibujar arma debajo del héroe (100x100)
    ctx.drawImage(weaponImages[index], x, 180, weaponWidth, weaponHeight);
  });

  // Dibujar la reliquia en el centro, debajo de las armas
  const relicX = (canvas.width - relicWidth) / 2; // Centrar la reliquia en X
  const relicY = 300; // Posición Y de la reliquia (debajo de las armas)
  ctx.drawImage(relicImage, relicX, relicY, relicWidth, relicHeight);

  // Convertir el canvas a un buffer de imagen
  return canvas.toBuffer('image/png');
}

module.exports = { generateTeamImage };