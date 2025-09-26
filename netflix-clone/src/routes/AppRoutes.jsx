import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import Series from '../pages/Series';
import Favorites from '../pages/Favorites';
import Recommendations from '../components/Recommendations';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/series" element={<Series />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/recommendations" element={<Recommendations />} />
    </Routes>
  );
};

export default AppRoutes;
