import React from 'react';
import { Home, Newspaper, CloudSun, Phone, MessageCircle } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.HOME, label: '홈', icon: Home },
    { id: AppTab.NEWS, label: '뉴스', icon: Newspaper },
    { id: AppTab.WEATHER, label: '날씨', icon: CloudSun },
    { id: AppTab.INFO, label: '정보', icon: Phone },
    { id: AppTab.CHAT, label: 'AI 비서', icon: MessageCircle },
  ];

  return (
    <div className="bg-white border-t border-gray-200 fixed bottom-0 w-full h-16 flex justify-around items-center z-50 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;