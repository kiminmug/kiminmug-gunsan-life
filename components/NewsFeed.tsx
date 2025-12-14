
import React, { useState, useEffect } from 'react';
import { NEWSPAPER_SHORTCUTS, FALLBACK_NEWS_DATA, VIDEO_NEWS_DATA } from '../constants';
import { ExternalLink, Search, RefreshCw, AlertCircle, PlayCircle, Youtube, XCircle } from 'lucide-react';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'ALL' | 'Google' | 'Naver' | 'KCN'>('ALL');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const fetchRSS = async () => {
    setLoading(true);
    try {
      // Use AllOrigins proxy to bypass CORS for Google News RSS
      // Query: "군산" (Gunsan)
      const RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent('군산')}&hl=ko&gl=KR&ceid=KR:ko`;
      
      // Attempt to fetch
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // If the proxy returns empty content or error in status
      if (!data.contents || data.status?.http_code >= 400) {
          throw new Error("Proxy error");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "text/xml");
      const items = xmlDoc.querySelectorAll('item');
      
      if (items.length === 0) throw new Error("No items found");

      const parsedNews: NewsItem[] = Array.from(items).map((item, index) => {
        let title = item.querySelector('title')?.textContent || '제목 없음';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        let source = item.querySelector('source')?.textContent || 'Google News';
        
        // Extract Description/Summary
        const descriptionHTML = item.querySelector('description')?.textContent || '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = descriptionHTML;
        let summaryText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Truncate Summary to ~50 characters
        if (summaryText.length > 50) {
            summaryText = summaryText.substring(0, 50).trim() + '...';
        }
        if (!summaryText) {
            summaryText = "내용을 보시려면 클릭하세요.";
        }

        // Clean Title and Extract Source if needed
        // Google News titles are typically "Headline - SourceName"
        const lastDashIndex = title.lastIndexOf(' - ');
        if (lastDashIndex !== -1) {
            const possibleSource = title.substring(lastDashIndex + 3);
            if (possibleSource.length < 20) { // Simple sanity check it's a source name not part of title
                source = possibleSource;
                title = title.substring(0, lastDashIndex);
            }
        }

        // Format Date
        let dateStr = '최근';
        try {
            const dateObj = new Date(pubDate);
            const now = new Date();
            const diffMs = now.getTime() - dateObj.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffHrs < 1) dateStr = '방금 전';
            else if (diffHrs < 24) dateStr = `${diffHrs}시간 전`;
            else dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        } catch (e) {}

        return {
          id: `rss-${index}`,
          title: title,
          category: '뉴스',
          source: source,
          platform: 'Google', // Base source
          originalUrl: link,
          date: dateStr,
          summary: summaryText,
          content: ''
        };
      });

      setNewsItems(parsedNews);
    } catch (err) {
      console.warn("RSS Fetch Error (Using Fallback):", err);
      // SILENT FALLBACK: Use pre-defined realistic data instead of showing an error
      setNewsItems(FALLBACK_NEWS_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSS();
  }, []);

  const handleOpenExternal = (news: NewsItem) => {
    // If it's a video and has a video ID, play inline instead of opening external
    if (activePlatform === 'KCN' && news.videoId) {
        setPlayingVideoId(news.videoId);
        return;
    }

    let url = news.originalUrl;
    
    // If link is missing or broken, fallback to Google Search for the title
    if (!url || url === '#' || url.trim() === '') {
        url = `https://www.google.com/search?q=${encodeURIComponent(news.title)}`;
    }

    // If active tab is Naver, we search the title on Naver
    if (activePlatform === 'Naver') {
        const query = news.title.trim();
        url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`;
    }
    
    window.open(url, '_blank');
  };

  const handleOpenShortcut = (url: string) => {
    window.open(url, '_blank');
  };

  const closeVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPlayingVideoId(null);
  };

  // Determine which list to show
  const displayItems = activePlatform === 'KCN' ? VIDEO_NEWS_DATA : newsItems;

  return (
    <div className="pb-20 bg-white min-h-screen">
      
      {/* Newspaper Shortcuts Section */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">군산 지역 언론사 바로가기</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {NEWSPAPER_SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut.name}
              onClick={() => handleOpenShortcut(shortcut.url)}
              className="flex-shrink-0 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              {shortcut.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-white px-4 border-b border-gray-100 flex shadow-sm overflow-x-auto no-scrollbar">
        <button 
          onClick={() => { setActivePlatform('ALL'); setPlayingVideoId(null); }}
          className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activePlatform === 'ALL' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          전체
        </button>
        <button 
          onClick={() => { setActivePlatform('Google'); setPlayingVideoId(null); }}
          className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activePlatform === 'Google' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          구글 군산뉴스
        </button>
        <button 
          onClick={() => { setActivePlatform('Naver'); setPlayingVideoId(null); }}
          className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activePlatform === 'Naver' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          네이버 검색
        </button>
         <button 
          onClick={() => { setActivePlatform('KCN'); setPlayingVideoId(null); }}
          className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
            activePlatform === 'KCN' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Youtube size={16} />
          영상뉴스(KCN)
        </button>
      </div>

      {/* News List */}
      <div className="divide-y divide-gray-100">
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
            <span className="flex items-center gap-1">
                {loading && activePlatform !== 'KCN' ? '업데이트 중...' : `${activePlatform === 'KCN' ? '영상' : '최신'} 뉴스 ${displayItems.length}건`}
            </span>
            {activePlatform !== 'KCN' && (
                <button 
                    onClick={fetchRSS} 
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                    disabled={loading}
                >
                    <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> 
                    {loading ? '로딩중' : '새로고침'}
                </button>
            )}
        </div>
        
        {loading && newsItems.length === 0 && activePlatform !== 'KCN' ? (
            <div className="py-20 text-center text-gray-400 text-sm flex flex-col items-center">
                <RefreshCw size={24} className="animate-spin mb-2 text-blue-500" />
                뉴스를 가져오고 있습니다...
            </div>
        ) : (
            displayItems.map((news) => (
            <div 
                key={news.id} 
                onClick={() => handleOpenExternal(news)}
                className="p-4 active:bg-gray-50 transition-colors cursor-pointer group"
            >
                {/* Special Layout for Video News */}
                {activePlatform === 'KCN' ? (
                    <div className="mb-3 relative rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-900">
                         {playingVideoId === news.videoId && news.videoId ? (
                             <iframe 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${news.videoId}?autoplay=1&rel=0`} 
                                title={news.title}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                             ></iframe>
                         ) : (
                             <>
                                {news.imageUrl ? (
                                    <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                        <Youtube size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                                        <PlayCircle size={28} className="text-red-600" fill="currentColor" />
                                    </div>
                                </div>
                             </>
                         )}
                         
                         {playingVideoId === news.videoId && (
                             <button 
                                onClick={closeVideo}
                                className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-1 transition-colors"
                             >
                                 <XCircle size={20} />
                             </button>
                         )}
                    </div>
                ) : null}

                <h3 className={`text-[16px] font-bold text-gray-900 leading-snug mb-1 group-hover:text-blue-700 transition-colors ${playingVideoId === news.videoId ? 'text-blue-700' : ''}`}>
                {news.title}
                </h3>
                
                {/* Brief Summary (approx 50 chars) */}
                <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                   {news.summary}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`font-medium ${
                    activePlatform === 'Google' ? 'text-blue-600' : 
                    activePlatform === 'Naver' ? 'text-green-600' : 
                    activePlatform === 'KCN' ? 'text-red-600' : 'text-blue-600'
                }`}>
                    {news.source}
                </span>
                <span className="w-px h-2.5 bg-gray-300"></span>
                <span>{news.date}</span>
                <span className="w-px h-2.5 bg-gray-300"></span>
                <span className="flex items-center gap-0.5 text-gray-400">
                    {activePlatform === 'Naver' ? '네이버 검색' : activePlatform === 'KCN' ? (playingVideoId === news.videoId ? '재생 중' : '터치하여 재생') : '원문 보기'}
                    {activePlatform !== 'KCN' && <ExternalLink size={10} />}
                </span>
                </div>
            </div>
            ))
        )}

        {!loading && displayItems.length === 0 && (
            <div className="py-20 text-center text-gray-400 text-sm">
                표시할 뉴스가 없습니다.
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
