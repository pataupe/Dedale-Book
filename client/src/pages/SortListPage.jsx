import { useEffect, useState } from 'react';
import { listerSorts } from '../api/sorts';
import { ELEMENTS_SORTS } from '../constants/elementsSorts';
import { RANGS_MAITRISE } from '../constants/rangsMaitrise';
import SortCard from '../components/SortCard';
import './SortListPage.css';

const PAR_PAGE = 24;

// Plusieurs filtres actifs en même temps sur une ligne (contrairement aux cubes,
// où un seul élément/rang est actif à la fois) : on ajoute/retire de la liste.
function basculerMulti(liste, valeur) {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

function SortListPage() {
  const [recherche, setRecherche] = useState('');
  const [elementsActifs, setElementsActifs] = useState([]);
  const [rangsActifs, setRangsActifs] = useState([]);
  const [page, setPage] = useState(0);
  const [sorts, setSorts] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [recherche, elementsActifs, rangsActifs]);

  useEffect(() => {
    setChargement(true);
    setErreur(null);

    listerSorts({
      nom: recherche,
      elements: elementsActifs,
      rangs: rangsActifs,
      limite: PAR_PAGE,
      offset: page * PAR_PAGE,
    })
      .then(setSorts)
      .catch(() => setErreur('Impossible de charger les sorts. Le serveur est-il lancé ?'))
      .finally(() => setChargement(false));
  }, [recherche, elementsActifs, rangsActifs, page]);

  return (
    <div className="page-sorts">
      <h1>Sorts du Dédale</h1>

      <div className="page-sorts__filtres">
        <input
          type="text"
          placeholder="Rechercher un sort..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />

        <div className="page-sorts__options">
          {ELEMENTS_SORTS.map((el) => (
            <button
              key={el}
              className={elementsActifs.includes(el) ? 'actif' : ''}
              onClick={() => setElementsActifs((actuels) => basculerMulti(actuels, el))}
            >
              {el}
            </button>
          ))}
        </div>

        <div className="page-sorts__options">
          {RANGS_MAITRISE.map((rang) => (
            <button
              key={rang}
              className={rangsActifs.includes(rang) ? 'actif' : ''}
              onClick={() => setRangsActifs((actuels) => basculerMulti(actuels, rang))}
            >
              {rang}
            </button>
          ))}
        </div>
      </div>

      {erreur && <p className="page-sorts__erreur">{erreur}</p>}
      {chargement && <p>Chargement...</p>}
      {!chargement && !erreur && sorts.length === 0 && <p>Aucun sort ne correspond à ta recherche.</p>}

      <div className="page-sorts__grille">
        {sorts.map((sort) => (
          <SortCard key={sort.id} sort={sort} />
        ))}
      </div>

      <div className="page-sorts__pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Page précédente
        </button>
        <span>Page {page + 1}</span>
        <button disabled={sorts.length < PAR_PAGE} onClick={() => setPage((p) => p + 1)}>
          Page suivante →
        </button>
      </div>
    </div>
  );
}

export default SortListPage;
