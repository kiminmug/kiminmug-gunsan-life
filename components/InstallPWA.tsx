
import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        // Check if already installed/standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // Capture install prompt event
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            setShowIOSInstructions(true);
        } else {
            // Fallback for desktop/other browsers not supporting the event directly or already installed logic
            alert("브라우저 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택해주세요.");
        }
    };

    if (isStandalone) return null; // Don't show if already installed

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all mt-6"
            >
                <Download size={20} />
                {isIOS ? '앱 다운로드 (iPhone)' : '앱 설치하기 / 홈 화면 추가'}
            </button>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden relative animate-[slideUp_0.3s_ease-out]">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Smartphone size={20} className="text-blue-600" /> iPhone 설치 방법
                            </h3>
                            <button onClick={() => setShowIOSInstructions(false)} className="p-1 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm">아이폰은 다음 방법으로 홈 화면에 추가할 수 있습니다.</p>

                            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-xl">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Share size={24} className="text-blue-600" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold block text-gray-800">1. 공유 버튼 터치</span>
                                    <span className="text-gray-500">브라우저 하단의 공유 아이콘을 눌러주세요.</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-xl">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <PlusSquare size={24} className="text-blue-600" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold block text-gray-800">2. 홈 화면에 추가</span>
                                    <span className="text-gray-500">메뉴 목록에서 '홈 화면에 추가'를 선택하세요.</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-center">
                            <button onClick={() => setShowIOSInstructions(false)} className="text-blue-600 font-bold text-sm">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallPWA;
