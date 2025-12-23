
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import NewsFeed from './components/NewsFeed';
import WeatherWidget from './components/WeatherWidget';
import LifeHub from './components/LifeHub';
import AiConcierge from './components/AiConcierge';
import NotificationToast from './components/NotificationToast';
import NotificationCenter from './components/NotificationCenter';
import { AppTab, AppNotification } from './types';
import DailyBriefingModal from './components/DailyBriefingModal';
import { getDailyBriefing, getRealtimeAlerts } from './services/geminiService';
import { Sun, Anchor, Newspaper, MessageCircle, Bell, Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [briefing, setBriefing] = useState<string>("오늘의 군산 상황을 확인하는 중입니다...");
  const [isUpdating, setIsUpdating] = useState(true);

  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
  };

  useEffect(() => {
    const initializeAppData = async () => {
      setIsUpdating(true);
      try {
        // 1. Get Daily Briefing
        const briefingText = await getDailyBriefing();
        setBriefing(briefingText);
        setShowBriefingModal(true); // Auto-open modal when ready

        // 2. Get Real-time Alerts from AI (Traffic, Weather accidents)
        const alerts = await getRealtimeAlerts();

        if (alerts && alerts.length > 0) {
          // Display alerts with a slight delay for better UX
          alerts.forEach((alert, index) => {
            setTimeout(() => {
              addNotification({
                title: alert.title || "군산 소식",
                message: alert.message || "새로운 정보가 있습니다.",
                type: (alert.type as any) || 'info'
              });
            }, (index + 1) * 3000);
          });
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    initializeAppData();
  }, []);

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
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                  하루에 한번보는<br />
                  <span className="text-blue-600">군산정보</span>
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mt-2">
                {isUpdating ? (
                  <><Loader2 size={12} className="animate-spin text-blue-500" /> 실시간 데이터 동기화 중...</>
                ) : (
                  <><CheckCircle2 size={12} className="text-green-500" /> 실시간 정보 업데이트 완료</>
                )}
              </div>
            </div>

            {/* Daily Briefing Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-8 -mt-8 opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                    <Bell size={16} />
                  </span>
                  <h2 className="font-bold text-gray-800">오늘의 한마디</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-[15px] font-medium whitespace-pre-line line-clamp-3">
                  "{briefing}"
                </p>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => setActiveTab(AppTab.NEWS)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-[0.95] text-left flex flex-col justify-between h-32"
              >
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <Newspaper size={20} />
                </div>
                <div>
                  <span className="block font-bold text-gray-800 text-lg">오늘의 뉴스</span>
                  <span className="text-xs text-gray-500">실시간 지역 뉴스</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab(AppTab.WEATHER)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-[0.95] text-left flex flex-col justify-between h-32"
              >
                <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2">
                  <Sun size={20} />
                </div>
                <div>
                  <span className="block font-bold text-gray-800 text-lg">날씨 예보</span>
                  <span className="text-xs text-gray-500">실시간 기상 특보</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab(AppTab.INFO)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition-all active:scale-[0.95] text-left flex flex-col justify-between h-32"
              >
                <div className="bg-cyan-100 w-10 h-10 rounded-full flex items-center justify-center text-cyan-600 mb-2">
                  <Anchor size={20} />
                </div>
                <div>
                  <span className="block font-bold text-gray-800 text-lg">생활/물때</span>
                  <span className="text-xs text-gray-500">물때 및 긴급전화</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab(AppTab.CHAT)}
                className="bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-800 hover:bg-gray-800 transition-all active:scale-[0.95] text-left flex flex-col justify-between h-32"
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

            <div className="mt-auto pt-8 text-center pb-4">
              <p className="text-[10px] text-gray-400">
                © 2024 Gunsan Life. AI Real-time Update.<br />
                제공되는 정보는 AI가 검색한 결과로 실제와 다를 수 있습니다.
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


        <DailyBriefingModal
          isOpen={showBriefingModal}
          onClose={() => setShowBriefingModal(false)}
          content={briefing}
        />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
