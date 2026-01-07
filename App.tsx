
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
import { Sun, Anchor, Newspaper, MessageCircle, Bell, Loader2, CheckCircle2, Share2 } from 'lucide-react';
import InstallPWA from './components/InstallPWA';

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

    // Trigger System Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: newNotif.id // Prevent duplicate notifications
        });
      } catch (e) {
        console.error("Notification trigger failed", e);
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '군산 Life',
          text: '군산시민을 위한 필수 앱! 각종정보, 뉴스 날씨 등 한번에 확인하세요',
          url: 'https://gunsannews.net',
        });
      } else {
        await navigator.clipboard.writeText('https://gunsannews.net');
        alert("주소가 복사되었습니다! 친구에게 붙여넣기로 공유해보세요.");
      }
    } catch (error) {
      console.log('Share canceled');
    }
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
          <div className="relative min-h-[90vh]">
            {/* Gradient Background Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 px-5 pt-6 pb-20 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-10 left-5 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Hero Section */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-white/90 text-xs font-semibold tracking-wide">LIVE UPDATE</span>
                    </div>
                    <h1 className="text-3xl font-black text-white leading-tight mb-1">
                      안녕하세요,<br />
                      <span className="text-yellow-300">군산시민</span> 여러분 👋
                    </h1>
                    <p className="text-blue-100 text-sm font-medium">
                      오늘도 함께 만들어가요
                    </p>
                  </div>
                  <button
                    onClick={handleShare}
                    className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all active:scale-95 shadow-lg border border-white/30"
                    aria-label="친구에게 공유하기"
                  >
                    <Share2 size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Daily Briefing Card - Floating Style */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full -mr-10 -mt-10 opacity-30 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg">
                        <Bell size={16} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h2 className="font-extrabold text-gray-800 text-base">오늘의 브리핑</h2>
                      <button
                        onClick={() => setShowBriefingModal(true)}
                        className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
                      >
                        전체보기
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium whitespace-pre-line line-clamp-2">
                      {briefing}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Overlapping Cards */}
            <div className="px-5 -mt-12 pb-24 space-y-5">
              {/* Quick Access Title */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-extrabold text-gray-800">빠른 메뉴</h3>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
                </div>
              </div>

              {/* Navigation Grid - Enhanced Cards */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab(AppTab.NEWS)}
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] text-left flex flex-col justify-between h-40 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg">
                      <Newspaper size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="block font-black text-white text-xl mb-1">오늘의 뉴스</span>
                      <span className="text-xs text-blue-100 font-semibold">실시간 지역 소식</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab(AppTab.WEATHER)}
                  className="group bg-gradient-to-br from-orange-400 to-orange-500 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] text-left flex flex-col justify-between h-40 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg">
                      <Sun size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="block font-black text-white text-xl mb-1">날씨 & 물때</span>
                      <span className="text-xs text-orange-100 font-semibold">실시간 기상정보</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab(AppTab.INFO)}
                  className="group bg-gradient-to-br from-cyan-500 to-teal-500 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] text-left flex flex-col justify-between h-40 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg">
                      <Anchor size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="block font-black text-white text-xl mb-1">생활정보</span>
                      <span className="text-xs text-cyan-100 font-semibold">긴급전화 & 꿀팁</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab(AppTab.CHAT)}
                  className="group bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] text-left flex flex-col justify-between h-40 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg">
                      <MessageCircle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="block font-black text-white text-xl mb-1">AI 비서</span>
                      <span className="text-xs text-purple-100 font-semibold">궁금한 건 물어보세요</span>
                    </div>
                  </div>
                </button>
              </div>

              <InstallPWA />

              {/* Footer */}
              <div className="pt-6 text-center">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  © 2025 Gunsan Life · AI 기반 실시간 정보 서비스<br />
                  <span className="text-[9px]">제공되는 정보는 AI 분석 결과로 실제와 다를 수 있습니다</span>
                </p>
              </div>
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
