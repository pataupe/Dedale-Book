import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';
import './Header.css';

function Header() {
  return (
    <header className="entete">
      <Link to="/cubes" className="entete__logo">
        <img src={logo} alt="Dédalofus" />
        <span>Dédalofus</span>
      </Link>
      <nav className="entete__nav">
        <Link to="/cubes">Cubes</Link>
        <Link to="/breloques">Breloques</Link>
        <Link to="/sorts">Sorts</Link>
      </nav>
    </header>
  );
}

export default Header;
