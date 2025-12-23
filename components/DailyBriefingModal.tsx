
import React from 'react';
import { X, Bell } from 'lucide-react';

interface DailyBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative animate-[scaleIn_0.3s_ease-out]">

                {/* Header */}
                <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <span className="bg-white/20 p-1.5 rounded-lg">
                            <Bell size={18} className="text-white" />
                        </span>
                        <h2 className="text-lg font-bold">오늘의 군산 브리핑</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-sm prose-blue max-w-none">
                        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-[16px] font-normal not-italic">
                            {content}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                    >
                        확인했습니다
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefingModal;
