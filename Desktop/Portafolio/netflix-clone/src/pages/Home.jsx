import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { getTrending, getPopularMovies, getPopularSeries } from '../services/tmdbApi';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Console.log temporal para verificar que la página se esté renderizando
  console.log('🏠 Home page renderizada');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📡 Iniciando fetch de datos de Home...');

        // Obtener datos en paralelo
        const [trendingData, moviesData, seriesData, topRatedData] = await Promise.all([
          getTrending('all', 'week'),
          getPopularMovies(1),
          getPopularSeries(1),
          getPopularMovies(2), // Usar página 2 para variedad
        ]);

        setTrending(trendingData || []);
        setPopularMovies(moviesData || []);
        setPopularSeries(seriesData || []);
        setTopRated(topRatedData || []);

        console.log('✅ Datos de Home cargados:', {
          trending: trendingData?.length || 0,
          movies: moviesData?.length || 0,
          series: seriesData?.length || 0,
          topRated: topRatedData?.length || 0,
        });
      } catch (error) {
        console.error('❌ Error fetching home data:', error);
        // Datos de respaldo para demostración
        setTrending([
          {
            id: 1,
            title: 'Stranger Things',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 8.7,
            release_date: '2022-05-27',
            adult: false,
          },
          {
            id: 2,
            title: 'Breaking Bad',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.5,
            release_date: '2008-01-20',
            adult: false,
          },
        ]);
        setPopularMovies([
          {
            id: 3,
            title: 'Inception',
            poster_path: '/path/to/poster3.jpg',
            vote_average: 8.8,
            release_date: '2010-07-16',
            adult: false,
          },
          {
            id: 4,
            title: 'The Dark Knight',
            poster_path: '/path/to/poster4.jpg',
            vote_average: 9.0,
            release_date: '2008-07-18',
            adult: false,
          },
        ]);
        setPopularSeries([
          {
            id: 5,
            name: 'Game of Thrones',
            poster_path: '/path/to/poster5.jpg',
            vote_average: 9.3,
            first_air_date: '2011-04-17',
            adult: true,
          },
          {
            id: 6,
            name: 'The Crown',
            poster_path: '/path/to/poster6.jpg',
            vote_average: 8.7,
            first_air_date: '2016-11-04',
            adult: false,
          },
        ]);
        setTopRated([
          {
            id: 7,
            title: 'Pulp Fiction',
            poster_path: '/path/to/poster7.jpg',
            vote_average: 8.9,
            release_date: '1994-10-14',
            adult: true,
          },
          {
            id: 8,
            title: 'Fight Club',
            poster_path: '/path/to/poster8.jpg',
            vote_average: 8.8,
            release_date: '1999-10-15',
            adult: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('hero.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <Hero />

      {/* Contenido principal */}
      <div className="relative z-10 -mt-32 pt-32">
        {/* Tendencias */}
        <MovieRow
          title={t('home.trendingNow', { defaultValue: 'Tendencias ahora' })}
          movies={trending.slice(0, 20)}
        />

        {/* Películas populares */}
        <MovieRow
          title={t('home.popularMovies', { defaultValue: 'Películas populares' })}
          movies={popularMovies.slice(0, 20)}
          type="movie"
        />

        {/* Series populares */}
        <MovieRow
          title={t('home.popularSeries', { defaultValue: 'Series populares' })}
          movies={popularSeries.slice(0, 20)}
          type="tv"
        />

        {/* Mejor valoradas */}
        <MovieRow
          title={t('home.topRated', { defaultValue: 'Mejor valoradas' })}
          movies={topRated.slice(0, 20)}
          type="movie"
        />

        {/* Contenido original de Netflix */}
        <MovieRow
          title={t('home.netflixOriginals', { defaultValue: 'Contenido original de Netflix' })}
          movies={trending.slice(10, 30)}
        />

        {/* Documentales */}
        <MovieRow
          title={t('home.documentaries', { defaultValue: 'Documentales' })}
          movies={popularMovies.slice(15, 35)}
          type="movie"
        />
      </div>
    </div>
  );
};

export default Home;
