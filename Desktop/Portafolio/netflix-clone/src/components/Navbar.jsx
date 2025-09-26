import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Heart, Search, Bell, User, List, Sparkles } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';
import AdvancedSearch from './AdvancedSearch';
import CustomLists from './CustomLists';
import NotificationsPanel from './NotificationsPanel';
import UserProfile from './UserProfile';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCustomListsOpen, setIsCustomListsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { addNotification, notifications } = useMovieContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsAdvancedSearchOpen(false);
    setIsCustomListsOpen(false);
    setIsNotificationsOpen(false);
    setIsUserProfileOpen(false);
    setIsMobileOpen(false);
  }, [location]);

  const handleAdvancedSearch = () => {
    setIsAdvancedSearchOpen(true);
  };

  const handleCustomLists = () => {
    setIsCustomListsOpen(true);
  };

  const handleNotifications = () => {
    setIsNotificationsOpen(true);
  };

  const handleUserProfile = () => {
    setIsUserProfileOpen(true);
  };

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  // Lock body scroll when mobile menu is open and close with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMobile();
    };
    if (isMobileOpen) {
      document.addEventListener('keydown', onKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'scrolled' : ''
        } ${isMobileOpen ? 'shadow-2xl nav--mobile-open' : ''}`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo de Netflix */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-[#E50914] text-2xl lg:text-3xl font-bold hover:scale-105 hover:brightness-110 hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all duration-300">
                MovieDB
              </div>
            </Link>

            {/* Navegación principal (oculta, usamos menú hamburguesa siempre) */}
            <div className="hidden items-center space-x-8">
              <Link
                to="/"
                className={`nav-link group ${location.pathname === '/' ? 'active' : ''}`}
              >
                <Home size={18} />
                <span>{t('nav.home')}</span>
              </Link>

              <Link
                to="/movies"
                className={`nav-link group ${location.pathname === '/movies' ? 'active' : ''}`}
              >
                <Film size={18} />
                <span>{t('nav.movies')}</span>
              </Link>

              <Link
                to="/series"
                className={`nav-link group ${location.pathname === '/series' ? 'active' : ''}`}
              >
                <Tv size={18} />
                <span>{t('nav.series')}</span>
              </Link>

              <Link
                to="/favorites"
                className={`nav-link group ${location.pathname === '/favorites' ? 'active' : ''}`}
              >
                <Heart size={18} />
                <span>{t('nav.favorites')}</span>
              </Link>

              <Link
                to="/recommendations"
                className={`nav-link group ${location.pathname === '/recommendations' ? 'active' : ''}`}
              >
                <Sparkles size={18} />
                <span>{t('nav.recommendations')}</span>
              </Link>
            </div>

            {/* Acciones del usuario (ocultas, se ofrecen en el menú hamburguesa) */}
            <div className="hidden items-center space-x-4">
              {/* Botón de búsqueda avanzada */}
              <button
                onClick={handleAdvancedSearch}
                className="btn-action btn-action-hover group"
                title={t('nav.searchTitle')}
              >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Botón de listas personalizadas */}
              <button
                onClick={handleCustomLists}
                className="btn-action btn-action-hover group"
                title={t('nav.listsTitle')}
              >
                <List size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Botón de notificaciones */}
              <button
                onClick={handleNotifications}
                className="btn-action btn-action-hover relative group"
                title={t('nav.notificationsTitle')}
              >
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E50914] rounded-full animate-pulse"></div>
                )}
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Perfil de usuario */}
              <button
                onClick={handleUserProfile}
                className="btn-action btn-action-hover group"
                title={t('nav.profileTitle')}
              >
                <User size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              {/* Selector de idioma */}
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-black/50 text-white border border-white/20 rounded px-2 py-1 text-sm"
                aria-label={t('heroA11y.languageSelector')}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>

            {/* Menú móvil */}
            <div className="md:hidden">
              <button
                onClick={toggleMobile}
                aria-label="Open navigation menu"
                aria-expanded={isMobileOpen}
                aria-controls="mobile-menu"
                className="btn-action btn-action-hover p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E50914]/70 active:scale-95"
              >
                <span className="sr-only">Menú</span>
                {isMobileOpen ? (
                  // Icono de cerrar
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Icono hamburguesa
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Backdrop */}
        {isMobileOpen && (
          <button
            onClick={closeMobile}
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] md:hidden"
          />
        )}

        {/* Menú móvil expandido */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            isMobileOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMobileOpen}
        >
          <div className="relative z-40 px-4 py-3 space-y-2 bg-[#141414]/95 backdrop-blur-sm shadow-2xl border-t border-white/10">
            <Link
              to="/"
              onClick={closeMobile}
              className={`mobile-nav-link group flex items-center gap-4 py-3.5 ${
                location.pathname === '/' ? 'active' : ''
              }`}
            >
              <Home size={22} />
              <span className="text-lg">{t('nav.home')}</span>
            </Link>

            <Link
              to="/movies"
              onClick={closeMobile}
              className={`mobile-nav-link group flex items-center gap-4 py-3.5 ${
                location.pathname === '/movies' ? 'active' : ''
              }`}
            >
              <Film size={22} />
              <span className="text-lg">{t('nav.movies')}</span>
            </Link>

            <Link
              to="/series"
              onClick={closeMobile}
              className={`mobile-nav-link group flex items-center gap-4 py-3.5 ${
                location.pathname === '/series' ? 'active' : ''
              }`}
            >
              <Tv size={22} />
              <span className="text-lg">{t('nav.series')}</span>
            </Link>

            <Link
              to="/favorites"
              onClick={closeMobile}
              className={`mobile-nav-link group flex items-center gap-4 py-3.5 ${
                location.pathname === '/favorites' ? 'active' : ''
              }`}
            >
              <Heart size={22} />
              <span className="text-lg">{t('nav.favorites')}</span>
            </Link>

            <Link
              to="/recommendations"
              onClick={closeMobile}
              className={`mobile-nav-link group flex items-center gap-4 py-3.5 ${
                location.pathname === '/recommendations' ? 'active' : ''
              }`}
            >
              <Sparkles size={22} />
              <span className="text-lg">{t('nav.recommendations')}</span>
            </Link>

            {/* Acciones trasladadas al menú: Búsqueda avanzada, Listas, Notificaciones, Perfil */}
            <button
              onClick={() => {
                closeMobile();
                handleAdvancedSearch();
              }}
              className="mobile-nav-link group flex items-center gap-4 py-3.5 w-full text-left"
            >
              <Search size={22} />
              <span className="text-lg">{t('nav.searchTitle')}</span>
            </button>

            <button
              onClick={() => {
                closeMobile();
                handleCustomLists();
              }}
              className="mobile-nav-link group flex items-center gap-4 py-3.5 w-full text-left"
            >
              <List size={22} />
              <span className="text-lg">{t('nav.listsTitle')}</span>
            </button>

            <button
              onClick={() => {
                closeMobile();
                handleNotifications();
              }}
              className="mobile-nav-link group flex items-center gap-4 py-3.5 w-full text-left relative"
            >
              <Bell size={22} />
              <span className="text-lg">{t('nav.notificationsTitle')}</span>
              {notifications.length > 0 && (
                <span className="ml-auto bg-[#E50914] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                closeMobile();
                handleUserProfile();
              }}
              className="mobile-nav-link group flex items-center gap-4 py-3.5 w-full text-left"
            >
              <User size={22} />
              <span className="text-lg">{t('nav.profileTitle')}</span>
            </button>

            {/* Idioma en móvil */}
            <div className="pt-2">
              <label htmlFor="mobile-lang" className="sr-only">
                {t('heroA11y.languageSelector')}
              </label>
              <select
                id="mobile-lang"
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  closeMobile();
                }}
                className="w-full bg-black/60 text-white border border-white/20 rounded-full px-4 py-2.5 text-base shadow-inner"
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Búsqueda avanzada */}
      <AdvancedSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />

      {/* Listas personalizadas */}
      <CustomLists isOpen={isCustomListsOpen} onClose={() => setIsCustomListsOpen(false)} />

      {/* Panel de notificaciones */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Perfil de usuario */}
      <UserProfile isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} />
    </>
  );
};

export default Navbar;
