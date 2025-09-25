import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List } from 'lucide-react';
import MovieRow from '../components/MovieRow';
import {
  getPopularMovies,
  getGenres,
  getImageUrl,
  getMoviesByGenre,
} from '../services/tmdbApi';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('row'); // 'row' o 'grid'
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [genres, setGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener películas y géneros en paralelo
        const [moviesData, genresData] = await Promise.all([
          getPopularMovies(1),
          getGenres('movie'),
        ]);

        setMovies(moviesData || []);
        setFilteredMovies(moviesData || []);
        setGenres(genresData || []);
        setPage(1);
        setHasMore((moviesData || []).length > 0);
      } catch (error) {
        console.error('Error fetching movies data:', error);
        // Datos de respaldo para demostración
        setMovies([
          {
            id: 1,
            title: 'Inception',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 8.8,
            release_date: '2010-07-16',
            adult: false,
            genre_ids: [28, 878],
          },
          {
            id: 2,
            title: 'The Dark Knight',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.0,
            release_date: '2008-07-18',
            adult: false,
            genre_ids: [28, 80, 18],
          },
        ]);
        setFilteredMovies([
          {
            id: 1,
            title: 'Inception',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 8.8,
            release_date: '2010-07-16',
            adult: false,
            genre_ids: [28, 878],
          },
          {
            id: 2,
            title: 'The Dark Knight',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.0,
            release_date: '2008-07-18',
            adult: false,
            genre_ids: [28, 80, 18],
          },
        ]);
        setGenres([
          { id: 28, name: 'Acción' },
          { id: 12, name: 'Aventura' },
          { id: 16, name: 'Animación' },
          { id: 35, name: 'Comedia' },
          { id: 80, name: 'Crimen' },
          { id: 99, name: 'Documental' },
          { id: 18, name: 'Drama' },
          { id: 10751, name: 'Familiar' },
          { id: 14, name: 'Fantasía' },
          { id: 36, name: 'Historia' },
          { id: 27, name: 'Terror' },
          { id: 10402, name: 'Música' },
          { id: 9648, name: 'Misterio' },
          { id: 10749, name: 'Romance' },
          { id: 878, name: 'Ciencia ficción' },
          { id: 10770, name: 'Película de TV' },
          { id: 53, name: 'Suspense' },
          { id: 10752, name: 'Guerra' },
          { id: 37, name: 'Western' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      let nextResults = [];
      if (selectedGenre !== 'all') {
        nextResults = await getMoviesByGenre(parseInt(selectedGenre), nextPage);
      } else {
        nextResults = await getPopularMovies(nextPage);
      }
      if (nextResults && nextResults.length > 0) {
        setMovies((prev) => [...prev, ...nextResults]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error loading next movies page:', e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, selectedGenre, isLoadingMore, hasMore, getMoviesByGenre]);

  // Re-observe when filters change
  useEffect(() => {
    // reset list when user changes genre
    const resetAndLoad = async () => {
      setPage(1);
      setHasMore(true);
      try {
        const firstPage =
          selectedGenre !== 'all'
            ? await getMoviesByGenre(parseInt(selectedGenre), 1)
            : await getPopularMovies(1);
        setMovies(firstPage || []);
      } catch (e) {
        console.error('Error reloading movies by filter:', e);
      }
    };
    // Only reset when user changed genre explicitly
    // Ignore initial mount because it's already fetched in previous effect
    // Trigger on selectedGenre change
  }, [selectedGenre]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        loadNextPage();
      }
    });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current && observerRef.current.disconnect();
  }, [loadNextPage]);

  useEffect(() => {
    let filtered = [...movies];

    // Filtrar por género
    if (selectedGenre !== 'all') {
      filtered = filtered.filter((movie) => movie.genre_ids?.includes(parseInt(selectedGenre)));
    }

    // Ordenar
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
        break;
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default: // popularity
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    setFilteredMovies(filtered);
  }, [movies, selectedGenre, sortBy]);

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('movies.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('movies.title')}</h1>
          <p className="text-netflix-light-gray text-lg">{t('movies.subtitle')}</p>
        </div>

        {/* Filtros y controles */}
        <div className="bg-netflix-black/50 rounded-lg p-4 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filtros */}
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-netflix-light-gray" />
                <span className="text-white font-medium">{t('common.filters')}</span>
              </div>

              {/* Géneros */}
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="all">{t('common.allGenres')}</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {t(`genres.${genre.id}`)}
                  </option>
                ))}
              </select>

              {/* Ordenar por */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="popularity">{t('common.sort.popularity')}</option>
                <option value="rating">{t('common.sort.rating')}</option>
                <option value="date">{t('common.sort.date')}</option>
                <option value="title">{t('common.sort.title')}</option>
              </select>
            </div>

            {/* Modo de vista */}
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{t('common.view')}</span>
              <button
                onClick={() => handleViewModeChange('row')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'row'
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-800 text-netflix-light-gray hover:bg-gray-700'
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-800 text-netflix-light-gray hover:bg-gray-700'
                }`}
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-netflix-light-gray">
            {t('common.showingCount', { count: filteredMovies.length })}
            {selectedGenre !== 'all' && ' '}
            {selectedGenre !== 'all' &&
              t('common.inGenre', {
                genre: t(`genres.${selectedGenre}`),
              })}
          </p>
        </div>

        {/* Contenido */}
        {viewMode === 'row' ? (
          // Vista en filas (carrusel)
          <div>
            <MovieRow title={t('movies.filteredTitle')} movies={filteredMovies} type="movie" />
          </div>
        ) : (
          // Vista en grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="group relative overflow-hidden rounded-md">
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />

                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-netflix-light-gray mb-2">
                      <span className="text-green-400 font-semibold">
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                      <span>•</span>
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-6">
          {isLoadingMore && (
            <div className="text-netflix-light-gray text-sm">{t('common.loading')}</div>
          )}
          {!hasMore && (
            <div className="text-netflix-light-gray text-sm">{t('common.noResults', { defaultValue: 'No more results' })}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Movies;
