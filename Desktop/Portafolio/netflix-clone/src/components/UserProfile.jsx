import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  User,
  Mail,
  Calendar,
  Heart,
  Play,
  Star,
  Settings,
  LogOut,
  Trash2,
  Download,
  Database,
} from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import cacheService from '../services/cacheService';

const UserProfile = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cacheStats, setCacheStats] = useState(null);

  const { user, isAuthenticated, loginUser, logoutUser, addNotification, favorites, watchHistory } =
    useMovieContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      updateCacheStats();
    }
  }, [isOpen]);

  const updateCacheStats = () => {
    const stats = cacheService.getStats();
    setCacheStats(stats);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      addNotification({
        message: t('profile.form.fillAll'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Simular login exitoso
    const userData = {
      id: Date.now(),
      name: formData.email.split('@')[0], // Usar parte del email como nombre
      email: formData.email,
      joinedAt: new Date().toISOString(),
      avatar: null,
    };

    loginUser(userData);
    addNotification({
      message: t('profile.login.success'),
      type: 'success',
      duration: 3000,
    });

    // Reset form
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addNotification({
        message: t('profile.form.fillAll'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        message: t('profile.form.passwordMismatch'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Simular registro exitoso
    const userData = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      joinedAt: new Date().toISOString(),
      avatar: null,
    };

    loginUser(userData);
    addNotification({
      message: t('profile.register.success'),
      type: 'success',
      duration: 3000,
    });

    // Reset form
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    logoutUser();
    addNotification({
      message: t('profile.logout.success'),
      type: 'info',
      duration: 3000,
    });
    onClose();
  };

  const handleClearCache = () => {
    cacheService.clear();
    updateCacheStats();
    addNotification({
      message: t('profile.cache.cleared'),
      type: 'success',
      duration: 3000,
    });
  };

  const handleClearFavorites = () => {
    if (window.confirm(t('profile.favorites.confirmClear'))) {
      // Aquí implementarías la lógica para limpiar favoritos
      addNotification({
        message: t('profile.favorites.cleared'),
        type: 'success',
        duration: 3000,
      });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('profile.history.confirmClear'))) {
      // Aquí implementarías la lógica para limpiar historial
      addNotification({
        message: t('profile.history.cleared'),
        type: 'success',
        duration: 3000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#E50914] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isAuthenticated ? t('profile.title') : t('profile.login.title')}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!isAuthenticated ? (
            // Formulario de login/registro
            <div>
              {/* Tabs */}
              <div className="flex mb-6 bg-[#333] rounded-lg p-1">
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                    isLoginMode ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('profile.login.title')}
                </button>
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                    !isLoginMode ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('profile.register.title')}
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      {t('profile.form.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#333] text-white rounded-lg border border-[#555] focus:border-[#E50914] focus:outline-none"
                      placeholder={t('profile.form.namePlaceholder')}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#333] text-white rounded-lg border border-[#555] focus:border-[#E50914] focus:outline-none"
                    placeholder={t('profile.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    {t('profile.form.password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#333] text-white rounded-lg border border-[#555] focus:border-[#E50914] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      {t('profile.form.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#333] text-white rounded-lg border border-[#555] focus:border-[#E50914] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#E50914] hover:bg-[#E50914]/90 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors"
                >
                  {isLoginMode ? t('profile.login.submit') : t('profile.register.submit')}
                </button>
              </form>

              <div className="mt-6 text-center text-gray-400 text-sm">
                <p>
                  {isLoginMode ? t('profile.login.noAccount') : t('profile.login.haveAccount')}{' '}
                  <button
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-[#E50914] hover:underline"
                  >
                    {isLoginMode ? t('profile.login.registerHere') : t('profile.login.signinHere')}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            // Perfil del usuario
            <div className="space-y-6">
              {/* Información del usuario */}
              <div className="text-center">
                <div className="w-24 h-24 bg-[#E50914] rounded-full mx-auto mb-4 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('profile.memberSince', {
                    date: new Date(user.joinedAt).toLocaleDateString(
                      i18n.language === 'en' ? 'en-US' : 'es-ES'
                    ),
                  })}
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#333] p-4 rounded-lg text-center">
                  <Heart size={32} className="text-[#E50914] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{favorites.length}</p>
                  <p className="text-gray-400 text-sm">{t('profile.stats.favorites')}</p>
                </div>
                <div className="bg-[#333] p-4 rounded-lg text-center">
                  <Play size={32} className="text-[#E50914] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{watchHistory.length}</p>
                  <p className="text-gray-400 text-sm">{t('profile.stats.watched')}</p>
                </div>
                <div className="bg-[#333] p-4 rounded-lg text-center">
                  <Star size={32} className="text-[#E50914] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {favorites.length > 0
                      ? (
                          favorites.reduce((acc, item) => acc + (item.vote_average || 0), 0) /
                          favorites.length
                        ).toFixed(1)
                      : 'N/A'}
                  </p>
                  <p className="text-gray-400 text-sm">{t('profile.stats.average')}</p>
                </div>
              </div>

              {/* Estadísticas del caché */}
              {cacheStats && (
                <div className="bg-[#333] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={20} className="text-[#E50914]" />
                    <h4 className="text-white font-semibold">{t('profile.cache.title')}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{cacheStats.size}</p>
                      <p className="text-gray-400 text-xs">{t('profile.cache.items')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{cacheStats.maxSize}</p>
                      <p className="text-gray-400 text-xs">{t('profile.cache.max')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(cacheStats.maxAge / 60000)}m
                      </p>
                      <p className="text-gray-400 text-xs">{t('profile.cache.expiration')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-lg">{t('profile.actions.title')}</h4>

                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center gap-3 p-3 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-colors"
                >
                  <Database size={20} className="text-[#E50914]" />
                  <span>{t('profile.actions.clearCache')}</span>
                </button>

                <button
                  onClick={handleClearFavorites}
                  className="w-full flex items-center gap-3 p-3 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-colors"
                >
                  <Trash2 size={20} className="text-[#E50914]" />
                  <span>{t('profile.actions.clearFavorites')}</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="w-full flex items-center gap-3 p-3 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-colors"
                >
                  <Trash2 size={20} className="text-[#E50914]" />
                  <span>{t('profile.actions.clearHistory')}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 bg-[#E50914] hover:bg-[#E50914]/90 text-white rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>{t('profile.actions.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
