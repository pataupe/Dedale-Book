import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.webp';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { session, deconnecter } = useAuth();
  const navigate = useNavigate();

  function seDeconnecter() {
    deconnecter();
    navigate('/');
  }

  return (
    <header className="entete">
      <Link to="/" className="entete__logo">
        <img src={logo} alt="Dédalofus" />
        <span>Dédalofus</span>
      </Link>
      <nav className="entete__nav">
        <div className="entete__liens">
          <Link to="/cubes" className="entete__lien">
            Cubes
          </Link>
          <Link to="/breloques" className="entete__lien">
            Breloques
          </Link>
          <Link to="/sorts" className="entete__lien">
            Sorts
          </Link>
        </div>
        {session ? (
          <div className="entete__compte">
            <span className="entete__pseudo">{session.utilisateur.pseudo}</span>
            <button className="entete__deconnexion" onClick={seDeconnecter}>
              Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/connexion" className="entete__connexion">
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
