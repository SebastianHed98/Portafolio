

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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'scrolled' : ''
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo de Netflix */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-[#E50914] text-2xl lg:text-3xl font-bold hover:scale-105 hover:brightness-110 hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all duration-300">
                NETFLIX
              </div>
            </Link>

            {/* Navegación principal */}
            <div className="hidden md:flex items-center space-x-8">
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

            {/* Acciones del usuario */}
            <div className="flex items-center space-x-4">
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
                aria-label="Language selector"
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>

            {/* Menú móvil */}
            <div className="md:hidden">
              <button className="btn-action btn-action-hover">
                <span className="sr-only">Menú</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil expandido */}
        <div className="md:hidden">
          <div className="px-4 py-2 space-y-1 bg-[#141414]/95 backdrop-blur-sm">
            <Link 
              to="/" 
              className={`mobile-nav-link group ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>{t('nav.home')}</span>
            </Link>
            
            <Link 
              to="/movies" 
              className={`mobile-nav-link group ${location.pathname === '/movies' ? 'active' : ''}`}
            >
              <Film size={18} />
              <span>{t('nav.movies')}</span>
            </Link>
            
            <Link 
              to="/series" 
              className={`mobile-nav-link group ${location.pathname === '/series' ? 'active' : ''}`}
            >
              <Tv size={18} />
              <span>{t('nav.series')}</span>
            </Link>
            
            <Link 
              to="/favorites" 
              className={`mobile-nav-link group ${location.pathname === '/favorites' ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>{t('nav.favorites')}</span>
            </Link>
            
            <Link 
              to="/recommendations" 
              className={`mobile-nav-link group ${location.pathname === '/recommendations' ? 'active' : ''}`}
            >
              <Sparkles size={18} />
              <span>{t('nav.recommendations')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Búsqueda avanzada */}
      <AdvancedSearch 
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />

             {/* Listas personalizadas */}
       <CustomLists 
         isOpen={isCustomListsOpen}
         onClose={() => setIsCustomListsOpen(false)}
       />

       {/* Panel de notificaciones */}
       <NotificationsPanel 
         isOpen={isNotificationsOpen}
         onClose={() => setIsNotificationsOpen(false)}
       />

       {/* Perfil de usuario */}
       <UserProfile 
         isOpen={isUserProfileOpen}
         onClose={() => setIsUserProfileOpen(false)}
       />
    </>
  );
};

export default Navbar;
