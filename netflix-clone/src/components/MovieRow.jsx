import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Play, Plus, Info, Star, Calendar, List } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getImageUrl, getMovieVideos, getSeriesVideos } from '../services/tmdbApi';
import VideoPlayer from './VideoPlayer';
import MovieDetailModal from './MovieDetailModal';

const MovieRow = ({ title, movies, type = 'movie' }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [selectedMovieForList, setSelectedMovieForList] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);
  const rowRef = useRef(null);
  const { playMovie, toggleFavorite, isFavorite, addNotification } = useMovieContext();
  const { t } = useTranslation();

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleAddToFavorites = (movie) => {
    toggleFavorite(movie);
  };

  const handlePlay = async (movie) => {
    setIsLoadingTrailer(true);
    setSelectedMovie(movie);
    
    try {
      // Determinar si es película o serie
      const isMovie = !!movie.title;
      const mediaId = movie.id;
      
      // Obtener videos (trailers)
      const videosData = isMovie 
        ? await getMovieVideos(mediaId)
        : await getSeriesVideos(mediaId);
      
      // Filtrar trailers de YouTube
      const trailers = videosData
        .filter(video => 
          video.site === 'YouTube' && 
          (video.type === 'Trailer' || video.type === 'Teaser')
        )
        .slice(0, 3); // Tomar los primeros 3 trailers
      
      if (trailers.length > 0) {
        // Si hay trailers, usar el primero
        setSelectedTrailer(trailers[0]);
        addNotification({
          message: t('row.playingTrailer', { title: movie.title || movie.name }),
          type: 'success',
          duration: 2000
        });
      } else {
        // Si no hay trailers, mostrar notificación
        addNotification({
          message: t('row.noTrailers', { title: movie.title || movie.name }),
          type: 'info',
          duration: 3000
        });
        // Aún así abrir el reproductor para mostrar la película
        setSelectedTrailer(null);
      }
      
      setIsVideoPlayerOpen(true);
      
    } catch (error) {
      console.error('Error loading trailers:', error);
      addNotification({
        message: t('row.errorLoadingTrailers'),
        type: 'error',
        duration: 3000
      });
      // Abrir reproductor sin trailer
      setSelectedTrailer(null);
      setIsVideoPlayerOpen(true);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const handleMoreInfo = (movie) => {
    console.log('🎬 Abriendo modal para:', movie.title || movie.name);
    setSelectedMovieForDetails(movie);
    setIsDetailModalOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    if (selectedTrailer) {
      addNotification({
        message: t('row.trailerFinished', { title: selectedMovie?.title || selectedMovie?.name }),
        type: 'info',
        duration: 2000
      });
    }
    setIsVideoPlayerOpen(false);
    setSelectedMovie(null);
    setSelectedTrailer(null);
  };

  const handleAddToList = (movie) => {
    setSelectedMovieForList(movie);
    setShowListSelector(true);
  };

  const addToCustomList = (listId, listName) => {
    const savedLists = JSON.parse(localStorage.getItem('customLists') || '[]');
    const updatedLists = savedLists.map(list => {
      if (list.id === listId) {
        // Verificar si el item ya existe
        const exists = list.items.some(item => item.id === selectedMovieForList.id);
        if (!exists) {
          return {
            ...list,
            items: [...list.items, { ...selectedMovieForList, addedAt: new Date().toISOString() }]
          };
        }
      }
      return list;
    });

    localStorage.setItem('customLists', JSON.stringify(updatedLists));
    
    addNotification({
      message: `"${selectedMovieForList.title || selectedMovieForList.name}" agregado a "${listName}"`,
      type: 'success',
      duration: 3000
    });

    setShowListSelector(false);
    setSelectedMovieForList(null);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-12">
        {/* Título de la fila con mejor diseño */}
        <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-shadow">
            {title}
          </h2>
          
          {/* Indicador de cantidad */}
          <div className="flex items-center space-x-2 text-[#E5E5E5] text-sm">
            <span className="bg-[#E50914]/20 text-[#E50914] px-3 py-1 rounded-full font-medium">
              {t('row.countTitles', { count: movies.length })}
            </span>
          </div>
        </div>
        
        <div className="relative group">
          {/* Flecha izquierda mejorada */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 
                       btn-action btn-action-hover opacity-0 group-hover:opacity-100 
                       transition-all duration-300 hover:bg-[#E50914] shadow-netflix"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Flecha derecha mejorada */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 
                       btn-action btn-action-hover opacity-0 group-hover:opacity-100 
                       transition-all duration-300 hover:bg-[#E50914] shadow-netflix"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Carrusel de películas */}
          <div
            ref={rowRef}
            onScroll={handleScroll}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8"
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-56 md:w-64 group/item relative cursor-pointer"
                onClick={() => handleMoreInfo(movie)}
              >
                {/* Imagen de la película con efectos */}
                <div className="relative overflow-hidden rounded-xl movie-card hover:scale-105 transition-transform duration-300">
                  <div className="img-hover-zoom">
                    <img
                      src={getImageUrl(movie.poster_path, 'w500')}
                      alt={movie.title || movie.name}
                      className="w-full h-80 md:h-96 object-cover transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Overlay con información mejorado - SIEMPRE VISIBLE */}
                  <div className="absolute inset-0 card-gradient opacity-100 transition-all duration-500">
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      {/* Badge de tipo de contenido */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#E50914] text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {type === 'movie' ? t('common.movie') : t('common.series')}
                        </span>
                      </div>

                      {/* Indicador de favorito */}
                      {isFavorite(movie.id) && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-[#E50914] text-white p-2 rounded-full shadow-netflix">
                            <span className="text-sm font-bold">✓</span>
                          </div>
                        </div>
                      )}

                      {/* Información del contenido */}
                      <div className="space-y-3">
                        {/* Título */}
                        <h3 className="text-white font-bold text-lg line-clamp-2 group-hover/item:text-shadow">
                          {movie.title || movie.name}
                        </h3>
                        
                        {/* Información adicional con iconos */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Star size={16} className="text-yellow-400 fill-current" />
                            <span className="text-green-400 font-bold">
                              {movie.vote_average?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-[#E5E5E5]">
                            <Calendar size={14} />
                            <span>
                              {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Indicador de contenido adulto */}
                        {movie.adult && (
                          <div className="inline-flex items-center space-x-1 bg-red-600/80 text-white px-2 py-1 rounded text-xs font-medium">
                            <span>🔞</span>
                            <span>+18</span>
                          </div>
                        )}

                        {/* Botones de acción mejorados - SIEMPRE VISIBLES */}
                        <div className="flex space-x-1 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlay(movie);
                            }}
                            disabled={isLoadingTrailer}
                            className={`flex-1 text-xs font-bold py-1.5 px-2 rounded-lg 
                                     transition-all duration-200 transform hover:scale-105 
                                     flex items-center justify-center space-x-1 shadow-lg cursor-pointer z-10 btn-play-trailer
                                     ${isLoadingTrailer 
                                       ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                       : 'bg-white text-[#141414] hover:bg-gray-200'
                                     }`}
                          >
                            {isLoadingTrailer ? (
                              <>
                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>{t('common.loading', { defaultValue: 'Cargando...' })}</span>
                              </>
                            ) : (
                              <>
                                <Play size={14} className="fill-current" />
                                <span>{t('common.play')}</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToFavorites(movie);
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-105 
                                     flex items-center justify-center cursor-pointer z-10 ${
                                       isFavorite(movie.id)
                                         ? 'bg-[#E50914] text-white shadow-netflix'
                                         : 'bg-[#808080]/80 text-white hover:bg-[#E50914] hover:shadow-netflix'
                                     }`}
                          >
                            {isFavorite(movie.id) ? (
                              <span className="text-xs font-bold">✓</span>
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToList(movie);
                            }}
                            className="p-1.5 bg-[#808080]/80 text-white rounded-lg hover:bg-[#808080] 
                                     transition-all duration-200 transform hover:scale-105 cursor-pointer z-10"
                            title={t('row.addToCustomList')}
                          >
                            <List size={16} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoreInfo(movie);
                            }}
                            className="p-1.5 bg-[#808080]/80 text-white rounded-lg hover:bg-[#808080] 
                                     transition-all duration-200 transform hover:scale-105 cursor-pointer z-10"
                            title={t('common.moreInfo')}
                          >
                            <Info size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Efectos de hover adicionales */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover/item:border-[#E50914]/50 
                                transition-all duration-300 rounded-xl"></div>
                </div>

                {/* Información debajo de la imagen */}
                <div className="mt-3 px-1">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 group-hover/item:text-[#E50914] transition-colors">
                    {movie.title || movie.name}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-[#E5E5E5]">
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                    
                    <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de scroll */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#E50914]/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#E50914]/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#E50914]/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reproductor de video */}
      <VideoPlayer
        movie={selectedMovie}
        videoData={selectedTrailer}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />

      {/* Selector de listas personalizadas */}
      {showListSelector && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] rounded-xl overflow-hidden">
            <div className="bg-[#E50914] p-6">
              <h3 className="text-xl font-bold text-white text-center">
                {t('row.modal.title')}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">
                  {selectedMovieForList?.title || selectedMovieForList?.name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t('row.modal.subtitle')}
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(() => {
                  const savedLists = JSON.parse(localStorage.getItem('customLists') || '[]');
                  if (savedLists.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        <List size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">{t('row.modal.noListsTitle')}</p>
                        <p className="text-xs mt-1">{t('row.modal.noListsSubtitle')}</p>
                      </div>
                    );
                  }
                  
                  return savedLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => addToCustomList(list.id, list.name)}
                      className="w-full p-4 bg-[#333] hover:bg-[#404040] rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-semibold">{list.name}</h5>
                          <p className="text-gray-400 text-sm">
                            {t('row.modal.items', { count: list.items.length })} • {t('row.modal.created')} {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Plus size={20} className="text-[#E50914]" />
                      </div>
                    </button>
                  ));
                })()}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowListSelector(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de la película */}
      <MovieDetailModal
        movie={selectedMovieForDetails}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMovieForDetails(null);
        }}
      />
    </>
  );
};

export default MovieRow;
