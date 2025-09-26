import { useMovieContext } from '../context/MovieContext';
import Notification from './Notification';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useMovieContext();

  if (notifications.length === 0) return null;

  // Mostrar máximo 3 notificaciones (las más recientes) y añadir mayor separación vertical en móvil
  const visible = notifications.slice(-3);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] w-[calc(100%-2rem)] max-w-sm space-y-3 md:space-y-2 pointer-events-none md:left-auto md:right-4 md:translate-x-0 md:w-auto md:max-w-none">
      {visible.map((notification, idx) => (
        <div
          key={notification.id}
          className="pointer-events-none"
          style={{ transform: `translateY(${idx * 4}px)` }}
        >
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
