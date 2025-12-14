import React from 'react';
import { X, CloudLightning, AlertTriangle, Info, BellOff } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  isOpen, 
  onClose,
  onMarkAsRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudLightning size={16} className="text-blue-500" />;
      case 'news': return <AlertTriangle size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative mt-14 mx-2 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            알림함
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </h2>
          <div className="flex gap-3 text-xs">
            {notifications.length > 0 && (
              <button onClick={onClearAll} className="text-gray-500 hover:text-red-500 font-medium">
                전체 삭제
              </button>
            )}
            <button onClick={onClose} className="text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <BellOff size={48} className="mb-3 opacity-20" />
              <p className="text-sm">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 rounded-xl transition-colors cursor-pointer flex gap-3 ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'weather' ? 'bg-blue-100' : notif.type === 'news' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${notif.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;