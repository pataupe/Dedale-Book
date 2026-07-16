import { useEffect, useState } from 'react';
import { listerSorts } from '../api/sorts';
import SortCard from '../components/SortCard';
import './SortListPage.css';

const PAR_PAGE = 24;

function SortListPage() {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(0);
  const [sorts, setSorts] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [recherche]);

  useEffect(() => {
    setChargement(true);
    setErreur(null);

    listerSorts({ nom: recherche, limite: PAR_PAGE, offset: page * PAR_PAGE })
      .then(setSorts)
      .catch(() => setErreur('Impossible de charger les sorts. Le serveur est-il lancé ?'))
      .finally(() => setChargement(false));
  }, [recherche, page]);

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
