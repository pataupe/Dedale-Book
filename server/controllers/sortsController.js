const pool = require('../config/db');

const LIMITE_MAX = 500;
const LIMITE_PAR_DEFAUT = 50;

function parserPagination(query) {
  const limite = Math.min(parseInt(query.limit, 10) || LIMITE_PAR_DEFAUT, LIMITE_MAX);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limite, offset };
}

function parserListe(valeur) {
  return valeur ? valeur.split(',').filter(Boolean) : [];
}

// GET /api/sorts?nom=&elements=&rangs=&limit=&offset=
// `elements` et `rangs` acceptent plusieurs valeurs séparées par des virgules
// (plusieurs filtres actifs en même temps, combinés en OR entre eux).
async function listerSorts(req, res) {
  const { nom } = req.query;
  const elements = parserListe(req.query.elements);
  const rangs = parserListe(req.query.rangs);
  const { limite, offset } = parserPagination(req.query);

  const conditions = ['visible = 1'];
  const params = [];

  if (nom) {
    conditions.push('nom LIKE ?');
    params.push(`%${nom}%`);
  }
  if (elements.length) {
    // LIKE plutôt que = : certains sorts ont plusieurs éléments à la fois
    // stockés dans un seul champ texte (ex: "Feu, Air").
    conditions.push(`(${elements.map(() => 'element LIKE ?').join(' OR ')})`);
    elements.forEach((el) => params.push(`%${el}%`));
  }
  if (rangs.length) {
    conditions.push(`(${rangs.map(() => 'rang_evolution = ?').join(' OR ')})`);
    params.push(...rangs);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [sorts] = await pool.query(
    `SELECT * FROM Sort ${whereClause} ORDER BY id LIMIT ? OFFSET ?`,
    [...params, limite, offset]
  );

  res.json(sorts);
}

module.exports = { listerSorts };
