import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, Star, Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { searchMulti, getGenres } from '../services/tmdbApi';

const AdvancedSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'movie', 'tv'
    genre: 'all',
    year: 'all',
    rating: 'all',
    sortBy: 'relevance', // 'relevance', 'rating', 'year', 'popularity'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useMovieContext();
  const { t, i18n } = useTranslation();

  // Cargar géneros al montar el componente
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const movieGenres = await getGenres('movie');
        const tvGenres = await getGenres('tv');
        setGenres([...movieGenres, ...tvGenres]);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, [i18n.language]);

  const handleSearch = async () => {
    if (!query.trim()) {
      addNotification({
        message: t('adv.search.enterTerm'),
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchMulti(query, 1);

      // Aplicar filtros
      let filteredResults = searchResults || [];

      if (filters.type !== 'all') {
        filteredResults = filteredResults.filter((item) => {
          if (filters.type === 'movie') return item.title;
          if (filters.type === 'tv') return item.name;
          return true;
        });
      }

      if (filters.genre !== 'all') {
        filteredResults = filteredResults.filter((item) =>
          item.genre_ids?.includes(parseInt(filters.genre))
        );
      }

      if (filters.year !== 'all') {
        filteredResults = filteredResults.filter((item) => {
          const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
          return year === filters.year;
        });
      }

      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        filteredResults = filteredResults.filter((item) => (item.vote_average || 0) >= minRating);
      }

      // Aplicar ordenamiento
      switch (filters.sortBy) {
        case 'rating':
          filteredResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
          break;
        case 'year':
          filteredResults.sort((a, b) => {
            const yearA = a.release_date?.split('-')[0] || a.first_air_date?.split('-')[0] || 0;
            const yearB = b.release_date?.split('-')[0] || b.first_air_date?.split('-')[0] || 0;
            return yearB - yearA;
          });
          break;
        case 'popularity':
          filteredResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
        default:
          // Mantener orden de relevancia de la API
          break;
      }

      setResults(filteredResults);

      addNotification({
        message: t('adv.search.resultsFound', { count: filteredResults.length }),
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error searching:', error);
      addNotification({
        message: t('adv.search.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      genre: 'all',
      year: 'all',
      rating: 'all',
      sortBy: 'relevance',
    });
    setResults([]);
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year.toString());
    }
    return years;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-[#141414] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#E50914] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Search size={28} />
              <span>{t('adv.header')}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Barra de búsqueda principal */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('adv.placeholder')}
                  className="w-full pl-10 pr-4 py-3 bg-[#333] text-white rounded-lg border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? t('adv.search.searching') : t('adv.search.searchBtn')}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Filter size={20} />
                <span>{t('common.filters')}</span>
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-[#E50914] hover:text-red-400 transition-colors"
              >
                {showFilters ? t('adv.filters.hide') : t('adv.filters.show')}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-[#333]/50 rounded-lg">
                {/* Tipo de contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adv.type')}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="all">{t('adv.typeAll')}</option>
                    <option value="movie">{t('common.movie')}</option>
                    <option value="tv">{t('common.series')}</option>
                  </select>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adv.genre')}
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="all">{t('common.allGenres')}</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {t(`genres.${genre.id}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Año */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adv.year')}
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="all">{t('adv.allYears')}</option>
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calificación mínima */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adv.minRating')}
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="all">{t('adv.anyRating')}</option>
                    <option value="9">9+ ⭐⭐⭐⭐⭐</option>
                    <option value="8">8+ ⭐⭐⭐⭐</option>
                    <option value="7">7+ ⭐⭐⭐</option>
                    <option value="6">6+ ⭐⭐</option>
                    <option value="5">5+ ⭐</option>
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adv.sortBy')}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="relevance">{t('adv.sort.relevance')}</option>
                    <option value="rating">{t('common.sort.rating')}</option>
                    <option value="year">{t('common.sort.date')}</option>
                    <option value="popularity">{t('common.sort.popularity')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Botones de filtros */}
            <div className="flex space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.clearFilters')}
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-[#E50914] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {t('adv.applyFilters')}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('adv.results', { count: results.length })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#333] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="p-3">
                      <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star size={12} className="text-yellow-400 fill-current" />
                          <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <span>
                          {item.release_date?.split('-')[0] ||
                            item.first_air_date?.split('-')[0] ||
                            'N/A'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-[#E50914] text-white text-xs rounded">
                          {item.title ? t('common.movie') : t('common.series')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {results.length === 0 && !loading && query && (
            <div className="text-center py-12">
              <Search size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('adv.noResults')}</h3>
              <p className="text-gray-400">{t('adv.noResultsSubtitle')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
