import cacheService from './cacheService';
import i18n from 'i18next';

const API_KEY = "a144777441fe09d63772c92bf1eb443c";
const BASE_URL = "https://api.themoviedb.org/3";

// Mapear código de i18n a locale de TMDB
const mapLanguageToTmdb = (lng) => {
  if (!lng) return 'es-ES';
  switch (lng) {
    case 'en':
    case 'en-US':
      return 'en-US';
    case 'es':
    case 'es-ES':
    default:
      return 'es-ES';
  }
};

// Función para construir URLs con parámetros
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  const currentLng = i18n?.language;
  url.searchParams.append('language', mapLanguageToTmdb(currentLng));
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

// Función para obtener la URL de la imagen
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Películas populares
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/movie/popular', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Series populares
export const getPopularSeries = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/tv/popular', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular series:', error);
    return [];
  }
};

// Tendencias
export const getTrending = async (mediaType = 'all', timeWindow = 'week', page = 1) => {
  try {
    const response = await fetch(buildUrl(`/trending/${mediaType}/${timeWindow}`, { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

// Detalles de película
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(buildUrl(`/movie/${movieId}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Detalles de serie
export const getSeriesDetails = async (seriesId) => {
  try {
    const response = await fetch(buildUrl(`/tv/${seriesId}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching series details:', error);
    return null;
  }
};

// Búsqueda múltiple (películas, series, personas)
export const searchMulti = async (query, page = 1) => {
  try {
    const response = await fetch(buildUrl('/search/multi', { 
      query, 
      page,
      include_adult: false 
    }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

// Búsqueda de películas
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(buildUrl('/search/movie', { 
      query, 
      page,
      include_adult: false 
    }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

// Búsqueda de series
export const searchSeries = async (query, page = 1) => {
  try {
    const response = await fetch(buildUrl('/search/tv', { 
      query, 
      page,
      include_adult: false 
    }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching series:', error);
    return [];
  }
};

// Obtener géneros
export const getGenres = async (mediaType = 'movie') => {
  try {
    const response = await fetch(buildUrl(`/genre/${mediaType}/list`));
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

// Películas por género
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await fetch(buildUrl('/discover/movie', { 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc'
    }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
};

// Series por género
export const getSeriesByGenre = async (genreId, page = 1) => {
  try {
    const response = await fetch(buildUrl('/discover/tv', { 
      with_genres: genreId, 
      page,
      sort_by: 'popularity.desc'
    }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching series by genre:', error);
    return [];
  }
};

// Películas mejor valoradas
export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/movie/top_rated', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

// Series mejor valoradas
export const getTopRatedSeries = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/tv/top_rated', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    return [];
  }
};

// Películas próximas
export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/movie/upcoming', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

// Series en el aire
export const getOnAirSeries = async (page = 1) => {
  try {
    const response = await fetch(buildUrl('/tv/on_the_air', { page }));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching on air series:', error);
    return [];
  }
};

// Obtener reparto de una película
export const getMovieCredits = async (movieId) => {
  return cacheService.cachedRequest(
    `movie/${movieId}/credits`,
    { movieId },
    async () => {
      try {
        const url = buildUrl(`/movie/${movieId}/credits`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.cast || [];
      } catch (error) {
        console.error('Error fetching movie credits:', error);
        return [];
      }
    }
  );
};

// Obtener reparto de una serie
export const getSeriesCredits = async (seriesId) => {
  return cacheService.cachedRequest(
    `tv/${seriesId}/credits`,
    { seriesId },
    async () => {
      try {
        const url = buildUrl(`/tv/${seriesId}/credits`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.cast || [];
      } catch (error) {
        console.error('Error fetching series credits:', error);
        return [];
      }
    }
  );
};

// Obtener videos/trailers de una película
export const getMovieVideos = async (movieId) => {
  return cacheService.cachedRequest(
    `movie/${movieId}/videos`,
    { movieId },
    async () => {
      try {
        const url = buildUrl(`/movie/${movieId}/videos`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Error fetching movie videos:', error);
        return [];
      }
    }
  );
};

// Obtener videos/trailers de una serie
export const getSeriesVideos = async (seriesId) => {
  return cacheService.cachedRequest(
    `tv/${seriesId}/videos`,
    { seriesId },
    async () => {
      try {
        const url = buildUrl(`/tv/${seriesId}/videos`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Error fetching series videos:', error);
        return [];
      }
    }
  );
};

// Obtener contenido similar
export const getSimilarMovies = async (movieId) => {
  return cacheService.cachedRequest(
    `movie/${movieId}/similar`,
    { movieId },
    async () => {
      try {
        const url = buildUrl(`/movie/${movieId}/similar`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Error fetching similar movies:', error);
        return [];
      }
    }
  );
};

export const getSimilarSeries = async (seriesId) => {
  return cacheService.cachedRequest(
    `tv/${seriesId}/similar`,
    { seriesId },
    async () => {
      try {
        const url = buildUrl(`/tv/${seriesId}/similar`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Error fetching similar series:', error);
        return [];
      }
    }
  );
};
