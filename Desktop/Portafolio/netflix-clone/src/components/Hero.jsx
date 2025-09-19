import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, Star, Clock, Calendar } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getPopularMovies, getMovieDetails, getImageUrl, getMovieVideos } from '../services/tmdbApi';
import VideoPlayer from './VideoPlayer';
import MovieDetailModal from './MovieDetailModal';

const Hero = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);
  const { playMovie, toggleFavorite, isFavorite, favorites, currentPlaying, addNotification } = useMovieContext();

  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        setIsLoading(true);
        const movies = await getPopularMovies(1);
        if (movies && movies.length > 0) {
          const movie = movies[0];
          const details = await getMovieDetails(movie.id);
          setFeaturedMovie({ ...movie, ...details });
        }
      } catch (error) {
        console.error('Error fetching featured movie:', error);
        setFeaturedMovie({
          id: 1,
          title: 'Stranger Things',
          overview: 'Cuando un niño desaparece, un pequeño pueblo descubre un misterio que involucra experimentos secretos, fuerzas sobrenaturales aterradoras y una niña muy extraña.',
          backdrop_path: '/path/to/backdrop.jpg',
          poster_path: '/path/to/poster.jpg',
          vote_average: 8.7,
          release_date: '2022-05-27',
          genre_ids: [18, 9648, 10765],
          runtime: 150,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMovie();
  }, []);

  if (isLoading || !featuredMovie) {
    return (
      <div className="relative h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-[#E5E5E5] text-lg">Cargando contenido destacado...</p>
        </div>
      </div>
    );
  }

  const handlePlay = async () => {
    setIsLoadingTrailer(true);
    
    try {
      // Obtener videos (trailers) de la película destacada
      const videosData = await getMovieVideos(featuredMovie.id);
      
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
          message: `Reproduciendo trailer de "${featuredMovie.title}"`,
          type: 'success',
          duration: 2000
        });
      } else {
        // Si no hay trailers, mostrar notificación
        addNotification({
          message: `No hay trailers disponibles para "${featuredMovie.title}"`,
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
        message: 'Error al cargar los trailers',
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

  const handleMoreInfo = () => {
    console.log('Más información de:', featuredMovie.title);
    setSelectedMovieForDetails(featuredMovie);
    setIsDetailModalOpen(true);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleAddToFavorites = () => {
    toggleFavorite(featuredMovie);
  };

  // Función para mapear IDs de géneros a nombres reales
  const getGenreName = (genreId) => {
    const genreMap = {
      28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia',
      80: 'Crimen', 99: 'Documental', 18: 'Drama', 10751: 'Familiar',
      14: 'Fantasía', 36: 'Historia', 27: 'Terror', 10402: 'Música',
      9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia Ficción',
      10770: 'Película de TV', 53: 'Thriller', 10752: 'Guerra',
      37: 'Western', 10759: 'Acción y Aventura', 10762: 'Kids',
      10763: 'News', 10764: 'Reality', 10765: 'Ciencia Ficción y Fantasía',
      10766: 'Soap', 10767: 'Talk', 10768: 'Guerra y Política'
    };
    return genreMap[genreId] || `Género ${genreId}`;
  };

  const truncateOverview = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="relative h-screen overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(featuredMovie.backdrop_path, 'original')}
            alt={featuredMovie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          {/* Overlay con gradiente profesional */}
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/50 to-transparent"></div>
          
          {/* Efecto de partículas sutiles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/5 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              {/* Badge de contenido destacado */}
              <div className="inline-flex items-center space-x-2 bg-[#E50914]/90 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                <Star size={16} className="text-yellow-300 fill-current" />
                <span>CONTENIDO DESTACADO</span>
              </div>

              {/* Título con tipografía profesional */}
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight text-shadow">
                {featuredMovie.title}
              </h1>

              {/* Información adicional con diseño mejorado */}
              <div className="flex flex-wrap items-center space-x-6 text-sm text-[#E5E5E5] mb-6">
                <div className="flex items-center space-x-2 bg-[#E50914]/20 px-3 py-1 rounded-full">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-green-400 font-bold text-lg">
                    {featuredMovie.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-white">/ 10</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
                  <Calendar size={16} className="text-[#E5E5E5]" />
                  <span>{featuredMovie.release_date?.split('-')[0] || 'N/A'}</span>
                </div>
                
                {featuredMovie.runtime && (
                  <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
                    <Clock size={16} className="text-[#E5E5E5]" />
                    <span>{Math.floor(featuredMovie.runtime / 60)}h {featuredMovie.runtime % 60}m</span>
                  </div>
                )}
              </div>

              {/* Descripción con mejor tipografía */}
              <p className="text-xl text-[#E5E5E5] mb-8 leading-relaxed max-w-2xl">
                {truncateOverview(featuredMovie.overview)}
              </p>

              {/* Botones de acción mejorados */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <button
                  onClick={handlePlay}
                  disabled={isLoadingTrailer}
                  className={`btn-primary btn-action-hover group flex items-center justify-center space-x-3 btn-play-trailer ${
                    isLoadingTrailer ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingTrailer ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg">Cargando...</span>
                    </>
                  ) : (
                    <>
                      <Play size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-lg">Reproducir</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleMoreInfo}
                  className="btn-secondary btn-action-hover group flex items-center justify-center space-x-3"
                >
                  <Info size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-lg">Más información</span>
                </button>



                <button
                  onClick={handleAddToFavorites}
                  className={`btn-action btn-action-hover group flex items-center justify-center transition-all duration-300 ${
                    isFavorite(featuredMovie.id)
                      ? 'bg-[#E50914] text-white shadow-netflix'
                      : 'hover:bg-[#E50914] hover:shadow-netflix'
                  }`}
                >
                  <span className="text-xl font-bold">
                    {isFavorite(featuredMovie.id) ? '✓' : '+'}
                  </span>
                </button>
              </div>

              {/* Géneros con diseño moderno */}
              {featuredMovie.genre_ids && featuredMovie.genre_ids.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {featuredMovie.genre_ids.slice(0, 3).map((genreId, index) => (
                    <span
                      key={index}
                      className="glass px-4 py-2 rounded-full text-sm font-medium text-white border border-white/20 hover:border-[#E50914]/50 transition-all duration-300"
                                          >
                        {getGenreName(genreId)}
                      </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controles de audio mejorados */}
        <div className="absolute bottom-8 right-8 z-20">
          <button
            onClick={handleToggleMute}
            className="btn-action btn-action-hover group"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX size={24} className="group-hover:scale-110 transition-transform" />
            ) : (
              <Volume2 size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Indicador de edad mejorado */}
        <div className="absolute bottom-8 left-8 z-20">
          <div className="glass px-4 py-2 rounded-lg text-white font-bold text-lg border border-white/20">
            +16
          </div>
        </div>

        {/* Indicador de calidad */}
        <div className="absolute top-8 right-8 z-20">
          <div className="glass px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
            4K ULTRA HD
          </div>
        </div>

        {/* Scroll indicator eliminado */}
      </div>

      {/* Reproductor de video */}
      <VideoPlayer
        movie={featuredMovie}
        videoData={selectedTrailer}
        isOpen={isVideoPlayerOpen}
        onClose={() => {
          if (selectedTrailer) {
            addNotification({
              message: `Trailer de "${featuredMovie.title}" finalizado`,
              type: 'info',
              duration: 2000
            });
          }
          setIsVideoPlayerOpen(false);
          setSelectedTrailer(null);
        }}
      />

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

export default Hero;
