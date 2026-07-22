import { useEffect, useState } from 'react';
import { STATS_CUBES } from '../constants/statsCubes';
import './PanopliesPersonnage.css';

// Même ordre que dans compterCubesParFamille (server/logic/calcul.js), sert juste
// à départager deux familles à égalité de nombre de cubes.
const ORDRE_FAMILLES = ['Air', 'Feu', 'Terre', 'Eau', 'Lumière'];

function libelleStat(cle) {
  return STATS_CUBES.find((s) => s.cle === cle)?.libelle || cle;
}

// Famille affichée par défaut : celle avec le plus de cubes comptés (Chaos inclus).
function meilleureFamille(panoplies) {
  return [...panoplies].sort((a, b) => {
    if (b.nombre !== a.nombre) return b.nombre - a.nombre;
    return ORDRE_FAMILLES.indexOf(a.famille) - ORDRE_FAMILLES.indexOf(b.famille);
  })[0]?.famille;
}

// N'affiche que les familles avec un ensemble actif (>= 2 cubes) — une seule à la
// fois pour éviter une page à rallonge quand plusieurs sont actives en même temps
// (ex: des cubes Chaos comptant dans les 5 familles) ; les autres sont accessibles
// via le menu déroulant qui s'ouvre au clic sur le nom de la famille affichée.
function PanopliesPersonnage({ panoplies }) {
  const [familleAffichee, setFamilleAffichee] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    if (!panoplies.some((p) => p.famille === familleAffichee)) {
      setFamilleAffichee(meilleureFamille(panoplies));
    }
  }, [panoplies, familleAffichee]);

  if (!panoplies || panoplies.length === 0) return null;

  const active = panoplies.find((p) => p.famille === familleAffichee) || panoplies[0];
  const autres = panoplies.filter((p) => p.famille !== active.famille);

  return (
    <div className="panoplies-personnage">
      <p className="panoplies-personnage__label">Bonus de panoplie :</p>

      <div className="panoplies-personnage__selecteur">
        {autres.length > 0 ? (
          <button
            type="button"
            className="panoplies-personnage__declencheur"
            onClick={() => setMenuOuvert((o) => !o)}
            aria-expanded={menuOuvert}
          >
            <span>
              Ensemble de Cubes {active.famille} ({active.nombre})
            </span>
            <span className={`panoplies-personnage__fleche ${menuOuvert ? 'panoplies-personnage__fleche--ouvert' : ''}`}>
              ▼
            </span>
          </button>
        ) : (
          <div className="panoplies-personnage__declencheur panoplies-personnage__declencheur--seul">
            <span>
              Ensemble de Cubes {active.famille} ({active.nombre})
            </span>
          </div>
        )}

        {menuOuvert && autres.length > 0 && (
          <ul className="panoplies-personnage__menu">
            {autres.map((p) => (
              <li key={p.famille}>
                <button
                  type="button"
                  onClick={() => {
                    setFamilleAffichee(p.famille);
                    setMenuOuvert(false);
                  }}
                >
                  Ensemble de Cubes {p.famille} ({p.nombre})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="panoplies-personnage__stats">
        {Object.entries(active.bonus).map(([cle, valeur]) => (
          <li key={cle}>
            {valeur} {libelleStat(cle)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PanopliesPersonnage;
