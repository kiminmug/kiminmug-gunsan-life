import React, { useState } from 'react';
import { Phone, Shield, Cross, PenTool, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { EMERGENCY_CONTACTS, LOCAL_TIPS } from '../constants';
import { EmergencyContact } from '../types';

const EmergencyContacts: React.FC = () => {
  // Initialize with all categories expanded by default for better visibility in emergencies
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
    switch(category) {
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

  return (
    <div className="p-4 pb-20">
      
      {/* Tips Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">💡 군산 생활 꿀팁</h2>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 shadow-sm">
           <p className="text-sm text-gray-700 font-medium">
             {LOCAL_TIPS[Math.floor(Math.random() * LOCAL_TIPS.length)]}
           </p>
        </div>
      </div>

      {/* Contacts List */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">🆘 긴급 전화번호</h2>
      <div className="space-y-4">
        {categories.map(cat => {
          const isExpanded = expandedCategories.includes(cat);
          return (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
              <button 
                onClick={() => toggleCategory(cat)}
                className="w-full bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                    {getIcon(cat)}
                    <span className="font-semibold text-sm text-gray-600">
                      {getCategoryLabel(cat)}
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              
              {isExpanded && (
                <div className="divide-y divide-gray-100 animate-[fadeIn_0.2s_ease-out]">
                  {EMERGENCY_CONTACTS.filter(c => c.category === cat).map((contact: EmergencyContact) => (
                    <div key={contact.name} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <span className="text-gray-800 font-medium text-sm">{contact.name}</span>
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
    </div>
  );
};

export default EmergencyContacts;