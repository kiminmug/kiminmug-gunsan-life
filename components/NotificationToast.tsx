import React, { useEffect } from 'react';
import { X, CloudLightning, AlertTriangle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'weather': return <CloudLightning className="text-blue-500" size={24} />;
      case 'news': return <AlertTriangle className="text-orange-500" size={24} />;
      default: return <Info className="text-gray-500" size={24} />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'weather': return 'border-blue-500';
      case 'news': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="fixed top-20 left-4 right-4 z-[60] flex justify-center pointer-events-none">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm pointer-events-auto border-l-4 ${getBorderColor()} p-4 animate-[slideIn_0.3s_ease-out]`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">{notification.title}</h3>
            <p className="text-gray-600 text-sm mt-1 leading-snug">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;