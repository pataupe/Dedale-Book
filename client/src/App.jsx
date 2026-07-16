import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CubeListPage from './pages/CubeListPage';
import CubeDetailPage from './pages/CubeDetailPage';
import BreloqueListPage from './pages/BreloqueListPage';
import SortListPage from './pages/SortListPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/cubes" replace />} />
        <Route path="/cubes" element={<CubeListPage />} />
        <Route path="/cubes/:id" element={<CubeDetailPage />} />
        <Route path="/breloques" element={<BreloqueListPage />} />
        <Route path="/sorts" element={<SortListPage />} />
      </Routes>
    </>
  );
}

export default App;
