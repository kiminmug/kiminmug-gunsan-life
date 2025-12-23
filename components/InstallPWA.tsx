
import React, { useState, useEffect } from 'react';
import { Download, HelpCircle, ExternalLink } from 'lucide-react';
import InstallGuideModal from './InstallGuideModal';

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const [activeGuideTab, setActiveGuideTab] = useState<'ANDROID' | 'IOS' | 'KAKAOTALK'>('ANDROID');

    useEffect(() => {
        // 1. Check if already installed
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // 2. Capture install prompt event (Android/Chrome)
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // 3. Detect In-App Browser (Kakao, Naver, etc.)
        const userAgent = navigator.userAgent.toLowerCase();
        const isKakao = userAgent.includes('kakaotalk');
        const isInApp = isKakao || userAgent.includes('naver') || userAgent.includes('instagram') || userAgent.includes('line');

        setIsInAppBrowser(isInApp);
        if (isKakao) setActiveGuideTab('KAKAOTALK');
        else if (/iphone|ipad|ipod/.test(userAgent)) setActiveGuideTab('IOS');
        else setActiveGuideTab('ANDROID');

        // 4. Auto-redirect attempt for Android KakaoTalk to Chrome
        if (isKakao && /android/i.test(userAgent)) {
            // This intent trick tries to open the current URL in an external browser (Chrome)
            // Not always guaranteed but worth a shot. 
            // We won't auto-trigger to avoid being annoying, but we will use it on button click.
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleMainButtonClick = async () => {
        if (isInAppBrowser) {
            // Attempt to break out of in-app browser on Android
            const userAgent = navigator.userAgent.toLowerCase();
            if (/android/i.test(userAgent)) {
                const currentUrl = window.location.href.replace(/^https?:\/\//, '');
                // Intent scheme to open in Chrome
                window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
            } else {
                setShowGuide(true);
            }
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            setShowGuide(true);
        }
    };

    if (isStandalone) return null;

    return (
        <>
            <div className="flex gap-2 mt-6">
                <button
                    onClick={handleMainButtonClick}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all
            ${isInAppBrowser ? 'bg-yellow-400 text-yellow-900 border border-yellow-500' : 'bg-gray-900 text-white'}
          `}
                >
                    {isInAppBrowser ? <ExternalLink size={20} /> : <Download size={20} />}
                    {isInAppBrowser ? '다른 브라우저로 열기' : '앱 설치하기 / 홈 화면 추가'}
                </button>

                <button
                    onClick={() => setShowGuide(true)}
                    className="flex items-center justify-center bg-gray-100 text-gray-600 p-3 rounded-xl hover:bg-gray-200 transition-colors"
                    aria-label="설치 방법 보기"
                >
                    <HelpCircle size={24} />
                </button>
            </div>

            <InstallGuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                defaultTab={activeGuideTab}
            />
        </>
    );
};

export default InstallPWA;
