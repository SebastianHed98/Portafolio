import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Check, AlertTriangle, Info, Trash2, Settings } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, addNotification } = useMovieContext();
  const { t, i18n } = useTranslation();
  const [filterType, setFilterType] = useState('all'); // 'all', 'success', 'error', 'warning', 'info'
  const [showRead, setShowRead] = useState(true);

  // Filtrar notificaciones según el tipo y estado
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (!showRead && notification.read) return false;
    return true;
  });

  // Marcar notificación como leída
  const markAsRead = (notificationId) => {
    // En un sistema real, actualizarías el estado de la notificación
    addNotification({
      message: t('notifications.markedRead'),
      type: 'info',
      duration: 2000
    });
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    addNotification({
      message: t('notifications.allMarkedRead'),
      type: 'success',
      duration: 2000
    });
  };

  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    addNotification({
      message: t('notifications.cleared'),
      type: 'info',
      duration: 2000
    });
  };

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check size={20} className="text-green-400" />;
      case 'error':
        return <X size={20} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  // Obtener color de fondo según el tipo
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  // Renderizar notificación individual
  const renderNotification = (notification) => (
    <div
      key={notification.id}
      className={`p-4 rounded-lg border ${getNotificationBgColor(notification.type)} transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {new Date(notification.timestamp).toLocaleString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
            
            <div className="flex items-center space-x-2">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t('notifications.markAsRead')}
                </button>
              )}
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title={t('notifications.deleteOne')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar panel vacío
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell size={32} className="text-[#E50914]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        No hay notificaciones
      </h3>
      <p className="text-gray-400 text-sm">
        {filterType === 'all' 
          ? 'Estás al día con todas las notificaciones'
          : `No hay notificaciones de tipo "${filterType}"`
        }
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E50914]/20 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-[#E50914]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('notifications.title')}</h1>
              <p className="text-sm text-gray-400">
                {t('notifications.count', { count: notifications.length })}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filtros y acciones */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Filtro por tipo */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#333]/80 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-[#E50914] focus:outline-none transition-colors text-sm"
              >
                <option value="all">{t('notifications.filters.all')}</option>
                <option value="success">{t('notifications.filters.success')}</option>
                <option value="error">{t('notifications.filters.error')}</option>
                <option value="warning">{t('notifications.filters.warning')}</option>
                <option value="info">{t('notifications.filters.info')}</option>
              </select>

              {/* Mostrar/ocultar leídas */}
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="rounded border-white/20 text-[#E50914] focus:ring-[#E50914]"
                />
                <span>{t('notifications.showRead')}</span>
              </label>
            </div>

            {/* Acciones masivas */}
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 bg-[#333]/80 hover:bg-[#404040] text-white text-sm rounded-lg transition-colors"
              >
                {t('notifications.markAllAsRead')}
              </button>
              
              <button
                onClick={clearAllNotifications}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors border border-red-600/30"
              >
                {t('notifications.clearAll')}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map(renderNotification)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {t('notifications.showing', { shown: filteredNotifications.length, total: notifications.length })}
            </span>
            
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{t('notifications.filters.success')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>{t('notifications.filters.error')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>{t('notifications.filters.warning')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{t('notifications.filters.info')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
