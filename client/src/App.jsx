import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CubeListPage from './pages/CubeListPage';
import CubeDetailPage from './pages/CubeDetailPage';
import BreloqueListPage from './pages/BreloqueListPage';
import SortListPage from './pages/SortListPage';
import ConnexionPage from './pages/ConnexionPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cubes" element={<CubeListPage />} />
        <Route path="/cubes/:id" element={<CubeDetailPage />} />
        <Route path="/breloques" element={<BreloqueListPage />} />
        <Route path="/sorts" element={<SortListPage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
      </Routes>
    </>
  );
}

export default App;
