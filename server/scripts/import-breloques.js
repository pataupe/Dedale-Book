// Import des breloques depuis "DEDALE - BRELOQUES.csv" vers la table Breloque
// Usage : node server/scripts/import-breloques.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { parse } = require('csv-parse/sync');

async function main() {
  const cheminCsv = path.join(__dirname, '..', '..', 'data', 'DEDALE - BRELOQUES.csv');
  const contenu = fs.readFileSync(cheminCsv, 'utf-8');
  const lignes = parse(contenu, { columns: true, skip_empty_lines: true });

  const connexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dedalofus',
  });

  console.log(`Import de ${lignes.length} breloques...`);

  // On vide la table avant de réimporter, pour pouvoir relancer le script sans doublons
  await connexion.execute('DELETE FROM Breloque');

  let inserees = 0;
  for (const ligne of lignes) {
    const nom = (ligne['Nom'] || '').trim();
    const rang = (ligne['Rang'] || '').trim();
    const effet = (ligne['Effet'] || '').trim();

    if (!nom) continue; // ligne vide, on ignore

    await connexion.execute(
      `INSERT INTO Breloque (nom, rang, effet) VALUES (?, ?, ?)`,
      [nom, rang, effet]
    );
    inserees++;
  }

  console.log(`Terminé : ${inserees} breloques insérées.`);
  await connexion.end();
}

main().catch((err) => {
  console.error('Erreur pendant l\'import des breloques :', err);
  process.exit(1);
});
