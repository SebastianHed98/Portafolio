import { createContext, useContext, useReducer, useEffect } from 'react';
import i18n from 'i18next';

// Estado inicial
const initialState = {
  favorites: [],
  watchHistory: [],
  currentPlaying: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  notifications: [],
  user: null,
  isAuthenticated: false,
};

// Tipos de acciones
const ACTIONS = {
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  ADD_TO_WATCH_HISTORY: 'ADD_TO_WATCH_HISTORY',
  SET_CURRENT_PLAYING: 'SET_CURRENT_PLAYING',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
  LOAD_WATCH_HISTORY: 'LOAD_WATCH_HISTORY',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
};

// Reducer para manejar el estado
const movieReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TO_FAVORITES:
      const isAlreadyFavorite = state.favorites.some(item => item.id === action.payload.id);
      if (isAlreadyFavorite) {
        return state; // Ya está en favoritos
      }
      return {
        ...state,
        favorites: [...state.favorites, { ...action.payload, addedAt: new Date().toISOString() }],
      };

    case ACTIONS.REMOVE_FROM_FAVORITES:
      return {
        ...state,
        favorites: state.favorites.filter(item => item.id !== action.payload),
      };

    case ACTIONS.ADD_TO_WATCH_HISTORY:
      const existingHistory = state.watchHistory.filter(item => item.id !== action.payload.id);
      return {
        ...state,
        watchHistory: [
          { ...action.payload, watchedAt: new Date().toISOString() },
          ...existingHistory
        ].slice(0, 50), // Mantener solo los últimos 50
      };

    case ACTIONS.SET_CURRENT_PLAYING:
      return {
        ...state,
        currentPlaying: action.payload,
      };

    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        searchQuery: '',
      };

    case ACTIONS.LOAD_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
      };

    case ACTIONS.LOAD_WATCH_HISTORY:
      return {
        ...state,
        watchHistory: action.payload,
      };

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }],
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};

// Crear el contexto
const MovieContext = createContext();

// Hook personalizado para usar el contexto
export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext debe ser usado dentro de un MovieProvider');
  }
  return context;
};

// Proveedor del contexto
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Console.log temporal para verificar que el contexto se esté cargando
  console.log('🎬 MovieContext cargado correctamente');

  // Cargar favoritos desde localStorage al inicializar
  useEffect(() => {
    console.log('📱 Cargando favoritos desde localStorage...');
    const savedFavorites = localStorage.getItem('netflix-favorites');
    const savedWatchHistory = localStorage.getItem('netflix-watch-history');
    const savedUser = localStorage.getItem('netflixUser');
    
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: ACTIONS.LOAD_FAVORITES, payload: favorites });
        console.log('✅ Favoritos cargados:', favorites.length);
      } catch (error) {
        console.error('❌ Error al cargar favoritos:', error);
      }
    }
    
    if (savedWatchHistory) {
      try {
        const watchHistory = JSON.parse(savedWatchHistory);
        dispatch({ type: ACTIONS.LOAD_WATCH_HISTORY, payload: watchHistory });
        console.log('✅ Historial cargado:', watchHistory.length);
      } catch (error) {
        console.error('❌ Error al cargar historial:', error);
      }
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: ACTIONS.SET_USER, payload: user });
        console.log('✅ Usuario cargado:', user.name);
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
      }
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('netflix-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('netflix-watch-history', JSON.stringify(state.watchHistory));
  }, [state.watchHistory]);

  // Funciones para manejar favoritos
  const addToFavorites = (movie) => {
    console.log('➕ Agregando a favoritos:', movie.title || movie.name);
    dispatch({ type: ACTIONS.ADD_TO_FAVORITES, payload: movie });
    
    // Agregar notificación
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: {
        message: i18n.t('context.addedToList', { title: movie.title || movie.name }),
        type: 'success',
        duration: 3000,
      }
    });
  };

  const removeFromFavorites = (movieId) => {
    const movie = state.favorites.find(item => item.id === movieId);
    console.log('➖ Eliminando de favoritos:', movie?.title || movie?.name);
    dispatch({ type: ACTIONS.REMOVE_FROM_FAVORITES, payload: movieId });
    
    // Agregar notificación
    if (movie) {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          message: i18n.t('context.removedFromList', { title: movie.title || movie.name }),
          type: 'info',
          duration: 3000,
        }
      });
    }
  };

  const toggleFavorite = (movie) => {
    const isFavorite = state.favorites.some(item => item.id === movie.id);
    if (isFavorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  const isFavorite = (movieId) => {
    return state.favorites.some(item => item.id === movieId);
  };

  // Funciones para manejar reproducción
  const playMovie = (movie) => {
    console.log('▶️ Reproduciendo:', movie.title || movie.name);
    dispatch({ type: ACTIONS.SET_CURRENT_PLAYING, payload: movie });
    dispatch({ type: ACTIONS.ADD_TO_WATCH_HISTORY, payload: movie });
    
    // Agregar notificación
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: {
        message: i18n.t('context.playing', { title: movie.title || movie.name }),
        type: 'info',
        duration: 2000,
      }
    });
    
    // Aquí podrías implementar la lógica real de reproducción
    // Por ahora, simularemos abrir un modal o navegar a una página de reproducción
    console.log('Reproduciendo:', movie.title || movie.name);
    
    // Simular reproducción (en una app real, esto abriría un reproductor)
    setTimeout(() => {
      dispatch({ type: ACTIONS.SET_CURRENT_PLAYING, payload: null });
    }, 1000);
  };

  const addToWatchHistory = (movie) => {
    dispatch({ type: ACTIONS.ADD_TO_WATCH_HISTORY, payload: movie });
  };

  const stopPlaying = () => {
    dispatch({ type: ACTIONS.SET_CURRENT_PLAYING, payload: null });
  };

  // Funciones para búsqueda
  const setSearchQuery = (query) => {
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
  };

  const clearSearch = () => {
    dispatch({ type: ACTIONS.CLEAR_SEARCH });
  };

  // Funciones para loading y errores
  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };

  // Funciones para notificaciones
  const addNotification = (notification) => {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
  };

  const removeNotification = (notificationId) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
  };

  // Funciones de autenticación
  const loginUser = (user) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user });
    localStorage.setItem('netflixUser', JSON.stringify(user));
  };

  const logoutUser = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    localStorage.removeItem('netflixUser');
  };

  // Funciones para obtener datos
  const getFavorites = () => state.favorites;
  const getWatchHistory = () => state.watchHistory;
  const getCurrentPlaying = () => state.currentPlaying;
  const getSearchQuery = () => state.searchQuery;
  const getIsLoading = () => state.isLoading;
  const getError = () => state.error;
  const getNotifications = () => state.notifications;

  // Valor del contexto
  const value = {
    // Estado
    favorites: state.favorites,
    watchHistory: state.watchHistory,
    currentPlaying: state.currentPlaying,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    error: state.error,
    notifications: state.notifications,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    
    // Funciones de favoritos
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    
    // Funciones de reproducción
    playMovie,
    stopPlaying,
    addToWatchHistory,
    
    // Funciones de búsqueda
    setSearchQuery,
    clearSearch,
    
    // Funciones de utilidad
    setLoading,
    setError,
    
    // Funciones de notificaciones
    addNotification,
    removeNotification,
    
    // Funciones de autenticación
    loginUser,
    logoutUser,
    
    // Getters
    getFavorites,
    getWatchHistory,
    getCurrentPlaying,
    getSearchQuery,
    getIsLoading,
    getError,
    getNotifications,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};
