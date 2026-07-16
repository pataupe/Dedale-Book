import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listerCubes } from '../api/cubes';
import { ELEMENTS } from '../constants/elements';
import { RANGS } from '../constants/rangs';
import CubeCard from '../components/CubeCard';
import './CubeListPage.css';

const PAR_PAGE = 24;

// Reclique sur le filtre déjà actif → le décoche (retour à "Tous").
function basculer(valeurActuelle, valeurCliquee) {
  return valeurActuelle === valeurCliquee ? '' : valeurCliquee;
}

function CubeListPage() {
  const [recherche, setRecherche] = useState('');
  const [elementActif, setElementActif] = useState('');
  const [rangActif, setRangActif] = useState('');
  const [page, setPage] = useState(0);
  const [cubes, setCubes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // On revient à la page 0 dès que la recherche ou un filtre change.
  useEffect(() => {
    setPage(0);
  }, [recherche, elementActif, rangActif]);

  useEffect(() => {
    setChargement(true);
    setErreur(null);

    listerCubes({
      nom: recherche,
      element: elementActif,
      rang: rangActif,
      limite: PAR_PAGE,
      offset: page * PAR_PAGE,
    })
      .then(setCubes)
      .catch(() => setErreur('Impossible de charger les cubes. Le serveur est-il lancé ?'))
      .finally(() => setChargement(false));
  }, [recherche, elementActif, rangActif, page]);

  return (
    <div className="page-cubes">
      <h1>Cubes du Dédale</h1>

      <div className="page-cubes__filtres">
        <input
          type="text"
          placeholder="Rechercher un cube..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />

        <div className="page-cubes__elements">
          <button
            className={elementActif === '' ? 'actif' : ''}
            onClick={() => setElementActif('')}
          >
            Tous
          </button>
          {ELEMENTS.map((e) => (
            <button
              key={e.valeur}
              className={elementActif === e.valeur ? 'actif' : ''}
              style={{ '--couleur-bouton': e.couleur }}
              onClick={() => setElementActif((actuel) => basculer(actuel, e.valeur))}
            >
              {e.valeur}
            </button>
          ))}
        </div>

        <div className="page-cubes__rangs">
          {RANGS.map((rang) => (
            <button
              key={rang}
              className={rangActif === rang ? 'actif' : ''}
              onClick={() => setRangActif((actuel) => basculer(actuel, rang))}
            >
              {rang}
            </button>
          ))}
        </div>
      </div>

      {erreur && <p className="page-cubes__erreur">{erreur}</p>}
      {chargement && <p>Chargement...</p>}

      {!chargement && !erreur && cubes.length === 0 && <p>Aucun cube ne correspond à ta recherche.</p>}

      <div className="page-cubes__grille">
        {cubes.map((cube) => (
          <Link key={cube.id} to={`/cubes/${cube.id}`}>
            <CubeCard cube={cube} />
          </Link>
        ))}
      </div>

      <div className="page-cubes__pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Page précédente
        </button>
        <span>Page {page + 1}</span>
        <button disabled={cubes.length < PAR_PAGE} onClick={() => setPage((p) => p + 1)}>
          Page suivante →
        </button>
      </div>
    </div>
  );
}

export default CubeListPage;
