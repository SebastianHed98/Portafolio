import { HashRouter as Router } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import NotificationContainer from './components/NotificationContainer';

function App() {
  return (
    <MovieProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AppRoutes />
          <NotificationContainer />
        </div>
      </Router>
    </MovieProvider>
  );
}

export default App;
