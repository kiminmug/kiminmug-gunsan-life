import React, { useState, useEffect } from 'react';
import { Phone, Shield, Cross, PenTool, AlertCircle, ChevronDown, ChevronUp, Calendar as CalendarIcon, MapPin, Loader2 } from 'lucide-react';
import { EMERGENCY_CONTACTS, LOCAL_TIPS, MOCK_EVENTS } from '../constants';
import { EmergencyContact, LocalEvent } from '../types';
import { fetchSheetEvents } from '../services/sheetService';

const LifeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PHONES' | 'EVENTS'>('PHONES');

  // Phone Directory States
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Array.from(new Set(EMERGENCY_CONTACTS.map(c => c.category)))
  );

  // Event Schedule States
  const [activeEventTab, setActiveEventTab] = useState<'ALL' | 'PERFORMANCE' | 'EXHIBITION' | 'GENERAL'>('ALL');
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (activeTab === 'EVENTS') {
      loadEvents();
    }
  }, [activeTab]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    const sheetData = await fetchSheetEvents();
    if (sheetData.length > 0) {
      setEvents(sheetData);
    } else {
      setEvents(MOCK_EVENTS); // Fallback to mock if sheet fails
    }
    setLoadingEvents(false);
  };

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

  // Filter Events Logic
  const filteredEvents = events.filter(e => {
    if (activeEventTab === 'ALL') return true;
    if (activeEventTab === 'PERFORMANCE') return e.type === 'Festival'; // Using Festival type for Performance
    if (activeEventTab === 'EXHIBITION') return e.type === 'Culture';
    if (activeEventTab === 'GENERAL') return e.type === 'Notice';
    return true;
  });

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
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors flex flex-col items-center gap-1 ${activeTab === 'EVENTS' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <CalendarIcon size={18} />
          행사/축제
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'PHONES' && (
          <div className="p-4 animate-[fadeIn_0.2s_ease-out] space-y-4">
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
          <div className="animate-[fadeIn_0.2s_ease-out] min-h-screen bg-gray-50">
            {/* 1. Event Category Filter Tabs */}
            <div className="sticky top-[116px] z-10 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar flex px-4">
              <button onClick={() => setActiveEventTab('ALL')} className={`flex-shrink-0 py-3.5 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeEventTab === 'ALL' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>전체보기</button>
              <button onClick={() => setActiveEventTab('PERFORMANCE')} className={`flex-shrink-0 py-3.5 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeEventTab === 'PERFORMANCE' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>공연/영화</button>
              <button onClick={() => setActiveEventTab('EXHIBITION')} className={`flex-shrink-0 py-3.5 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeEventTab === 'EXHIBITION' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>전시회</button>
              <button onClick={() => setActiveEventTab('GENERAL')} className={`flex-shrink-0 py-3.5 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeEventTab === 'GENERAL' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>일반행사</button>
            </div>

            {/* 2. Content List */}
            <div className="px-4 pb-4 pt-8 space-y-3">
              {loadingEvents && (
                <div className="flex justify-center py-10 text-gray-400">
                  <div className="flex flex-col items-center">
                    <Loader2 size={24} className="animate-spin text-orange-500 mb-2" />
                    <span className="text-xs">행사 정보를 불러오는 중...</span>
                  </div>
                </div>
              )}

              {!loadingEvents && filteredEvents.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  예정된 행사가 없습니다.
                </div>
              )}

              {!loadingEvents && filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4 hover:shadow-md transition-shadow">
                  {/* Left: Date */}
                  <div className="flex-shrink-0 w-14 flex flex-col items-center pt-1">
                    <span className="text-xl font-extrabold text-gray-800 leading-none">
                      {event.dateRange.substring(0, 5)}
                    </span>
                    <span className="text-xs font-bold text-gray-400 mt-1">
                      {event.dateRange.includes('(') ? event.dateRange.split('(')[1].split(')')[0] : ''}요일
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-[1px] bg-gray-100 my-1"></div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${event.type === 'Festival' ? 'bg-purple-50 text-purple-600' :
                        event.type === 'Culture' ? 'bg-blue-50 text-blue-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                        {event.type === 'Festival' ? '공연/영화' : event.type === 'Culture' ? '전시회' : '일반행사'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 truncate break-keep">
                      {event.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {event.description}
                    </p>

                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      {event.contact && (
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                          <Phone size={12} className="flex-shrink-0" />
                          <span>{event.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default LifeHub;