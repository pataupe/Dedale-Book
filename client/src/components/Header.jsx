import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.webp';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { session, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  function seDeconnecter() {
    setMenuOuvert(false);
    deconnecter();
    navigate('/');
  }

  function fermerMenu() {
    setMenuOuvert(false);
  }

  return (
    <header className="entete">
      <div className="entete__barre">
        <Link to="/" className="entete__logo" onClick={fermerMenu}>
          <img src={logo} alt="Dédalofus" />
          <span>Dédalofus</span>
        </Link>
        <button
          type="button"
          className={`entete__hamburger ${menuOuvert ? 'entete__hamburger--ouvert' : ''}`}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOuvert}
          onClick={() => setMenuOuvert((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`entete__nav ${menuOuvert ? 'entete__nav--ouvert' : ''}`}>
        <div className="entete__liens">
          <Link to="/cubes" className="entete__lien" onClick={fermerMenu}>
            Cubes
          </Link>
          <Link to="/breloques" className="entete__lien" onClick={fermerMenu}>
            Breloques
          </Link>
          <Link to="/sorts" className="entete__lien" onClick={fermerMenu}>
            Sorts
          </Link>
          {session && (
            <Link to="/personnage" className="entete__lien entete__lien--compte" onClick={fermerMenu}>
              Mes stuffs
            </Link>
          )}
        </div>
        {session ? (
          <div className="entete__compte">
            <span className="entete__pseudo">{session.utilisateur.pseudo}</span>
            <button className="entete__deconnexion" onClick={seDeconnecter}>
              Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/connexion" className="entete__connexion" onClick={fermerMenu}>
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
