import React, { useState, useEffect } from 'react';
import { NEWS_CATEGORIES, FALLBACK_NEWS_DATA, VIDEO_NEWS_DATA, KCN_YOUTUBE_URL, TODAY_GUNSAN_RSS_URL } from '../constants';
import { ExternalLink, RefreshCw, PlayCircle, Youtube, ChevronRight, Loader2, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  // Unified Tab State
  const [activeMainTab, setActiveMainTab] = useState<string>('LIVE');

  // Existing RSS/Sub-tab state
  const [activePlatform, setActivePlatform] = useState<'ALL' | 'TodayGunsan' | 'KCN'>('ALL');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRSS = async () => {
    setLoading(true);
    try {
      let rssUrl = '';
      // Use optimized internal proxy for fast loading
      if (activePlatform === 'ALL') {
        // Google News still needs CORS proxy or similar, but let's stick to AllOrigins for Google for now as it varies.
        // Or better, let's keep Google as is for safety, only optimize TodayGunsan as requested.
        rssUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent('군산')}&hl=ko&gl=KR&ceid=KR:ko`)}`;
      } else {
        // Direct Netlify/Vite Proxy (FAST)
        rssUrl = '/api/rss/todaygunsan';
      }

      const response = await fetch(rssUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      let xmlText = '';
      if (activePlatform === 'ALL') {
        // AllOrigins returns JSON
        const data = await response.json();
        xmlText = data.contents;
      } else {
        // Our proxy returns raw XML
        xmlText = await response.text();
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = xmlDoc.querySelectorAll('item');

      const parsedNews: NewsItem[] = Array.from(items).map((item, index) => {
        let title = item.querySelector('title')?.textContent || '제목 없음';
        const link = item.querySelector('link')?.textContent || '#';

        let author = 'Unknown';
        let displayDate = '최근';

        if (activePlatform === 'ALL') {
          const sourceElem = item.querySelector('source');
          author = sourceElem?.textContent || 'Google News';
          // Google News often puts source in title "Title - Source"
          const lastDashIndex = title.lastIndexOf(' - ');
          if (lastDashIndex !== -1) {
            author = title.substring(lastDashIndex + 3);
            title = title.substring(0, lastDashIndex);
          }
        } else {
          author = item.querySelector('author')?.textContent || '투데이군산';
        }

        const pubDateStr = item.querySelector('pubDate')?.textContent;
        const description = item.querySelector('description')?.textContent || '';

        if (pubDateStr) {
          const dateObj = new Date(pubDateStr);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            displayDate = `${year}-${month}-${day} ${hours}:${minutes}`;
          }
        }

        // Strip HTML from description and truncate
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        let textSummary = tempDiv.textContent || tempDiv.innerText || title;
        if (textSummary.length > 30) {
          textSummary = textSummary.substring(0, 30) + '...';
        }

        return {
          id: `rss-${index}`,
          title: title,
          category: '뉴스',
          source: author,
          platform: activePlatform === 'ALL' ? 'Google' : 'TodayGunsan',
          originalUrl: link,
          date: displayDate,
          summary: textSummary,
          content: ''
        };
      });

      setNewsItems(parsedNews);
    } catch (err) {
      console.error("RSS Fetch Error:", err);
      if (activePlatform === 'ALL') {
        setNewsItems(FALLBACK_NEWS_DATA);
      } else {
        setNewsItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'LIVE') {
      fetchRSS();
    }
  }, [activePlatform, activeMainTab]);

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const displayItems = activePlatform === 'KCN' ? VIDEO_NEWS_DATA : newsItems;

  const renderContent = () => {
    switch (activeMainTab) {
      case 'LIVE':
        return (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Sub-tabs for RSS & Refresh */}
            <div className="sticky top-14 z-20 bg-white px-2 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar flex-1">
                {(['ALL', 'TodayGunsan', 'KCN'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActivePlatform(p); }}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activePlatform === p ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {p === 'ALL' ? '전체' : p === 'TodayGunsan' ? '투데이군산' : '영상뉴스'}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchRSS}
                disabled={loading}
                className="px-3 py-3 text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 active:scale-95"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-blue-500" : ""} />
              </button>
            </div>

            <div className="divide-y divide-gray-100 min-h-[50vh]">
              {/* Special Banner for Video News Tab */}
              {activePlatform === 'KCN' && (
                <div className="p-4 bg-red-50/50">
                  <div
                    onClick={() => handleOpenExternal(KCN_YOUTUBE_URL)}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-red-100 cursor-pointer group active:scale-[0.98] transition-all"
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      <img
                        src="https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg"
                        className="w-full h-full object-cover opacity-80"
                        alt="KCN 뉴스"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Youtube size={32} className="text-white" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">OFFICIAL</span>
                        <h4 className="font-bold text-gray-900">KCN 금강방송 공식 채널</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        재생 오류를 방지하기 위해 공식 채널로 직접 연결해드립니다. 최신 군산 뉴스를 가장 빠르게 확인하세요.
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-red-700 transition-colors">
                        공식 유튜브에서 뉴스 보기 <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* News List */}
              {displayItems.map((news) => (
                <div
                  key={news.id}
                  onClick={() => handleOpenExternal(news.originalUrl || KCN_YOUTUBE_URL)}
                  className="p-4 active:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${activePlatform === 'KCN' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                          {news.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {news.date}
                        </span>
                        <span className="w-px h-2.5 bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          {activePlatform === 'KCN' ? '유튜브에서 보기' : '원문 보기'}
                          <ExternalLink size={10} />
                        </span>
                      </div>
                    </div>

                    {activePlatform === 'KCN' && (
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={news.imageUrl} className="w-full h-full object-cover" alt="썸네일" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <PlayCircle size={24} className="text-white/80" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && activePlatform !== 'KCN' && newsItems.length === 0 && (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                  <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
                  <p className="text-sm">뉴스를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        );

      default: // Press Categories
        const category = NEWS_CATEGORIES.find(c => c.name === activeMainTab);
        if (!category) return null;

        return (
          <div className="animate-[fadeIn_0.3s_ease-out] w-full min-h-[50vh] bg-white flex flex-col items-center">
            {/* Simple Clickable Image Layout */}
            <div
              onClick={() => handleOpenExternal(category.url)}
              className="w-full cursor-pointer hover:opacity-95 transition-opacity"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pb-20 bg-white min-h-screen flex flex-col">
      {/* Top Navigation Tabs */}
      <div className="bg-white px-2 sticky top-0 z-30 shadow-sm border-b border-gray-100 flex overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMainTab('LIVE')}
          className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeMainTab === 'LIVE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          실시간 뉴스
        </button>
        {NEWS_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveMainTab(cat.name)}
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeMainTab === cat.name ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50">
        {renderContent()}
      </div>
    </div>
  );
};

export default NewsFeed;
