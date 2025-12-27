import React, { useState, useEffect } from 'react';
import { NEWS_CATEGORIES, FALLBACK_NEWS_DATA, VIDEO_NEWS_DATA, KCN_YOUTUBE_URL, TODAY_GUNSAN_RSS_URL } from '../constants';
import { ExternalLink, RefreshCw, PlayCircle, Youtube, ChevronRight, Loader2, Calendar, Clock, AlertCircle, Info, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { NewsItem } from '../types';
import { generateDailyBriefing } from '../utils/generateBriefing';

const DailyBriefingRenderer: React.FC<{ content: string }> = ({ content }) => {
  return <ReactMarkdown>{content}</ReactMarkdown>;
};

const NewsFeed: React.FC = () => {
  // Unified Tab State
  const [activeMainTab, setActiveMainTab] = useState<string>('LIVE');

  // Briefing State
  const [briefingContent, setBriefingContent] = useState('');

  // Existing RSS/Sub-tab state
  // Added 'BRIEFING' to the start of the union type
  const [activePlatform, setActivePlatform] = useState<'BRIEFING' | 'ALL' | 'TodayGunsan' | 'KCN'>('BRIEFING');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to parse XML and update state
  const parseXmlAndSetState = (xmlText: string) => {
    try {
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

        // Image Extraction Logic
        let imageUrl: string | undefined = undefined;

        // 1. Check enclosure
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
          imageUrl = enclosure.getAttribute('url') || undefined;
        }

        // 2. Check media:content (Google News often uses this)
        if (!imageUrl) {
          const mediaContent = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
          if (mediaContent) {
            imageUrl = mediaContent.getAttribute('url') || undefined;
          }
        }

        // 3. Check for <img> in description or content:encoded
        if (!imageUrl) {
          // Check content:encoded if description doesn't have it
          const contentEncoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent;
          const targetHtml = (description + (contentEncoded || ''));

          // Regex to capture src with single or double quotes
          const imgMatch = targetHtml.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }

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

        // Strip HTML from description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        let textSummary = tempDiv.textContent || tempDiv.innerText || title;
        if (textSummary.length > 50) {
          textSummary = textSummary.substring(0, 50) + '...';
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
          imageUrl: imageUrl, // Add image url
          content: ''
        };
      });

      setNewsItems(parsedNews);
    } catch (e) {
      console.error("XML Parse Error:", e);
      setNewsItems([]);
    }
  };

  const fetchRSS = async () => {
    setLoading(true);
    setErrorMsg(null);
    setNewsItems([]);

    const encodedUrl = encodeURIComponent(TODAY_GUNSAN_RSS_URL);
    let targetUrl = '';

    if (activePlatform === 'TodayGunsan') {
      targetUrl = `/.netlify/functions/getNews?url=${encodedUrl}`;
    } else {
      const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent('군산')}&hl=ko&gl=KR&ceid=KR:ko`;
      targetUrl = `/.netlify/functions/getNews?url=${encodeURIComponent(googleUrl)}`;
    }

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const xmlText = await response.text();
      parseXmlAndSetState(xmlText);
    } catch (err) {
      console.warn("Fetch failed:", err);
      // Fallback
      if (activePlatform === 'TodayGunsan') {
        // Last resort fallback
        const fallbackWithLabel = FALLBACK_NEWS_DATA.map(item => ({
          ...item,
          source: activePlatform === 'TodayGunsan' ? '투데이군산(저장됨)' : item.source
        }));
        setNewsItems(fallbackWithLabel);
      }
      setErrorMsg("뉴스를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBriefing = async () => {
    if (!briefingContent || briefingContent === 'Wait') {
      setBriefingContent('Wait... 오늘의 뉴스와 데이터를 수집하고 있습니다.\n\n잠시만 기다려주세요...');
      try {
        const content = await generateDailyBriefing();
        setBriefingContent(content);
      } catch (e) {
        setBriefingContent('### 오류 발생\n데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  useEffect(() => {
    if (activeMainTab === 'LIVE') {
      if (activePlatform === 'BRIEFING') {
        // Auto-load briefing if empty
        if (!briefingContent) {
          handleOpenBriefing();
        }
      } else {
        fetchRSS();
      }
    }
  }, [activePlatform, activeMainTab]);

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const displayItems = newsItems;

  const renderContent = () => {
    switch (activeMainTab) {
      case 'LIVE':
        return (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Sub-tabs for RSS & Refresh */}
            <div className="sticky top-14 z-20 bg-white px-2 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar flex-1">
                {(['BRIEFING', 'ALL', 'TodayGunsan'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActivePlatform(p); }}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activePlatform === p ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {p === 'BRIEFING' ? '오늘 주요 브리핑' : p === 'ALL' ? '전체' : '투데이군산'}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              {activePlatform !== 'BRIEFING' && (
                <div className="pr-2">
                  <button
                    onClick={fetchRSS}
                    disabled={loading}
                    className="p-3 text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw size={18} className={loading ? "animate-spin text-blue-500" : ""} />
                  </button>
                </div>
              )}
              {activePlatform === 'BRIEFING' && (
                <div className="pr-2">
                  <button
                    onClick={handleOpenBriefing}
                    className="p-3 text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-gray-100 min-h-[50vh]">

              {/* Briefing Content View */}
              {activePlatform === 'BRIEFING' && (
                <div className="p-6 bg-white min-h-[60vh]">
                  {briefingContent && !briefingContent.startsWith('Wait') ? (
                    <div className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed font-medium">
                      <DailyBriefingRenderer content={briefingContent} />
                    </div>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center animate-pulse">
                      <Loader2 size={48} className="animate-spin text-blue-600 mb-6" />
                      <p className="text-gray-700 text-xl font-bold mb-2">오늘의 주요 브리핑 생성 중...</p>
                      <p className="text-gray-500 text-sm">실시간 데이터와 뉴스를 분석하고 있습니다.<br />(약 5~10초 정도 소요됩니다)</p>
                    </div>
                  )}
                </div>
              )}

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
              {activePlatform !== 'BRIEFING' && displayItems.map((news) => (
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
                      </div>
                    </div>

                    {/* Image Logic */}
                    {(news.imageUrl || activePlatform === 'KCN') && (
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                        {news.imageUrl ? (
                          <img src={news.imageUrl} className="w-full h-full object-cover" alt="썸네일" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (activePlatform === 'KCN' &&
                          <>
                            <img src={news.imageUrl} className="w-full h-full object-cover" alt="썸네일" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <PlayCircle size={24} className="text-white/80" />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && activePlatform !== 'KCN' && activePlatform !== 'BRIEFING' && newsItems.length === 0 && (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                  <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
                  <p className="text-sm">뉴스를 불러오는 중...</p>
                </div>
              )}

              {!loading && activePlatform !== 'KCN' && activePlatform !== 'BRIEFING' && newsItems.length === 0 && (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center animate-[fadeIn_0.5s]">
                  <RefreshCw size={32} className="mb-2 text-gray-300" />
                  <p className="text-sm font-bold mb-1">뉴스를 불러올 수 없습니다.</p>
                  <p className="text-xs text-red-400 mb-4">{errorMsg || "연결 상태를 확인해주세요."}</p>
                  <button
                    onClick={fetchRSS}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        const category = NEWS_CATEGORIES.find(c => c.name === activeMainTab);
        if (!category) return null;

        // Special Layout for '군산언론'
        if (category.name === '군산언론') {
          return (
            <div className="animate-[fadeIn_0.3s_ease-out] w-full min-h-[50vh] bg-white p-4">

              {/* 1. Designed Description Box (Premium UI) */}
              <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertCircle size={64} className="text-blue-600" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white p-2 rounded-full shadow-sm mb-3 border-2 border-blue-100">
                    <Info size={24} className="text-blue-600" />
                  </div>

                  <p className="text-gray-800 leading-relaxed font-bold text-lg break-keep mb-2">
                    각 언론사의 <span className="text-blue-600">군산 뉴스</span>를<br />
                    빠르고 정확하게 전달합니다
                  </p>

                  <div className="w-12 h-[2px] bg-blue-100 mx-auto my-3"></div>

                  <p className="text-slate-500 text-sm font-medium leading-snug">
                    <span className="block mb-1">저작권 보호를 위해</span>
                    언론사 홈페이지로 <span className="text-slate-700 font-bold">직접 연결</span>됩니다.
                  </p>
                </div>
              </div>

              {/* 2. Stylish Section Title */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="h-1 w-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">군산 언론사 (링크)</h2>
                <div className="h-1 w-6 bg-blue-600 rounded-full"></div>
              </div>

              {/* 3. Link Grid (Larger Text) */}
              {category.subLinks && (
                <div className="grid grid-cols-2 gap-4">
                  {category.subLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenExternal(link.url)}
                      className="flex flex-col items-center justify-center py-5 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 text-lg group-hover:text-blue-700 transition-colors">
                          {link.name}
                        </span>
                        <ExternalLink size={18} className="text-gray-300 group-hover:text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }


        // Special Layout for '영상뉴스'
        if (category.name === '영상뉴스') {
          return (
            <div className="animate-[fadeIn_0.3s_ease-out] w-full min-h-[50vh] bg-gray-50">
              {/* Special Banner for Video News */}
              <div className="p-4 bg-red-50/50 sticky top-14 z-10">
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

              <div className="divide-y divide-gray-100">
                {VIDEO_NEWS_DATA.map((news) => (
                  <div
                    key={news.id}
                    onClick={() => handleOpenExternal(news.originalUrl || KCN_YOUTUBE_URL)}
                    className="p-4 active:bg-gray-50 transition-colors cursor-pointer group bg-white"
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
                          <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">
                            {news.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {news.date}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                        <img src={news.imageUrl} className="w-full h-full object-cover" alt="썸네일" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <PlayCircle size={24} className="text-white/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Special Layout for '전북' or '중앙' (Preparing)
        if (category.name === '전북' || category.name === '중앙') {
          return (
            <div className="animate-[fadeIn_0.3s_ease-out] w-full min-h-[50vh] bg-white flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <div className="relative">
                  <Info size={40} className="text-blue-400" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                서비스 준비중입니다
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                <span className="font-bold text-gray-700">{category.name}</span> 채널은 현재 준비 단계입니다.<br />
                더 알찬 소식으로 곧 찾아뵙겠습니다.
              </p>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">
                문의: gunsanlife@email.com
              </div>
            </div>
          );
        }

        // Default Layout for other categories (Image only)
        return (
          <div className="animate-[fadeIn_0.3s_ease-out] w-full min-h-[50vh] bg-white flex flex-col items-center">
            <div
              onClick={() => category.url && handleOpenExternal(category.url)}
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
          className={`flex-shrink-0 px-3 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeMainTab === 'LIVE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          실시간뉴스
        </button>
        {NEWS_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveMainTab(cat.name)}
            className={`flex-shrink-0 px-3 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeMainTab === cat.name ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
