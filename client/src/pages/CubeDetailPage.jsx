import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenirCube } from '../api/cubes';
import CubeCard from '../components/CubeCard';
import './CubeDetailPage.css';

function CubeDetailPage() {
  const { id } = useParams();
  const [cube, setCube] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setCube(null);
    setErreur(null);
    obtenirCube(id)
      .then(setCube)
      .catch(() => setErreur('Ce cube est introuvable.'));
  }, [id]);

  return (
    <div className="page-detail-cube">
      <Link to="/cubes" className="page-detail-cube__retour">
        ← Retour à la liste
      </Link>

      {erreur && <p className="page-cubes__erreur">{erreur}</p>}
      {!cube && !erreur && <p>Chargement...</p>}

      {cube && (
        <div className="page-detail-cube__carte">
          <CubeCard cube={cube} />
        </div>
      )}
    </div>
  );
}

export default CubeDetailPage;
