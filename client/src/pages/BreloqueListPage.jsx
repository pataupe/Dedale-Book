import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listerBreloques } from '../api/breloques';
import { equiperBreloqueAuto } from '../api/personnages';
import { useAuth } from '../context/AuthContext';
import { RANGS_MAITRISE } from '../constants/rangsMaitrise';
import { CATEGORIES_BRELOQUES } from '../constants/categoriesBreloques';
import BreloqueCard from '../components/BreloqueCard';
import Toast from '../components/Toast';
import './BreloqueListPage.css';

const DUREE_TOAST_MS = 3000;

const PAR_PAGE = 24;

// Plusieurs filtres actifs en même temps (ajoute/retire de la liste).
function basculerMulti(liste, valeur) {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

function BreloqueListPage() {
  const [recherche, setRecherche] = useState('');
  const [rangsActifs, setRangsActifs] = useState([]);
  // Filtre catégorie : purement visuel pour l'instant, pas envoyé à l'API. La table
  // Breloque n'a pas encore de colonne catégorie (catégories pas encore décidées
  // définitivement côté porteur de projet, voir CLAUDE.md) — à brancher plus tard.
  const [categoriesActives, setCategoriesActives] = useState([]);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [page, setPage] = useState(0);
  const [breloques, setBreloques] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [erreurEquipement, setErreurEquipement] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeout = useRef(null);

  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const perso = searchParams.get('perso');
  const modeEquipement = Boolean(perso && session);

  useEffect(() => () => clearTimeout(toastTimeout.current), []);

  async function equiper(breloqueId) {
    setErreurEquipement(null);
    try {
      await equiperBreloqueAuto(session.token, perso, breloqueId);
      setToastVisible(true);
      clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastVisible(false), DUREE_TOAST_MS);
    } catch {
      setErreurEquipement("Impossible d'équiper cette breloque.");
    }
  }

  useEffect(() => {
    setPage(0);
  }, [recherche, rangsActifs]);

  useEffect(() => {
    setChargement(true);
    setErreur(null);

    listerBreloques({ nom: recherche, rangs: rangsActifs, limite: PAR_PAGE, offset: page * PAR_PAGE })
      .then(setBreloques)
      .catch(() => setErreur('Impossible de charger les breloques. Le serveur est-il lancé ?'))
      .finally(() => setChargement(false));
  }, [recherche, rangsActifs, page]);

  return (
    <div className="page-breloques">
      <h1>Breloques du Dédale</h1>

      <div className="page-breloques__filtres">
        <input
          type="text"
          placeholder="Rechercher une breloque..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />

        <div className="page-breloques__rangs">
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

        <button
          type="button"
          className="page-breloques__bouton-plus-filtres"
          onClick={() => setFiltresOuverts((o) => !o)}
          aria-expanded={filtresOuverts}
        >
          + de filtres {filtresOuverts ? '▲' : '▼'}
        </button>

        <div className={`page-breloques__plus-filtres ${filtresOuverts ? 'ouvert' : ''}`}>
          <div className="page-breloques__plus-filtres-contenu">
            <p className="page-breloques__categories-note">Filtres par catégorie (bientôt actifs)</p>
            <div className="page-breloques__categories-grille">
              {CATEGORIES_BRELOQUES.map((categorie) => (
                <button
                  key={categorie}
                  className={categoriesActives.includes(categorie) ? 'actif' : ''}
                  onClick={() => setCategoriesActives((actuelles) => basculerMulti(actuelles, categorie))}
                >
                  {categorie}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {erreur && <p className="page-breloques__erreur">{erreur}</p>}
      {erreurEquipement && <p className="page-breloques__erreur">{erreurEquipement}</p>}
      {chargement && <p>Chargement...</p>}
      {!chargement && !erreur && breloques.length === 0 && <p>Aucune breloque ne correspond à ta recherche.</p>}

      <div className="page-breloques__grille">
        {breloques.map((breloque) => (
          <div key={breloque.id} className="page-breloques__carte">
            <BreloqueCard breloque={breloque} />
            {modeEquipement && (
              <button
                type="button"
                className="page-breloques__bouton-equiper"
                onClick={() => equiper(breloque.id)}
              >
                Équiper
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="page-breloques__pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Page précédente
        </button>
        <span>Page {page + 1}</span>
        <button disabled={breloques.length < PAR_PAGE} onClick={() => setPage((p) => p + 1)}>
          Page suivante →
        </button>
      </div>

      {modeEquipement && <Toast visible={toastVisible} lien={`/personnage/${perso}`} />}
    </div>
  );
}

export default BreloqueListPage;
