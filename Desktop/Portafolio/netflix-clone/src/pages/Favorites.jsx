import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Play, Plus, Info, Star, Calendar, Trash2, Filter, List, Sparkles } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getImageUrl } from '../services/tmdbApi';
import VideoPlayer from '../components/VideoPlayer';
import CustomLists from '../components/CustomLists';

const Favorites = () => {
  const { favorites, removeFromFavorites, playMovie } = useMovieContext();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' o 'lists'
  const [filterType, setFilterType] = useState('all'); // 'all', 'movie', 'tv'
  const [sortBy, setSortBy] = useState('added'); // 'added', 'rating', 'year'
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isCustomListsOpen, setIsCustomListsOpen] = useState(false);

  const handlePlay = (movie) => {
    playMovie(movie);
    setSelectedMovie(movie);
    setIsVideoPlayerOpen(true);
  };

  const handleRemoveFromFavorites = (movieId) => {
    removeFromFavorites(movieId);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedMovie(null);
  };

  const handleOpenCustomLists = () => {
    setIsCustomListsOpen(true);
  };

  // Filtrar favoritos según el tipo seleccionado
  const filteredFavorites = favorites.filter(movie => {
    if (filterType === 'all') return true;
    if (filterType === 'movie') return movie.title; // Películas tienen 'title'
    if (filterType === 'tv') return movie.name; // Series tienen 'name'
    return true;
  });

  // Ordenar favoritos según el criterio seleccionado
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'added':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'rating':
        return (b.vote_average || 0) - (a.vote_average || 0);
      case 'year':
        const yearA = a.release_date?.split('-')[0] || a.first_air_date?.split('-')[0] || 0;
        const yearB = b.release_date?.split('-')[0] || b.first_air_date?.split('-')[0] || 0;
        return yearB - yearA;
      default:
        return 0;
    }
  });

  const getMovieYear = (movie) => {
    return movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A';
  };

  const getMovieTitle = (movie) => {
    return movie.title || movie.name || 'Sin título';
  };

  const getMovieType = (movie) => {
    return movie.title ? t('common.movie') : t('common.series');
  };

  const getLocale = () => (i18n.language === 'en' ? 'en-US' : 'es-ES');

  // Renderizar pestañas
  const renderTabs = () => (
    <div className="flex items-center space-x-1 bg-[#333]/50 rounded-xl p-1 mb-8">
      <button
        onClick={() => setActiveTab('favorites')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          activeTab === 'favorites'
            ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
            : 'text-[#E5E5E5] hover:text-white hover:bg-[#404040]'
        }`}
      >
        <Heart size={20} className={activeTab === 'favorites' ? 'fill-current' : ''} />
        <span>{t('favorites.tabFavorites', { count: favorites.length })}</span>
      </button>
      
      <button
        onClick={() => setActiveTab('lists')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          activeTab === 'lists'
            ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
            : 'text-[#E5E5E5] hover:text-white hover:bg-[#404040]'
        }`}
      >
        <List size={20} />
        <span>{t('favorites.tabLists')}</span>
      </button>
    </div>
  );

  // Renderizar contenido de favoritos
  const renderFavoritesContent = () => {
    if (favorites.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={64} className="text-[#E50914]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('favorites.emptyTitle')}
          </h2>
          <p className="text-[#E5E5E5] mb-6">
            {t('favorites.emptySubtitle')}
          </p>
          <div className="flex items-center justify-center space-x-2 text-[#E50914]">
            <Heart size={20} className="fill-current" />
            <span className="font-semibold">{t('favorites.emptyCta')}</span>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Filtros y ordenamiento */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            {/* Filtro por tipo */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-[#E5E5E5]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#333]/80 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-[#E50914] focus:outline-none transition-colors"
              >
                <option value="all">Todos</option>
                <option value="movie">Películas</option>
                <option value="tv">Series</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#333]/80 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-[#E50914] focus:outline-none transition-colors"
            >
              <option value="added">Más recientes</option>
              <option value="rating">Mejor calificadas</option>
              <option value="year">Más recientes (año)</option>
            </select>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center space-x-4 text-sm text-[#E5E5E5]">
            <span className="bg-[#E50914]/20 text-[#E50914] px-3 py-1 rounded-full font-medium">
              {filteredFavorites.length} resultado{filteredFavorites.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Grid de favoritos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedFavorites.map((movie) => (
            <div
              key={movie.id}
              className="group relative bg-[#333]/50 rounded-xl overflow-hidden movie-card hover:scale-105 transition-all duration-300"
            >
              {/* Imagen */}
              <div className="relative overflow-hidden">
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={getMovieTitle(movie)}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    {/* Badge de tipo */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#E50914] text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {getMovieType(movie)}
                      </span>
                    </div>

                    {/* Botón de eliminar */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleRemoveFromFavorites(movie.id)}
                        className="bg-red-600/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200 group/delete"
                        title={t('favorites.removeFromList')}
                      >
                        <Trash2 size={16} className="group-hover/delete:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Información del contenido */}
                    <div className="space-y-3">
                      <h3 className="text-white font-bold text-lg line-clamp-2">
                        {getMovieTitle(movie)}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-green-400 font-bold">
                            {movie.vote_average?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-[#E5E5E5]">
                          <Calendar size={14} />
                          <span>{getMovieYear(movie)}</span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePlay(movie)}
                          className="flex-1 bg-white text-[#141414] text-sm font-bold py-2 px-3 rounded-lg 
                                   hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 
                                   flex items-center justify-center space-x-2"
                        >
                          <Play size={16} className="fill-current" />
                          <span>{t('common.play')}</span>
                        </button>
                        
                        <button
                          onClick={() => console.log('Más info:', getMovieTitle(movie))}
                          className="p-2 bg-[#808080]/80 text-white rounded-lg hover:bg-[#808080] 
                                   transition-all duration-200 transform hover:scale-105"
                        >
                          <Info size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información debajo de la imagen */}
              <div className="p-4">
                <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#E50914] transition-colors">
                  {getMovieTitle(movie)}
                </h4>
                
                <div className="flex items-center justify-between text-xs text-[#E5E5E5]">
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  
                  <span>{getMovieYear(movie)}</span>
                </div>

                {/* Fecha de agregado */}
                <div className="mt-2 text-xs text-[#808080]">
                  {t('favorites.added')}: {new Date(movie.addedAt).toLocaleDateString(getLocale(), {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados del filtro */}
        {filteredFavorites.length === 0 && favorites.length > 0 && (
          <div className="text-center py-12">
            <div className="glass p-8 rounded-2xl border border-white/20 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                {t('favorites.noResults')}
              </h3>
              <p className="text-[#E5E5E5] mb-4">
                {t('favorites.noResultsSubtitle')}
              </p>
              <button
                onClick={() => setFilterType('all')}
                className="btn-primary px-6 py-2"
              >
                {t('favorites.viewAll')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // Renderizar contenido de listas personalizadas
  const renderListsContent = () => (
    <div className="text-center py-16">
      <div className="w-32 h-32 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <List size={64} className="text-[#E50914]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Gestiona tus listas personalizadas
      </h2>
      <p className="text-[#E5E5E5] mb-6">
        Crea listas temáticas, organiza tu contenido favorito y comparte tus colecciones.
      </p>
      <button
        onClick={handleOpenCustomLists}
        className="btn-primary px-8 py-3 text-lg flex items-center space-x-2 mx-auto"
      >
        <List size={20} />
        <span>Gestionar Listas</span>
      </button>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="glass p-6 rounded-xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-[#E50914]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Listas Temáticas</h3>
          <p className="text-sm text-[#E5E5E5]">
            Crea listas por género, director, actor o cualquier criterio que prefieras
          </p>
        </div>
        
        <div className="glass p-6 rounded-xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-[#E50914]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Organiza Favoritos</h3>
          <p className="text-sm text-[#E5E5E5]">
            Agrupa tus favoritos en colecciones organizadas y fáciles de navegar
          </p>
        </div>
        
        <div className="glass p-6 rounded-xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-[#E50914]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Agrega Contenido</h3>
          <p className="text-sm text-[#E5E5E5]">
            Añade películas y series a tus listas desde cualquier parte de la aplicación
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#141414] pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header de la página */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#E50914]/20 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-[#E50914] fill-current" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white text-shadow">
                  Mi Lista
                </h1>
                <p className="text-xl text-[#E5E5E5]">
                  {activeTab === 'favorites' 
                    ? `${favorites.length} título${favorites.length !== 1 ? 's' : ''} en tu lista`
                    : 'Gestiona tus listas personalizadas'
                  }
                </p>
              </div>
            </div>

            {/* Pestañas */}
            {renderTabs()}
          </div>

          {/* Contenido según la pestaña activa */}
          {activeTab === 'favorites' ? renderFavoritesContent() : renderListsContent()}
        </div>
      </div>

      {/* Reproductor de video */}
      <VideoPlayer
        movie={selectedMovie}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />

      {/* Modal de listas personalizadas */}
      <CustomLists 
        isOpen={isCustomListsOpen}
        onClose={() => setIsCustomListsOpen(false)}
      />
    </>
  );
};

export default Favorites;
