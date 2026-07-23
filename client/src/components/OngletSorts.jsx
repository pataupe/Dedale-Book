import SortCard from './SortCard';
import './OngletSorts.css';

// Affiche les sorts équipés avec leurs dégâts calculés pour ce personnage
// (personnage.degats, produit par calculerDegats côté serveur), contrairement
// à la page /sorts publique qui affiche les valeurs de base. Un sort qui tape
// dans 2 éléments à la fois a 2 entrées dans `degats` -> 2 cartes.
function OngletSorts({ personnage }) {
  const sortsEquipes = personnage.sorts.filter(({ sort }) => sort);

  if (sortsEquipes.length === 0) {
    return <p className="onglet-sorts__vide">Aucun sort équipé pour l'instant.</p>;
  }

  return (
    <div className="onglet-sorts__grille">
      {sortsEquipes.map(({ emplacement, sort }) => {
        const calculs = personnage.degats.filter((d) => d.sortId === sort.id);

        if (calculs.length === 0) {
          return <SortCard key={emplacement} sort={sort} />;
        }

        return calculs.map((calcul) => (
          <SortCard key={`${emplacement}-${calcul.element}`} sort={sort} calcul={calcul} />
        ));
      })}
    </div>
  );
}

export default OngletSorts;
