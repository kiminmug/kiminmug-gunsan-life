import React from 'react';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack }) => {
  const handleShare = async () => {
    // Construct a hypothetical URL based on the news ID
    const shareUrl = `https://m.gunsannews.net/news/articleView.html?idxno=${news.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.debug('Share cancelled or failed:', error);
      }
    } else {
      // Fallback for browsers that don't support native share
      try {
        await navigator.clipboard.writeText(`${news.title}\n${shareUrl}`);
        alert('기사 링크가 클립보드에 복사되었습니다.');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="bg-white min-h-full pb-20 animate-[slideInRight_0.2s_ease-out]">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="공유하기"
            >
                 <Share2 size={20} className="text-gray-700" />
            </button>
        </div>
      </div>

      <div className="p-4">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
          {news.category}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
          {news.title}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
             <Calendar size={14} />
             <span>{news.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <Tag size={14} />
             <span>군산뉴스</span>
          </div>
        </div>

        {news.imageUrl && (
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm"
          />
        )}

        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
          {news.content || news.summary}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;