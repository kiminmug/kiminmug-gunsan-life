
import React, { useState } from 'react';
import { X, Smartphone, Globe, MoreVertical, Share, Download, Monitor, MessageCircle } from 'lucide-react';

interface InstallGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'ANDROID' | 'IOS' | 'KAKAOTALK';
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose, defaultTab = 'ANDROID' }) => {
    const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS' | 'KAKAOTALK'>(defaultTab);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative animate-[slideUp_0.3s_ease-out] shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                        <Download size={20} className="text-blue-600" /> 앱 설치 / 홈 화면 추가
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('ANDROID')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'ANDROID' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        갤럭시/안드로이드
                    </button>
                    <button
                        onClick={() => setActiveTab('IOS')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'IOS' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        아이폰
                    </button>
                    <button
                        onClick={() => setActiveTab('KAKAOTALK')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'KAKAOTALK' ? 'border-yellow-400 text-yellow-700 bg-yellow-50' : 'border-transparent text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        카카오톡
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'ANDROID' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700">
                                삼성 인터넷 또는 크롬(Chrome) 브라우저 기준입니다.
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <MoreVertical size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">1. 메뉴 버튼 누르기</h4>
                                    <p className="text-sm text-gray-600">화면 오른쪽 하단(삼성인터넷) 또는 상단(크롬)의 <span className="font-bold">메뉴(점 3개/줄 3개)</span> 버튼을 눌러주세요.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <Monitor size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">2. 현재 페이지 추가 / 앱 설치</h4>
                                    <p className="text-sm text-gray-600">메뉴에서 <span className="font-bold text-blue-600">'현재 페이지 추가'</span> → <span className="font-bold text-blue-600">'홈 화면'</span> 또는 <span className="font-bold text-blue-600">'앱 설치'</span>를 선택하세요.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'IOS' && (
                        <div className="space-y-6">
                            <div className="bg-gray-100 p-4 rounded-xl text-sm text-gray-700 border border-gray-200">
                                사파리(Safari) 브라우저에서만 가능합니다.
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <Share size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">1. 공유 버튼 누르기</h4>
                                    <p className="text-sm text-gray-600">화면 하단 중앙의 <span className="font-bold">공유 아이콘</span>을 눌러주세요.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <span className="font-bold text-lg px-1 text-gray-700">+</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">2. 홈 화면에 추가</h4>
                                    <p className="text-sm text-gray-600">메뉴를 위로 올려 <span className="font-bold text-blue-600">'홈 화면에 추가'</span>를 찾아 선택하세요.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'KAKAOTALK' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-yellow-800 font-medium">
                                ⚠️ 카카오톡 내부에서는 설치가 제한될 수 있습니다. 다른 브라우저로 열어야 합니다.
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <MoreVertical size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">1. 메뉴 버튼 누르기</h4>
                                    <p className="text-sm text-gray-600">화면 우측 하단(또는 상단)의 <span className="font-bold">점 3개(···)</span> 버튼을 눌러주세요.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                                    <Globe size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">2. 다른 브라우저로 열기</h4>
                                    <p className="text-sm text-gray-600"><span className="font-bold text-gray-800 text-base">'다른 브라우저로 열기'</span>를 선택하면 설치가 가능한 크롬/사파리로 이동합니다.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
                        확인했습니다
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallGuideModal;
