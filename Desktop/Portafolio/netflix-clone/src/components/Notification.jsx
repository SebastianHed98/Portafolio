import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Trigger enter animation after mount
  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'warning':
        return <Info size={20} className="text-yellow-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50';
      case 'error':
        return 'bg-red-900/90 border-red-500/50';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50';
      default:
        return 'bg-blue-900/90 border-blue-500/50';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`relative mx-auto w-full pointer-events-auto ${getBgColor()} 
                 border rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300
                 ${isExiting ? '-translate-y-2 opacity-0' : hasEntered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{message}</p>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-300 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
