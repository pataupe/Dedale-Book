import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listerSorts } from '../api/sorts';
import { equiperSortAuto } from '../api/personnages';
import { useAuth } from '../context/AuthContext';
import { ELEMENTS_SORTS } from '../constants/elementsSorts';
import { RANGS_MAITRISE } from '../constants/rangsMaitrise';
import SortCard from '../components/SortCard';
import Toast from '../components/Toast';
import './SortListPage.css';

const DUREE_TOAST_MS = 3000;

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
  const [erreurEquipement, setErreurEquipement] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeout = useRef(null);

  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const perso = searchParams.get('perso');
  const modeEquipement = Boolean(perso && session);

  useEffect(() => () => clearTimeout(toastTimeout.current), []);

  async function equiper(sortId) {
    setErreurEquipement(null);
    try {
      await equiperSortAuto(session.token, perso, sortId);
      setToastVisible(true);
      clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastVisible(false), DUREE_TOAST_MS);
    } catch {
      setErreurEquipement("Impossible d'équiper ce sort.");
    }
  }

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
      {erreurEquipement && <p className="page-sorts__erreur">{erreurEquipement}</p>}
      {chargement && <p>Chargement...</p>}
      {!chargement && !erreur && sorts.length === 0 && <p>Aucun sort ne correspond à ta recherche.</p>}

      <div className="page-sorts__grille">
        {sorts.map((sort) => (
          <div key={sort.id} className="page-sorts__carte">
            <SortCard sort={sort} />
            {modeEquipement && (
              <button type="button" className="page-sorts__bouton-equiper" onClick={() => equiper(sort.id)}>
                Équiper
              </button>
            )}
          </div>
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

      {modeEquipement && <Toast visible={toastVisible} lien={`/personnage/${perso}`} />}
    </div>
  );
}

export default SortListPage;
