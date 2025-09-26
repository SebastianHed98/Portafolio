import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Star, Clock, TrendingUp, Heart, Play, Plus, Info } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import { getMoviesByGenre, getSeriesByGenre, getTopRatedMovies, getTopRatedSeries } from '../services/tmdbApi';
import VideoPlayer from './VideoPlayer';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState({
    byGenre: [],
    byRating: [],
    trending: [],
    similar: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { favorites, addNotification, playMovie, toggleFavorite, isFavorite } = useMovieContext();

  useEffect(() => {
    generateRecommendations();
  }, [favorites, i18n.language]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const newRecommendations = {
        byGenre: [],
        byRating: [],
        trending: [],
        similar: []
      };

      // Analizar géneros favoritos
      if (favorites.length > 0) {
        const genreCounts = {};
        favorites.forEach(item => {
          if (item.genre_ids) {
            item.genre_ids.forEach(genreId => {
              genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
            });
          }
        });

        // Obtener top 3 géneros favoritos
        const topGenres = Object.entries(genreCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([genreId]) => parseInt(genreId));

        // Obtener contenido por género favorito
        for (const genreId of topGenres) {
          try {
            const movies = await getMoviesByGenre(genreId, 1);
            const series = await getSeriesByGenre(genreId, 1);
            newRecommendations.byGenre.push(...movies.slice(0, 5), ...series.slice(0, 5));
          } catch (error) {
            console.error(`Error fetching genre ${genreId}:`, error);
          }
        }
      }

      // Obtener contenido mejor valorado
      try {
        const topMovies = await getTopRatedMovies(1);
        const topSeries = await getTopRatedSeries(1);
        newRecommendations.byRating = [...topMovies.slice(0, 10), ...topSeries.slice(0, 10)];
      } catch (error) {
        console.error('Error fetching top rated:', error);
      }

      // Obtener tendencias
      try {
        const trendingMovies = await getMoviesByGenre(28, 1); // Acción
        const trendingSeries = await getSeriesByGenre(18, 1); // Drama
        newRecommendations.trending = [...trendingMovies.slice(0, 8), ...trendingSeries.slice(0, 8)];
      } catch (error) {
        console.error('Error fetching trending:', error);
      }

      // Generar recomendaciones similares basadas en favoritos
      if (favorites.length > 0) {
        const similarContent = [];
        const favoriteGenres = new Set();
        
        favorites.forEach(item => {
          if (item.genre_ids) {
            item.genre_ids.forEach(genreId => favoriteGenres.add(genreId));
          }
        });

        // Buscar contenido similar por género y rating
        const similarPromises = Array.from(favoriteGenres).slice(0, 3).map(async (genreId) => {
          try {
            const movies = await getMoviesByGenre(genreId, 1);
            const series = await getSeriesByGenre(genreId, 1);
            return [...movies, ...series];
          } catch (error) {
            return [];
          }
        });

        const similarResults = await Promise.all(similarPromises);
        similarResults.forEach(content => {
          similarContent.push(...content);
        });

        // Filtrar contenido que no esté en favoritos
        newRecommendations.similar = similarContent
          .filter(item => !favorites.some(fav => fav.id === item.id))
          .slice(0, 12);
      }

      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      addNotification({
        message: 'Error al generar recomendaciones',
        type: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (movie) => {
    playMovie(movie);
    setSelectedMovie(movie);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedMovie(null);
  };

  const handleAddToFavorites = (movie) => {
    toggleFavorite(movie);
  };

  const renderContentGrid = (content, title, icon, emptyMessage) => {
    if (!content || content.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-3">{icon}</div>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[#333] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              
              {/* Overlay con botones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(item);
                    }}
                    className="p-2 bg-white text-[#141414] rounded-full hover:bg-gray-200 transition-colors"
                    title={t('common.play')}
                  >
                    <Play size={16} className="fill-current" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorites(item);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite(item.id)
                        ? 'bg-[#E50914] text-white'
                        : 'bg-[#808080]/80 text-white hover:bg-[#E50914]'
                    }`}
                    title={isFavorite(item.id) ? t('common.inFavorites') : t('common.addToFavorites')}
                  >
                    <Heart size={16} className="fill-current" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addNotification({
                        message: `Más información de "${item.title || item.name}"`,
                        type: 'info',
                        duration: 2000
                      });
                    }}
                    className="p-2 bg-[#808080]/80 text-white rounded-full hover:bg-[#808080] transition-colors"
                    title={t('common.moreInfo')}
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>

              {/* Indicador de favorito */}
              {isFavorite(item.id) && (
                <div className="absolute top-2 right-2 bg-[#E50914] text-white p-1 rounded-full">
                  <Heart size={12} className="fill-current" />
                </div>
              )}
            </div>

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
                  {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                </span>
              </div>
              
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-[#E50914] text-white text-xs rounded">
                  {item.title ? 'Película' : 'Serie'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E50914] mx-auto mb-4"></div>
            <p className="text-white text-lg">{t('recommendations.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles size={32} className="text-[#E50914]" />
            <h1 className="text-4xl font-bold text-white">{t('recommendations.title')}</h1>
            <Sparkles size={32} className="text-[#E50914]" />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('recommendations.subtitle')}
          </p>
        </div>

        {/* Recomendaciones por género favorito */}
        {recommendations.byGenre.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp size={24} className="text-[#E50914]" />
              <h2 className="text-2xl font-bold text-white">{t('recommendations.byGenre')}</h2>
            </div>
            {renderContentGrid(
              recommendations.byGenre,
              t('recommendations.byGenre'),
              '🎭',
              t('recommendations.empty.byGenre')
            )}
          </section>
        )}

        {/* Contenido mejor valorado */}
        {recommendations.byRating.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <Star size={24} className="text-[#E50914]" />
              <h2 className="text-2xl font-bold text-white">{t('recommendations.topRated')}</h2>
            </div>
            {renderContentGrid(
              recommendations.byRating,
              t('recommendations.topRated'),
              '⭐',
              t('recommendations.empty.topRated')
            )}
          </section>
        )}

        {/* Tendencias */}
        {recommendations.trending.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp size={24} className="text-[#E50914]" />
              <h2 className="text-2xl font-bold text-white">{t('recommendations.trending')}</h2>
            </div>
            {renderContentGrid(
              recommendations.trending,
              t('recommendations.trending'),
              '🔥',
              t('recommendations.empty.trending')
            )}
          </section>
        )}

        {/* Contenido similar */}
        {recommendations.similar.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <Heart size={24} className="text-[#E50914]" />
              <h2 className="text-2xl font-bold text-white">{t('recommendations.similar')}</h2>
            </div>
            {renderContentGrid(
              recommendations.similar,
              t('recommendations.similar'),
              '💝',
              t('recommendations.empty.similar')
            )}
          </section>
        )}

        {/* Mensaje si no hay recomendaciones */}
        {Object.values(recommendations).every(arr => arr.length === 0) && (
          <div className="text-center py-16">
            <Sparkles size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('recommendations.noneTitle')}
            </h3>
            <p className="text-gray-400 mb-6">
              {t('recommendations.noneSubtitle')}
            </p>
            <button
              onClick={() => window.location.href = '/favorites'}
              className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('recommendations.goToFavorites')}
            </button>
          </div>
        )}

        {/* Botón para regenerar recomendaciones */}
        <div className="text-center py-8">
          <button
            onClick={generateRecommendations}
            className="bg-[#333] hover:bg-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
          >
            <Sparkles size={20} />
            <span>{t('recommendations.regenerate')}</span>
          </button>
        </div>
      </div>

      {/* Reproductor de video */}
      <VideoPlayer
        movie={selectedMovie}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />
    </div>
  );
};

export default Recommendations;
