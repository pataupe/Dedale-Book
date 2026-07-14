// Import des 420 cubes depuis cubes_v2.json vers les tables Cube + StatCube
// Usage : node server/scripts/import-cubes.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const cheminJson = path.join(__dirname, '..', '..', 'data', 'cubes_v2.json');
  const cubes = JSON.parse(fs.readFileSync(cheminJson, 'utf-8'));

  const connexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dedalofus',
  });

  console.log(`Import de ${cubes.length} cubes...`);

  let cubesInseres = 0;
  let statsInserees = 0;

  for (const cube of cubes) {
    await connexion.execute(
      `INSERT INTO \`Cube\` (id, nom, element, rang, numero, image_url)
       VALUES (?, ?, ?, ?, ?, NULL)
       ON DUPLICATE KEY UPDATE nom = VALUES(nom), element = VALUES(element),
         rang = VALUES(rang), numero = VALUES(numero)`,
      [cube.id, cube.nom, cube.element, cube.rang, cube.numero]
    );
    cubesInseres++;

    // On repart de zéro sur les stats de ce cube pour éviter les doublons si on relance le script
    await connexion.execute('DELETE FROM StatCube WHERE cube_id = ?', [cube.id]);

    for (const stat of cube.stats || []) {
      await connexion.execute(
        `INSERT INTO StatCube (cube_id, cle_stat, valeur, libelle) VALUES (?, ?, ?, ?)`,
        [cube.id, stat.key, stat.value, stat.label]
      );
      statsInserees++;
    }
  }

  console.log(`Terminé : ${cubesInseres} cubes et ${statsInserees} lignes de stats insérés.`);
  await connexion.end();
}

main().catch((err) => {
  console.error('Erreur pendant l\'import des cubes :', err);
  process.exit(1);
});
