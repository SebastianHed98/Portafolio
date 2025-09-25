import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List, Tv } from 'lucide-react';
import MovieRow from '../components/MovieRow';
import { getPopularSeries, getGenres, getImageUrl, getSeriesByGenre } from '../services/tmdbApi';

const Series = () => {
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
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

        // Obtener series y géneros en paralelo
        const [seriesData, genresData] = await Promise.all([getPopularSeries(1), getGenres('tv')]);

        setSeries(seriesData || []);
        setFilteredSeries(seriesData || []);
        setGenres(genresData || []);
        setPage(1);
        setHasMore((seriesData || []).length > 0);
      } catch (error) {
        console.error('Error fetching series data:', error);
        // Datos de respaldo para demostración
        setSeries([
          {
            id: 1,
            name: 'Game of Thrones',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 9.3,
            first_air_date: '2011-04-17',
            adult: true,
            genre_ids: [10759, 18, 10765],
          },
          {
            id: 2,
            name: 'Breaking Bad',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.5,
            first_air_date: '2008-01-20',
            adult: false,
            genre_ids: [18, 80, 9648],
          },
          {
            id: 3,
            name: 'Stranger Things',
            poster_path: '/path/to/poster3.jpg',
            vote_average: 8.7,
            first_air_date: '2016-07-15',
            adult: false,
            genre_ids: [18, 9648, 10765],
          },
        ]);
        setFilteredSeries([
          {
            id: 1,
            name: 'Game of Thrones',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 9.3,
            first_air_date: '2011-04-17',
            adult: true,
            genre_ids: [10759, 18, 10765],
          },
          {
            id: 2,
            name: 'Breaking Bad',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.5,
            first_air_date: '2008-01-20',
            adult: false,
            genre_ids: [18, 80, 9648],
          },
          {
            id: 3,
            name: 'Stranger Things',
            poster_path: '/path/to/poster3.jpg',
            vote_average: 8.7,
            first_air_date: '2016-07-15',
            adult: false,
            genre_ids: [18, 9648, 10765],
          },
        ]);
        setGenres([
          { id: 10759, name: 'Acción y Aventura' },
          { id: 16, name: 'Animación' },
          { id: 35, name: 'Comedia' },
          { id: 80, name: 'Crimen' },
          { id: 99, name: 'Documental' },
          { id: 18, name: 'Drama' },
          { id: 10751, name: 'Familiar' },
          { id: 10762, name: 'Kids' },
          { id: 9648, name: 'Misterio' },
          { id: 10763, name: 'News' },
          { id: 10764, name: 'Reality' },
          { id: 10765, name: 'Sci-Fi & Fantasy' },
          { id: 10766, name: 'Soap' },
          { id: 10767, name: 'Talk' },
          { id: 10768, name: 'War & Politics' },
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
        nextResults = await getSeriesByGenre(parseInt(selectedGenre), nextPage);
      } else {
        nextResults = await getPopularSeries(nextPage);
      }
      if (nextResults && nextResults.length > 0) {
        setSeries((prev) => [...prev, ...nextResults]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error loading next series page:', e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, selectedGenre, isLoadingMore, hasMore]);

  // Reset and reload when genre filter changes
  useEffect(() => {
    const reload = async () => {
      setPage(1);
      setHasMore(true);
      try {
        const first =
          selectedGenre !== 'all'
            ? await getSeriesByGenre(parseInt(selectedGenre), 1)
            : await getPopularSeries(1);
        setSeries(first || []);
      } catch (e) {
        console.error('Error reloading series by genre:', e);
      }
    };
    // Trigger when selectedGenre changes
    // Note: initial load handled in the i18n.language effect
    // so only reload on subsequent changes
    // We call immediately because dependency changes
    reload();
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
    let filtered = [...series];

    // Filtrar por género
    if (selectedGenre !== 'all') {
      filtered = filtered.filter((serie) => serie.genre_ids?.includes(parseInt(selectedGenre)));
    }

    // Ordenar
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.first_air_date || 0) - new Date(a.first_air_date || 0));
        break;
      case 'title':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default: // popularity
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    setFilteredSeries(filtered);
  }, [series, selectedGenre, sortBy]);

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
          <p className="text-white text-lg">{t('series.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tv size={40} className="text-netflix-red" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t('series.title')}</h1>
          </div>
          <p className="text-netflix-light-gray text-lg">{t('series.subtitle')}</p>
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
            {t('series.showingCount', { count: filteredSeries.length })}
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
            <MovieRow title={t('series.filteredTitle')} movies={filteredSeries} type="tv" />
          </div>
        ) : (
          // Vista en grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((serie) => (
              <div key={serie.id} className="group relative overflow-hidden rounded-md">
                <img
                  src={getImageUrl(serie.poster_path, 'w500')}
                  alt={serie.name}
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
                      {serie.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-netflix-light-gray mb-2">
                      <span className="text-green-400 font-semibold">
                        {serie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                      <span>•</span>
                      <span>{serie.first_air_date?.split('-')[0] || 'N/A'}</span>
                      {serie.adult && (
                        <>
                          <span>•</span>
                          <span className="text-red-400">+18</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicador de contenido adulto */}
                {serie.adult && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    +18
                  </div>
                )}
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

        {/* Mensaje si no hay resultados */}
        {filteredSeries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-netflix-light-gray text-lg">{t('series.noResults')}</p>
            <button
              onClick={() => setSelectedGenre('all')}
              className="mt-4 bg-netflix-red text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              {t('common.clearFilters')}
            </button>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-16 text-center">
          <div className="bg-netflix-black/30 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">¿Buscas algo específico?</h3>
            <p className="text-netflix-light-gray mb-4">
              Usa los filtros de arriba para encontrar exactamente lo que buscas, o navega por
              nuestras categorías populares.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {genres.slice(0, 8).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  className="bg-netflix-gray/20 text-white px-3 py-1 rounded-full text-sm hover:bg-netflix-gray/40 transition-colors"
                >
                  {t(`genres.${genre.id}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Series;
