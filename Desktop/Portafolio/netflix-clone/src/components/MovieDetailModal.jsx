import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Play,
  Heart,
  Plus,
  Star,
  Calendar,
  Clock,
  Users,
  Info,
  Share2,
  Download,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import {
  getImageUrl,
  getMovieCredits,
  getSeriesCredits,
  getMovieVideos,
  getSeriesVideos,
  getSimilarMovies,
  getSimilarSeries,
} from '../services/tmdbApi';
import VideoPlayer from './VideoPlayer';

const MovieDetailModal = ({ movie, isOpen, onClose }) => {
  console.log('🎭 MovieDetailModal renderizado:', { movie, isOpen });
  const { t } = useTranslation();
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [movieDetails, setMovieDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCast, setFilteredCast] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [filteredSimilar, setFilteredSimilar] = useState([]);

  const { favorites, toggleFavorite, isFavorite, playMovie, addNotification, addToWatchHistory } =
    useMovieContext();

  useEffect(() => {
    if (movie && isOpen) {
      loadMovieDetails();
    }
  }, [movie, isOpen]);

  // Prevenir scroll de la página principal cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body de forma más suave
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Agregar clases CSS para bloquear scroll
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      // Restaurar scroll
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';

      // Remover clases CSS
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }

    // Cleanup: restaurar scroll cuando el componente se desmonte
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';

      // Remover clases CSS
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Prevenir scroll adicional en toda la página
  useEffect(() => {
    const preventScroll = (e) => {
      if (isOpen) {
        // Permitir scroll dentro del modal
        const modalContent = e.target.closest('.modal-content');
        if (modalContent) {
          return true; // Permitir scroll dentro del modal
        }

        // Solo bloquear scroll en el overlay, no en toda la página
        if (e.target.closest('.modal-overlay')) {
          e.preventDefault();
          return false;
        }
      }
    };

    if (isOpen) {
      // Solo prevenir scroll en el overlay del modal
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        // Mostrar notificación visual
        addNotification(t('detail.closedEsc'), 'info');
        handleCloseWithAnimation();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, addNotification]);

  // Función para manejar clic fuera del modal
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      // Mostrar notificación visual
      addNotification(t('detail.closedClickOutside'), 'info');
      handleCloseWithAnimation();
    }
  };

  // Función para cerrar modal con animación
  const handleCloseWithAnimation = () => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        onClose();
      }, 300); // Duración de la animación
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCast(cast);
      setFilteredVideos(videos);
      setFilteredSimilar(similar);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCast(
        cast.filter(
          (person) =>
            person.name.toLowerCase().includes(query) ||
            person.character.toLowerCase().includes(query)
        )
      );
      setFilteredVideos(
        videos.filter(
          (video) =>
            video.name.toLowerCase().includes(query) || video.type.toLowerCase().includes(query)
        )
      );
      setFilteredSimilar(similar.filter((item) => item.title.toLowerCase().includes(query)));
    }
  }, [searchQuery, cast, videos, similar]);

  const loadMovieDetails = async () => {
    if (!movie) return;

    setIsLoading(true);
    try {
      const isMovie = !!movie.title;
      const mediaId = movie.id;

      const [creditsData, videosData, similarData] = await Promise.all([
        isMovie ? getMovieCredits(mediaId) : getSeriesCredits(mediaId),
        isMovie ? getMovieVideos(mediaId) : getSeriesVideos(mediaId),
        isMovie ? getSimilarMovies(mediaId) : getSimilarSeries(mediaId),
      ]);

      const processedCast = creditsData.slice(0, 20).map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character || t('common.na'),
        profile_path: person.profile_path,
        order: person.order,
        known_for_department: person.known_for_department,
      }));

      const processedVideos = videosData
        .filter(
          (video) =>
            video.site === 'YouTube' &&
            (video.type === 'Trailer' || video.type === 'Teaser' || video.type === 'Clip')
        )
        .slice(0, 6)
        .map((video) => ({
          id: video.id,
          key: video.key,
          name: video.name,
          site: video.site,
          type: video.type,
          official: video.official,
          size: video.size,
        }));

      const processedSimilar = similarData.slice(0, 12).map((item) => ({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        media_type: isMovie ? 'movie' : 'tv',
      }));

      // Mapear IDs de géneros a nombres reales
      const getGenreName = (genreId) => {
        const genreMap = {
          28: 'Acción',
          12: 'Aventura',
          16: 'Animación',
          35: 'Comedia',
          80: 'Crimen',
          99: 'Documental',
          18: 'Drama',
          10751: 'Familiar',
          14: 'Fantasía',
          36: 'Historia',
          27: 'Terror',
          10402: 'Música',
          9648: 'Misterio',
          10749: 'Romance',
          878: 'Ciencia Ficción',
          10770: 'Película de TV',
          53: 'Thriller',
          10752: 'Guerra',
          37: 'Western',
          10759: 'Acción y Aventura',
          10762: 'Kids',
          10763: 'News',
          10764: 'Reality',
          10765: 'Ciencia Ficción y Fantasía',
          10766: 'Soap',
          10767: 'Talk',
          10768: 'Guerra y Política',
        };
        return genreMap[genreId] || `Género ${genreId}`;
      };

      // Procesar géneros
      let processedGenres = [];
      if (movie.genres && movie.genres.length > 0) {
        processedGenres = movie.genres;
      } else if (movie.genre_ids && movie.genre_ids.length > 0) {
        processedGenres = movie.genre_ids.map((id) => ({
          id: id,
          name: getGenreName(id),
        }));
      }

      const completeDetails = {
        ...movie,
        overview:
          movie.overview ||
          'Sinopsis no disponible. Esta película/serie promete entretenerte con una historia cautivadora y personajes memorables.',
        runtime: movie.runtime || movie.episode_run_time?.[0] || null,
        budget: movie.budget || null,
        revenue: movie.revenue || null,
        status: movie.status || 'Released',
        original_language: movie.original_language || 'en',
        production_companies: movie.production_companies || [],
        genres: processedGenres,
      };

      setMovieDetails(completeDetails);
      setCast(processedCast);
      setVideos(processedVideos);
      setSimilar(processedSimilar);

      addNotification({
        message: t('detail.loaded', { title: movie.title || movie.name }),
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error loading movie details:', error);
      addNotification({
        message: t('detail.errorLoading'),
        type: 'error',
        duration: 3000,
      });

      setMovieDetails({
        ...movie,
        overview: movie.overview || 'Sinopsis no disponible.',
        runtime: 120,
        budget: 50000000,
        revenue: 200000000,
        status: 'Released',
        genres: [
          { id: 28, name: 'Acción' },
          { id: 12, name: 'Aventura' },
        ],
      });
      setCast([]);
      setVideos([]);
      setSimilar([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (movie) {
      playMovie(movie);

      console.log('🎬 handlePlay ejecutado:', { movie, videos, videosLength: videos?.length });

      // Buscar el primer trailer disponible
      if (videos && videos.length > 0) {
        // Buscar primero trailers oficiales
        const officialTrailer = videos.find((video) => video.type === 'Trailer' && video.official);

        // Si no hay trailer oficial, buscar cualquier trailer
        const anyTrailer = videos.find((video) => video.type === 'Trailer');

        // Si no hay trailer, buscar cualquier video
        const anyVideo = videos[0];

        const videoToPlay = officialTrailer || anyTrailer || anyVideo;

        console.log('🎬 Video seleccionado:', {
          officialTrailer,
          anyTrailer,
          anyVideo,
          videoToPlay,
        });

        if (videoToPlay) {
          setSelectedVideo(videoToPlay);
          setIsVideoPlayerOpen(true);

          addNotification({
            message: t('detail.playingTypeOf', {
              type: videoToPlay.type.toLowerCase(),
              title: movie.title || movie.name,
            }),
            type: 'success',
            duration: 2000,
          });
        } else {
          // No hay videos disponibles
          setIsVideoPlayerOpen(true);
          setSelectedVideo(null);

          addNotification({
            message: t('detail.noTrailersGeneric'),
            type: 'info',
            duration: 3000,
          });
        }
      } else {
        // No se han cargado los videos aún
        console.log('⚠️ No hay videos cargados aún');
        setIsVideoPlayerOpen(true);
        setSelectedVideo(null);

        addNotification({
          message: t('detail.loadingTrailers'),
          type: 'info',
          duration: 2000,
        });
      }
    }
  };

  const handleAddToFavorites = () => {
    if (movie) {
      toggleFavorite(movie);
    }
  };

  const handleAddToWatchHistory = () => {
    if (movie) {
      addToWatchHistory(movie);
      addNotification({
        message: t('detail.addedToHistory', { title: movie.title || movie.name }),
        type: 'success',
        duration: 3000,
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title || movie.name,
        text: `Mira "${movie.title || movie.name}" en Netflix Clone`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        message: t('detail.linkCopied'),
        type: 'success',
        duration: 2000,
      });
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleSimilarClick = (item) => {
    onClose();
    addNotification({
      message: t('detail.navigatingTo', { title: item.title }),
      type: 'info',
      duration: 2000,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return t('common.na');
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}${t('common.hoursShort')} ${mins}${t('common.minutesShort')}`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return t('common.na');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMovieType = () => {
    return movie?.title ? t('common.movie') : t('common.series');
  };

  const getMovieYear = () => {
    return (
      movie?.release_date?.split('-')[0] || movie?.first_air_date?.split('-')[0] || t('common.na')
    );
  };

  const getContentRating = () => {
    if (movie?.adult)
      return { rating: 'R', description: 'Contenido para adultos', color: 'bg-red-600' };

    const voteAvg = movie?.vote_average || 0;
    if (voteAvg >= 8.0)
      return { rating: 'G', description: 'Apto para todos los públicos', color: 'bg-green-600' };
    if (voteAvg >= 6.5)
      return {
        rating: 'PG',
        description: 'Apto para todos los públicos con orientación parental',
        color: 'bg-yellow-600',
      };
    if (voteAvg >= 5.0)
      return {
        rating: 'PG-13',
        description: 'Algunos materiales pueden ser inapropiados para menores de 13 años',
        color: 'bg-orange-600',
      };
    return { rating: 'R', description: 'Contenido para adultos', color: 'bg-red-600' };
  };

  const getContentWarnings = () => {
    const warnings = [];
    const genres = movieDetails?.genres || [];
    const hasAny = (names) => genres.some((g) => names.includes(g.name));

    if (hasAny(['Acción', 'Action', 'Guerra', 'War'])) {
      warnings.push({
        text: t('detail.warnings.violenceModerate'),
        icon: '⚔️',
        severity: 'medium',
      });
    }
    if (hasAny(['Terror', 'Horror', 'Thriller'])) {
      warnings.push({ text: t('detail.warnings.scaryContent'), icon: '👻', severity: 'high' });
    }
    if (hasAny(['Romance', 'Drama'])) {
      warnings.push({ text: t('detail.warnings.adultThemes'), icon: '💕', severity: 'low' });
    }
    if (hasAny(['Comedia', 'Comedy'])) {
      warnings.push({ text: t('detail.warnings.adultHumor'), icon: '😄', severity: 'low' });
    }
    if (hasAny(['Crimen', 'Crime'])) {
      warnings.push({ text: t('detail.warnings.criminalContent'), icon: '🚔', severity: 'medium' });
    }

    return warnings;
  };

  const getGenreDescription = (genreName) => {
    const keyMap = new Map([
      ['acción', 'action'],
      ['action', 'action'],
      ['aventura', 'adventure'],
      ['adventure', 'adventure'],
      ['animación', 'animation'],
      ['animation', 'animation'],
      ['comedia', 'comedy'],
      ['comedy', 'comedy'],
      ['drama', 'drama'],
      ['terror', 'horror'],
      ['horror', 'horror'],
      ['romance', 'romance'],
      ['ciencia ficción', 'scienceFiction'],
      ['science fiction', 'scienceFiction'],
      ['fantasía', 'fantasy'],
      ['fantasy', 'fantasy'],
      ['thriller', 'thriller'],
      ['crimen', 'crime'],
      ['crime', 'crime'],
      ['guerra', 'war'],
      ['war', 'war'],
      ['familiar', 'family'],
      ['family', 'family'],
      ['documental', 'documentary'],
      ['documentary', 'documentary'],
      ['música', 'music'],
      ['music', 'music'],
      ['misterio', 'mystery'],
      ['mystery', 'mystery'],
      ['western', 'western'],
      ['historia', 'history'],
      ['history', 'history'],
    ]);
    const norm = (genreName || '').toString().trim().toLowerCase();
    const key = keyMap.get(norm);
    if (key) {
      return t(`detail.genreDescriptions.${key}`);
    }
    return 'Género cinematográfico con características únicas';
  };

  const getDetailedOverview = () => {
    const baseOverview = movieDetails?.overview || 'Sinopsis no disponible.';
    const genres = movieDetails?.genres || [];
    const runtime = movieDetails?.runtime;
    const year = getMovieYear();

    let detailedOverview = baseOverview;

    if (genres.length > 0) {
      const genreNames = genres.map((g) => g.name).join(', ');
      detailedOverview += `\n\nEsta ${getMovieType().toLowerCase()} de ${genreNames} promete entretenerte con una narrativa cautivadora y personajes memorables.`;
    }

    if (runtime && year !== 'N/A') {
      detailedOverview += `\n\nCon una duración de ${formatRuntime(runtime)}, esta producción del ${year} te mantendrá en el borde de tu asiento desde el principio hasta el final.`;
    }

    return detailedOverview;
  };

  if (!isOpen || !movie) return null;

  return (
    <>
      {/* Overlay de fondo */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 movie-detail-modal modal-overlay"
        onClick={handleOverlayClick}
      >
        {/* Ventana modal */}
        <div
          className="bg-[#141414] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative modal-scroll movie-detail-modal modal-content"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#E50914 #333',
          }}
        >
          {/* Header con botón de cerrar */}
          <div className="absolute top-4 right-4 z-[10000] movie-detail-modal modal-close-button">
            <button
              onClick={handleCloseWithAnimation}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors modal-close-button modal-close-btn"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative">
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl md:text-4xl font-black text-white mb-3 text-shadow">
                    {movie.title || movie.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-[#E50914] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {getMovieType()}
                    </span>
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      {getMovieYear()}
                    </span>
                    {movieDetails?.runtime && (
                      <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatRuntime(movieDetails.runtime)}
                      </span>
                    )}
                    <div className="flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      {movie.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 action-buttons">
                    <button
                      onClick={handlePlay}
                      className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-colors modal-action-btn"
                    >
                      <Play size={20} className="fill-current" />
                      Reproducir
                    </button>

                    <button
                      onClick={handleAddToFavorites}
                      className={`p-2 rounded-full transition-colors modal-action-btn ${
                        isFavorite(movie.id)
                          ? 'bg-[#E50914] text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={isFavorite(movie.id) ? 'En favoritos' : 'Agregar a favoritos'}
                    >
                      <Heart size={20} className={isFavorite(movie.id) ? 'fill-current' : ''} />
                    </button>

                    <button
                      onClick={handleAddToWatchHistory}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors modal-action-btn"
                      title="Agregar al historial"
                    >
                      <Plus size={20} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors modal-action-btn"
                      title="Compartir"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] relative z-10">
              <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="flex items-center space-x-1 bg-[#333]/50 rounded-xl p-1 mb-6 tab-navigation">
                  {[
                    { id: 'overview', label: 'Vista General', icon: Info },
                    { id: 'cast', label: 'Reparto', icon: Users },
                    { id: 'videos', label: 'Videos', icon: Play },
                    { id: 'similar', label: 'Similar', icon: Star },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm tab-button ${
                        activeTab === id
                          ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                          : 'text-[#E5E5E5] hover:text-white hover:bg-[#404040]'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {activeTab !== 'overview' && (
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder={`Buscar en ${activeTab === 'cast' ? 'reparto' : activeTab === 'videos' ? 'videos' : 'contenido similar'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#333] text-white rounded-lg border border-[#555] focus:border-[#E50914] focus:outline-none transition-colors modal-search-input"
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white modal-clear-btn"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="text-sm text-gray-400 mt-2">
                        {activeTab === 'cast' &&
                          `${filteredCast.length} de ${cast.length} actores encontrados`}
                        {activeTab === 'videos' &&
                          `${filteredVideos.length} de ${videos.length} videos encontrados`}
                        {activeTab === 'similar' &&
                          `${filteredSimilar.length} de ${similar.length} títulos similares encontrados`}
                      </p>
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-12">
                    <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
                    <p className="text-[#E5E5E5] text-lg">Cargando detalles...</p>
                  </div>
                )}

                {!isLoading && (
                  <div className="pb-8">
                    {activeTab === 'overview' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <h2 className="text-xl font-bold text-white mb-3">Sinopsis</h2>
                            <div className="bg-[#333]/30 p-4 rounded-xl border border-[#555]/30">
                              <p className="text-[#E5E5E5] text-base leading-relaxed whitespace-pre-line">
                                {getDetailedOverview()}
                              </p>
                            </div>
                          </div>

                          {movieDetails?.genres && movieDetails.genres.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3">Géneros</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {movieDetails.genres.map((genre) => (
                                  <div
                                    key={genre.id}
                                    className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="bg-[#E50914] text-white px-2 py-1 rounded-full text-xs font-bold">
                                        {genre.name}
                                      </span>
                                      <span className="text-[#999] text-xs">#{genre.id}</span>
                                    </div>
                                    <p className="text-[#CCC] text-xs">
                                      {getGenreDescription(genre.name)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              Clasificación y Advertencias
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`w-10 h-10 ${getContentRating().color} rounded-full flex items-center justify-center`}
                                  >
                                    <span className="text-white font-bold text-base">
                                      {getContentRating().rating}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold text-sm">
                                      Clasificación
                                    </h4>
                                    <p className="text-[#CCC] text-xs">
                                      {getContentRating().description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                  <AlertTriangle size={16} className="text-yellow-400" />
                                  Advertencias
                                </h4>
                                {getContentWarnings().length > 0 ? (
                                  <div className="space-y-1">
                                    {getContentWarnings().map((warning, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 text-[#CCC] text-xs"
                                      >
                                        <span className="text-base">{warning.icon}</span>
                                        <span>{warning.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[#CCC] text-xs">
                                    No hay advertencias específicas
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {movieDetails?.runtime && (
                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                  <Clock size={14} />
                                  Duración
                                </h4>
                                <p className="text-[#E5E5E5] text-sm">
                                  {formatRuntime(movieDetails.runtime)}
                                </p>
                              </div>
                            )}

                            {movieDetails?.budget && (
                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                  <span className="text-green-400">$</span>
                                  Presupuesto
                                </h4>
                                <p className="text-[#E5E5E5] text-sm">
                                  {formatCurrency(movieDetails.budget)}
                                </p>
                              </div>
                            )}

                            {movieDetails?.revenue && (
                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                  <span className="text-green-400">💰</span>
                                  Ingresos
                                </h4>
                                <p className="text-[#E5E5E5] text-sm">
                                  {formatCurrency(movieDetails.budget)}
                                </p>
                              </div>
                            )}

                            {movieDetails?.status && (
                              <div className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                  <span className="text-blue-400">📊</span>
                                  Estado
                                </h4>
                                <p className="text-[#E5E5E5] text-sm capitalize">
                                  {movieDetails.status}
                                </p>
                              </div>
                            )}
                          </div>

                          {movieDetails?.production_companies &&
                            movieDetails.production_companies.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">
                                  Producción
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {movieDetails.production_companies.slice(0, 4).map((company) => (
                                    <div
                                      key={company.id}
                                      className="bg-[#333]/50 p-3 rounded-lg border border-[#555]/30"
                                    >
                                      <div className="flex items-center gap-3">
                                        {company.logo_path ? (
                                          <img
                                            src={getImageUrl(company.logo_path, 'w92')}
                                            alt={company.name}
                                            className="w-6 h-6 object-contain"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-[#555] rounded flex items-center justify-center">
                                            <span className="text-[#999] text-xs">🎬</span>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-white font-medium text-xs">
                                            {company.name}
                                          </p>
                                          <p className="text-[#999] text-xs">
                                            {company.origin_country || 'Internacional'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="space-y-4">
                          <div className="bg-[#333]/50 p-3 rounded-lg">
                            <img
                              src={getImageUrl(movie.poster_path, 'w500')}
                              alt={movie.title || movie.name}
                              className="w-full rounded-lg shadow-lg"
                            />
                          </div>

                          <div className="bg-[#333]/50 p-3 rounded-lg space-y-3">
                            <h3 className="text-base font-semibold text-white">Estadísticas</h3>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#E5E5E5]">Calificación</span>
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-400 fill-current" />
                                <span className="text-white font-semibold">
                                  {movie.vote_average?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#E5E5E5]">Votos</span>
                              <span className="text-white font-semibold">
                                {movie.vote_count?.toLocaleString() || 'N/A'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#E5E5E5]">Popularidad</span>
                              <span className="text-white font-semibold">
                                {movie.popularity?.toFixed(0) || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-[#333]/50 p-3 rounded-lg space-y-2">
                            <h3 className="text-base font-semibold text-white">Acciones</h3>

                            <button
                              onClick={handleAddToFavorites}
                              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors text-sm ${
                                isFavorite(movie.id)
                                  ? 'bg-[#E50914] text-white'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              <Heart
                                size={16}
                                className={isFavorite(movie.id) ? 'fill-current' : ''}
                              />
                              {isFavorite(movie.id) ? 'En Favoritos' : 'Agregar a Favoritos'}
                            </button>

                            <button
                              onClick={handleAddToWatchHistory}
                              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors text-sm"
                            >
                              <Plus size={16} />
                              Agregar al Historial
                            </button>

                            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors text-sm">
                              <Download size={16} />
                              Descargar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'cast' && (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Reparto</h2>
                        {filteredCast.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredCast.map((person) => (
                              <div
                                key={person.id}
                                className="text-center group cursor-pointer hover:scale-105 transition-transform"
                              >
                                <div className="w-20 h-20 bg-[#333] rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                                  {person.profile_path ? (
                                    <img
                                      src={getImageUrl(person.profile_path, 'w200')}
                                      alt={person.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <Users size={32} className="text-[#666]" />
                                  )}
                                </div>
                                <h4 className="text-white font-semibold text-sm group-hover:text-[#E50914] transition-colors">
                                  {person.name}
                                </h4>
                                <p className="text-[#999] text-xs line-clamp-2">
                                  {person.character}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No se encontraron resultados para "{searchQuery}"</p>
                            <button
                              onClick={clearSearch}
                              className="mt-3 text-[#E50914] hover:underline modal-clear-search-btn"
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <Users size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay información del reparto disponible</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'videos' && (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>
                        {filteredVideos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => (
                              <div
                                key={video.id}
                                className="bg-[#333]/50 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                                onClick={() => handleVideoClick(video)}
                              >
                                <div className="aspect-video bg-[#666] flex items-center justify-center relative">
                                  <Play
                                    size={48}
                                    className="text-white group-hover:scale-110 transition-transform"
                                  />
                                  {video.official && (
                                    <div className="absolute top-2 right-2">
                                      <span className="bg-[#E50914] text-white px-2 py-1 rounded text-xs font-bold">
                                        Oficial
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h4 className="text-white font-semibold mb-2 line-clamp-2">
                                    {video.name}
                                  </h4>
                                  <div className="flex items-center justify-between text-sm text-[#999]">
                                    <span>{video.type}</span>
                                    <div className="flex items-center gap-1">
                                      <Play size={14} />
                                      <span>Reproducir</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No se encontraron videos para "{searchQuery}"</p>
                            <button
                              onClick={clearSearch}
                              className="mt-3 text-[#E50914] hover:underline modal-clear-search-btn"
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <Play size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay videos disponibles</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'similar' && (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Contenido Similar</h2>
                        {filteredSimilar.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredSimilar.map((item) => (
                              <div
                                key={item.id}
                                className="group cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => handleSimilarClick(item)}
                              >
                                <div className="relative overflow-hidden rounded-lg">
                                  <img
                                    src={getImageUrl(item.poster_path, 'w500')}
                                    alt={item.title}
                                    className="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play size={32} className="text-white" />
                                  </div>
                                </div>
                                <h4 className="text-white font-semibold text-sm mt-2 line-clamp-2">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star size={14} className="text-yellow-400 fill-current" />
                                  <span className="text-[#999] text-xs">
                                    {item.vote_average?.toFixed(1) || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No se encontró contenido similar para "{searchQuery}"</p>
                            <button
                              onClick={clearSearch}
                              className="mt-3 text-bold underline modal-clear-search-btn"
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <Star size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay contenido similar disponible</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoPlayer
        movie={movie}
        videoData={selectedVideo}
        isOpen={isVideoPlayerOpen}
        onClose={() => {
          setIsVideoPlayerOpen(false);
          setSelectedVideo(null);
        }}
      />

      {/* Estilos CSS personalizados para el scrollbar */}
      <style jsx>{`
        .modal-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .modal-scroll::-webkit-scrollbar-track {
          background: #333;
          border-radius: 4px;
        }

        .modal-scroll::-webkit-scrollbar-thumb {
          background: #e50914;
          border-radius: 4px;
        }

        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: #b2070f;
        }
      `}</style>
    </>
  );
};

export default MovieDetailModal;
