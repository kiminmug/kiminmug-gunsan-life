import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import NewsFeed from './components/NewsFeed';
import WeatherWidget from './components/WeatherWidget';
import LifeHub from './components/LifeHub'; // Updated Import
import AiConcierge from './components/AiConcierge';
import NotificationToast from './components/NotificationToast';
import NotificationCenter from './components/NotificationCenter';
import { AppTab, AppNotification } from './types';
import { MOCK_NEWS, MOCK_FORECAST, MOCK_TIDES } from './constants';
import { getDailyBriefing } from './services/geminiService';
import { Sun, ArrowRight, Bell, Anchor, Newspaper, MessageCircle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [briefing, setBriefing] = useState<string>("오늘의 군산 브리핑을 불러오는 중입니다...");
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  useEffect(() => {
    // Load daily briefing on mount
    getDailyBriefing().then(setBriefing);

    // --- MOCK NOTIFICATION SIMULATION ---
    
    // Simulate a Weather Alert after 4 seconds
    const weatherTimer = setTimeout(() => {
      addNotification({
        title: "⛈️ 호우 예비특보",
        message: "오늘 오후 3시부터 군산 지역에 강한 비가 예상됩니다. 시설물 관리와 안전사고에 유의하세요.",
        type: 'weather'
      });
    }, 4000);

    // Simulate a News Alert after 12 seconds
    const newsTimer = setTimeout(() => {
      addNotification({
        title: "🚦 긴급 교통 안내",
        message: "군산대 사거리 수도관 공사로 인해 차량 정체가 빚어지고 있습니다. 우회 바랍니다.",
        type: 'news'
      });
    }, 12000);

    return () => {
      clearTimeout(weatherTimer);
      clearTimeout(newsTimer);
    };
  }, []);

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif); // Show popup
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
          <div className="p-4 space-y-6 pb-20 flex flex-col min-h-[80vh]">
            
            {/* Landing Page Slogan / Hero */}
            <div className="mt-4 mb-2 animate-[fadeIn_0.5s_ease-out]">
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    하루에 한번보는<br/>
                    <span className="text-blue-600">군산정보</span>
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                    군산 시민을 위한 필수 정보를 한눈에 확인하세요.
                </p>
            </div>

            {/* Daily Briefing Card - Kept for "Once a Day" context */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-8 -mt-8 opacity-50 blur-xl"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                   <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                      <Bell size={16} />
                   </span>
                   <h2 className="font-bold text-gray-800">오늘의 한마디</h2>
                 </div>
                 <p className="text-gray-600 leading-relaxed text-sm font-medium">
                   "{briefing}"
                 </p>
               </div>
            </div>

            {/* Navigation Grid (Landing Page Menu) */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <button 
                    onClick={() => setActiveTab(AppTab.NEWS)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-[0.98] text-left flex flex-col justify-between h-32"
                >
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-2">
                        <Newspaper size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-lg">오늘의 뉴스</span>
                        <span className="text-xs text-gray-500">주요 신문사별 보기</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab(AppTab.WEATHER)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-[0.98] text-left flex flex-col justify-between h-32"
                >
                    <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2">
                        <Sun size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-lg">날씨 예보</span>
                        <span className="text-xs text-gray-500">오늘 및 주간 날씨</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab(AppTab.INFO)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition-all active:scale-[0.98] text-left flex flex-col justify-between h-32"
                >
                    <div className="bg-cyan-100 w-10 h-10 rounded-full flex items-center justify-center text-cyan-600 mb-2">
                        <Anchor size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-lg">생활/물때</span>
                        <span className="text-xs text-gray-500">물때, 행사, 긴급전화</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab(AppTab.CHAT)}
                    className="bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-800 hover:bg-gray-800 transition-all active:scale-[0.98] text-left flex flex-col justify-between h-32"
                >
                    <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-white mb-2">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-white text-lg">AI 비서</span>
                        <span className="text-xs text-gray-400">무엇이든 물어보세요</span>
                    </div>
                </button>
            </div>

            {/* Footer / Copyright */}
            <div className="mt-auto pt-8 text-center">
                 <p className="text-[10px] text-gray-400">
                    © 2024 Gunsan Life. All rights reserved.<br/>
                    제공되는 정보는 참고용이며, 실제와 다를 수 있습니다.
                 </p>
            </div>
          </div>
        );
      case AppTab.NEWS:
        return <NewsFeed />;
      case AppTab.WEATHER:
        return <WeatherWidget />;
      case AppTab.INFO:
        return <LifeHub />;
      case AppTab.CHAT:
        return <AiConcierge />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar 
        activeTab={activeTab} 
        unreadCount={unreadCount}
        onToggleNotifications={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
      />
      
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        {renderContent()}
        
        {/* Notification Overlay Components */}
        <NotificationToast 
          notification={activeToast} 
          onClose={() => setActiveToast(null)} 
        />
        
        <NotificationCenter 
          notifications={notifications}
          isOpen={isNotifCenterOpen}
          onClose={() => setIsNotifCenterOpen(false)}
          onMarkAsRead={markAsRead}
          onClearAll={clearAllNotifications}
        />
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;