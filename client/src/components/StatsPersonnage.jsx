import { useEffect, useState } from 'react';
import { sauvegarderParcho as sauvegarderParchoApi } from '../api/personnages';
import './StatsPersonnage.css';

// Regroupement en blocs façon DofusBook. Les clés viennent soit directement
// des stats brutes des cubes (ex: FORCE), soit des stats dérivées calculées
// par `calculerStatsPersonnage` (server/logic/calcul.js) — respecter le mélange
// `_TOTAL`/`_TOTALE` exact, ce sont les noms réellement produits par ce module.
const BLOCS = [
  {
    titre: 'Principal',
    lignes: [
      { cle: 'VITALITE_TOTALE', libelle: 'PdV' },
      { cle: 'PA_TOTAL', libelle: 'PA' },
      { cle: 'PM_TOTAL', libelle: 'PM' },
      { cle: 'PO', libelle: 'PO' },
      { cle: 'INVOCATION_TOTALE', libelle: 'Invocation' },
      { cle: 'INITIATIVE_TOTALE', libelle: 'Initiative' },
      { cle: '%_COUP_CRITIQUE', libelle: '% Critique' },
      { cle: 'SOIN', libelle: 'Soin' },
    ],
  },
  {
    titre: 'Mobilité',
    lignes: [
      { cle: 'FUITE_TOTALE', libelle: 'Fuite' },
      { cle: 'TACLE_TOTAL', libelle: 'Tacle' },
      { cle: 'ESQUIVE_PA_TOTALE', libelle: 'Esquive PA' },
      { cle: 'ESQUIVE_PM_TOTALE', libelle: 'Esquive PM' },
      { cle: 'RETRAIT_PA_TOTAL', libelle: 'Retrait PA' },
      { cle: 'RETRAIT_PM_TOTAL', libelle: 'Retrait PM' },
    ],
  },
  {
    titre: 'Dommages',
    lignes: [
      { cle: 'DOMMAGES_FEU_TOTAL', libelle: 'Dommages Feu' },
      { cle: 'DOMMAGES_TERRE_TOTAL', libelle: 'Dommages Terre' },
      { cle: 'DOMMAGES_EAU_TOTAL', libelle: 'Dommages Eau' },
      { cle: 'DOMMAGES_AIR_TOTAL', libelle: 'Dommages Air' },
      { cle: 'DO_CRIT', libelle: 'Dommages Critiques' },
      { cle: 'DO_POU', libelle: 'Dommages Poussée' },
    ],
  },
  {
    titre: 'Résistances',
    lignes: [
      { cle: 'RES_NEUTRE', libelle: 'Résistance Neutre' },
      { cle: '%_RES_NEUTRE', libelle: '% Résistance Neutre' },
      { cle: 'RES_TERRE', libelle: 'Résistance Terre' },
      { cle: '%_RES_TERRE', libelle: '% Résistance Terre' },
      { cle: 'RES_FEU', libelle: 'Résistance Feu' },
      { cle: '%_RES_FEU', libelle: '% Résistance Feu' },
      { cle: 'RES_EAU', libelle: 'Résistance Eau' },
      { cle: '%_RES_EAU', libelle: '% Résistance Eau' },
      { cle: 'RES_AIR', libelle: 'Résistance Air' },
      { cle: '%_RES_AIR', libelle: '% Résistance Air' },
      { cle: 'RES_CRIT', libelle: 'Résistance Critiques' },
      { cle: 'RES_POU', libelle: 'Résistance Poussée' },
    ],
  },
];

// Les 6 caractéristiques qui ont une case "Parcho" éditable (dans cet ordre
// précis, façon DofusBook). Puissance n'a pas de Parcho, elle reste à part.
const CARACTERISTIQUES_EDITABLES = [
  { cle: 'VITALITE', libelle: 'Vitalité' },
  { cle: 'SAGESSE', libelle: 'Sagesse' },
  { cle: 'FORCE', libelle: 'Force' },
  { cle: 'INTELLIGENCE', libelle: 'Intelligence' },
  { cle: 'CHANCE', libelle: 'Chance' },
  { cle: 'AGILITE', libelle: 'Agilité' },
];

const BOUTONS_REMPLISSAGE = [0, 100, 150];

function StatsPersonnage({ stats, parcho, token, personnageId, onParchoSauvegarde }) {
  const [parchoLocal, setParchoLocal] = useState(parcho);
  const [erreurParcho, setErreurParcho] = useState(null);

  useEffect(() => {
    setParchoLocal(parcho);
  }, [parcho]);

  async function sauvegarder(valeurs) {
    setErreurParcho(null);
    try {
      await sauvegarderParchoApi(token, personnageId, valeurs);
      // Les stats dérivées (PdV, Tacle, Fuite, Retrait/Esquive PA-PM...) dépendent du
      // Parcho côté serveur (calculerStatsPersonnage) : on redemande la fiche perso
      // pour les mettre à jour, plutôt que de dupliquer ces formules en JS ici.
      onParchoSauvegarde?.();
    } catch (err) {
      setErreurParcho(err.message);
    }
  }

  function modifierParcho(cle, valeurBrute) {
    const valeur = valeurBrute === '' ? 0 : Math.max(0, parseInt(valeurBrute, 10) || 0);
    setParchoLocal((p) => ({ ...p, [cle]: valeur }));
  }

  function remplirTout(valeur) {
    const nouveau = Object.fromEntries(CARACTERISTIQUES_EDITABLES.map((c) => [c.cle, valeur]));
    setParchoLocal(nouveau);
    sauvegarder(nouveau);
  }

  return (
    <div className="stats-personnage">
      {BLOCS.slice(0, 1).map((bloc) => (
        <div key={bloc.titre} className="stats-personnage__bloc">
          <h2 className="stats-personnage__titre">{bloc.titre}</h2>
          <ul className="stats-personnage__liste">
            {bloc.lignes.map(({ cle, libelle }) => (
              <li key={cle}>
                {stats[cle] || 0} {libelle}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="stats-personnage__bloc">
        <h2 className="stats-personnage__titre">Caractéristiques</h2>
        <div className="stats-personnage__carac-entetes">
          <span>Total</span>
          <span>Parcho</span>
        </div>
        {CARACTERISTIQUES_EDITABLES.map(({ cle, libelle }) => (
          <div key={cle} className="stats-personnage__carac-ligne">
            <span className="stats-personnage__carac-total">
              {stats[cle] || 0} {libelle}
            </span>
            <input
              type="number"
              min="0"
              className="stats-personnage__carac-parcho"
              value={parchoLocal[cle] ?? 0}
              onChange={(e) => modifierParcho(cle, e.target.value)}
              onBlur={(e) => {
                // On relit la valeur directement dans le champ plutôt que dans
                // parchoLocal : évite de sauvegarder une valeur pas encore à
                // jour si le blur arrive avant que le re-render du onChange
                // n'ait eu lieu (rare mais possible en saisie rapide).
                const valeur = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                sauvegarder({ ...parchoLocal, [cle]: valeur });
              }}
            />
          </div>
        ))}
        <div className="stats-personnage__carac-boutons">
          {BOUTONS_REMPLISSAGE.map((valeur) => (
            <button key={valeur} type="button" onClick={() => remplirTout(valeur)}>
              {valeur}
            </button>
          ))}
        </div>
        <p className="stats-personnage__carac-puissance">{stats.PUISSANCE || 0} Puissance</p>
        {erreurParcho && <p className="stats-personnage__erreur">{erreurParcho}</p>}
      </div>

      {BLOCS.slice(1).map((bloc) => (
        <div key={bloc.titre} className="stats-personnage__bloc">
          <h2 className="stats-personnage__titre">{bloc.titre}</h2>
          <ul className="stats-personnage__liste">
            {bloc.lignes.map(({ cle, libelle }) => (
              <li key={cle}>
                {stats[cle] || 0} {libelle}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default StatsPersonnage;
