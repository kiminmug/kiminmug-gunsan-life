import React, { useState } from 'react';
import { Phone, Shield, Cross, PenTool, AlertCircle, ChevronDown, ChevronUp, Anchor, Calendar as CalendarIcon, MapPin, Waves } from 'lucide-react';
import { EMERGENCY_CONTACTS, LOCAL_TIPS, MOCK_EVENTS } from '../constants';
import { EmergencyContact } from '../types';

const LifeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PHONES' | 'EVENTS'>('PHONES');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Array.from(new Set(EMERGENCY_CONTACTS.map(c => c.category)))
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Safety': return <Shield size={18} className="text-red-500" />;
      case 'Medical': return <Cross size={18} className="text-green-500" />;
      case 'Utility': return <PenTool size={18} className="text-orange-500" />;
      default: return <AlertCircle size={18} className="text-blue-500" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    return cat === 'Admin' ? '행정/민원' : cat === 'Medical' ? '병원/약국' : cat === 'Safety' ? '안전/치안' : '생활 불편';
  };

  const categories = Array.from(new Set(EMERGENCY_CONTACTS.map(c => c.category)));
  const todayTide = MOCK_TIDES[0];

  return (
    <div className="pb-20 bg-gray-50 min-h-full flex flex-col">
      {/* Top Segmented Control */}
      <div className="bg-white p-2 sticky top-14 z-20 shadow-sm flex gap-1">
        <button 
          onClick={() => setActiveTab('PHONES')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors flex flex-col items-center gap-1 ${activeTab === 'PHONES' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Phone size={18} />
          긴급전화
        </button>
          onClick={() => setActiveTab('EVENTS')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors flex flex-col items-center gap-1 ${activeTab === 'EVENTS' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <CalendarIcon size={18} />
          행사/축제
        </button>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'PHONES' && (
          <div className="animate-[fadeIn_0.2s_ease-out] space-y-4">
             {/* Tips Section */}
            <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">💡 군산 생활 꿀팁</h3>
                <p className="text-sm text-gray-700 font-medium leading-snug">
                    {LOCAL_TIPS[Math.floor(Math.random() * LOCAL_TIPS.length)]}
                </p>
                </div>
            </div>

            {categories.map(cat => {
            const isExpanded = expandedCategories.includes(cat);
            return (
                <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
                <button 
                    onClick={() => toggleCategory(cat)}
                    className="w-full bg-white px-4 py-3 border-b border-gray-50 flex items-center justify-between active:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {getIcon(cat)}
                        <span className="font-semibold text-sm text-gray-800">
                        {getCategoryLabel(cat)}
                        </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {isExpanded && (
                    <div className="divide-y divide-gray-50 animate-[fadeIn_0.2s_ease-out]">
                    {EMERGENCY_CONTACTS.filter(c => c.category === cat).map((contact: EmergencyContact) => (
                        <div key={contact.name} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700 font-medium text-sm">{contact.name}</span>
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-100 transition-colors border border-green-100">
                            <Phone size={12} />
                            {contact.phone}
                        </a>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            );
            })}
          </div>
        )}



        {activeTab === 'EVENTS' && (
          <div className="animate-[fadeIn_0.2s_ease-out] space-y-4">
            {MOCK_EVENTS.map(event => (
                <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            event.type === 'Festival' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                            {event.type === 'Festival' ? '축제' : '문화행사'}
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            D-Day
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    
                    <div className="mt-2 pt-3 border-t border-gray-50 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarIcon size={14} className="text-gray-400" />
                            {event.dateRange}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} className="text-gray-400" />
                            {event.location}
                        </div>
                    </div>
                </div>
            ))}
            <button className="w-full py-3 text-sm text-gray-500 font-medium bg-gray-100 rounded-xl">
                더 많은 행사 보기
            </button>
          </div>
        )}
      </div>
    </div >
  );
};

export default LifeHub;