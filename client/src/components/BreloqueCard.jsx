import './BreloqueCard.css';

function BreloqueCard({ breloque }) {
  return (
    <div className="carte-breloque">
      <div className="carte-breloque__entete">
        {breloque.nom} — {breloque.rang}
      </div>
      <p className="carte-breloque__effet">{breloque.effet}</p>
    </div>
  );
}

export default BreloqueCard;
