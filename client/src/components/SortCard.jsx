import './SortCard.css';

function SortCard({ sort }) {
  return (
    <div className="carte-sort">
      <div className="carte-sort__entete">{sort.nom}</div>
      <div className="carte-sort__corps">
        <p>{sort.cout_pa} PA</p>
        {sort.degats_min != null && sort.degats_max != null && (
          <p>
            {sort.degats_min} à {sort.degats_max} dégâts ({sort.element})
          </p>
        )}
        {sort.description && <p className="carte-sort__description">{sort.description}</p>}
      </div>
    </div>
  );
}

export default SortCard;
