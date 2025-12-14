import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const AiConcierge: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '안녕하세유! 군산 토박이 AI 비서구만유. 궁금한 거 있으면 뭐든지 물어보세유. \n\n"오늘 은파호수공원 날씨 어때?"\n"내일 쓰레기 수거일인가?"\n"수송동 근처 점심 맛집 추천해줘"',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session once
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(chatSessionRef.current, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationShare = () => {
    if (isLoading || isLocating) return;
    
    if (!navigator.geolocation) {
      alert("위치 공유를 지원하지 않는 브라우저입니다.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Add user message to UI
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: "📍 현재 위치를 공유합니다. 이 주변 정보를 알려주세요.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setIsLocating(false);

        try {
          // Send formatted prompt to Gemini with location context
          const responseText = await sendMessageToGemini(
            chatSessionRef.current,
            "사용자가 현재 위치(위도 " + latitude + ", 경도 " + longitude + ")를 공유했습니다. 이 위치를 기반으로 주변의 유용한 정보나 추천 장소를 간단히 요약해서 알려주세요.", 
            { lat: latitude, lng: longitude }
          );
          
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
        } catch (error) {
          console.error("Location share error:", error);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "위치 정보를 처리하는 중에 문제가 발생했어유. 잠시 후 다시 시도해 주세유.",
            timestamp: new Date()
          }]);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        alert("위치 정보를 가져오는데 실패했습니다. 위치 권한을 확인해주세요.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick prompt chips
  const chips = ["오늘 날씨", "맛집 추천", "가볼만한 곳", "버스 시간"];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-gray-50">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none shadow-md'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Render links if present */}
                 {msg.text.split('\n').map((line, i) => {
                    // Simple Markdown link parser for [Title](Url)
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        return (
                            <div key={i} className="mb-1">
                                <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                                   {linkMatch[1]}
                                </a>
                            </div>
                        )
                    }
                    return <div key={i}>{line}</div>
                 })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] flex-row gap-2">
               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100 mb-16">
         
         {/* Suggestion Chips */}
         <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            {chips.map(chip => (
                <button 
                    key={chip}
                    onClick={() => {
                        setInputText(chip); 
                    }}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                >
                    <Sparkles size={12} className="text-yellow-500"/>
                    {chip}
                </button>
            ))}
         </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handleLocationShare}
            disabled={isLoading || isLocating}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                isLocating ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            title="현재 위치 공유"
          >
             {isLocating ? (
                 <Loader2 size={18} className="text-blue-500 animate-spin" />
             ) : (
                 <MapPin size={18} className="text-gray-500" />
             )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="군산에 대해 물어보세요..."
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Send size={20} className={isLoading ? 'opacity-0' : 'ml-0.5'} /> 
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConcierge;