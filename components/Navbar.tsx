import React from 'react';
import { Bell } from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  unreadCount: number;
  onToggleNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, unreadCount, onToggleNotifications }) => {
  const getTitle = () => {
    switch (activeTab) {
      case AppTab.HOME: return '군산 Life';
      case AppTab.NEWS: {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        return `${month}월 ${day}일 오늘의 군산뉴스`;
      }
      case AppTab.WEATHER: return '군산 날씨';
      case AppTab.INFO: return '생활 정보';
      case AppTab.CHAT: return '군산 AI 비서';
      default: return '군산 라이프';
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50 h-14 flex items-center justify-between px-4">
      {/* Placeholder for left side balance */}
      <div className="w-8"></div>

      <h1 className="text-lg font-bold text-gray-800 tracking-tight truncate max-w-[70%]">
        {getTitle()}
      </h1>

      <button
        onClick={onToggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>
    </div>
  );
};

export default Navbar;