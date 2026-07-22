import { Link } from 'react-router-dom';
import './Toast.css';

// Notification discrète en bas d'écran (slide up/down via la classe `visible`),
// affichée après un équipement réussi pour proposer de revenir à la fiche perso
// sans forcer la navigation. Le minuteur d'auto-fermeture est géré par l'appelant
// (state `visible` + `setTimeout` remis à zéro à chaque nouvel équipement).
function Toast({ visible, lien }) {
  return (
    <div className={`toast ${visible ? 'toast--visible' : ''}`}>
      <span>Équipé !</span>
      <Link to={lien} className="toast__lien">
        Retourner à l'équipement →
      </Link>
    </div>
  );
}

export default Toast;
