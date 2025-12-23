import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { getRealtimeWeather } from '../services/geminiService';
import { DailyForecast } from '../types';

const getWeatherIcon = (condition: string, size: number = 24, className: string = '') => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('sunny') || cond.includes('clear') || cond.includes('맑음')) 
    return <Sun size={size} className={`text-orange-400 ${className}`} />;
  if (cond.includes('partly') || cond.includes('구름조금')) 
    return <CloudSun size={size} className={`text-yellow-400 ${className}`} />;
  if (cond.includes('cloud') || cond.includes('흐림')) 
    return <Cloud size={size} className={`text-gray-400 ${className}`} />;
  if (cond.includes('rain') || cond.includes('비')) 
    return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
  if (cond.includes('snow') || cond.includes('눈')) 
    return <CloudSnow size={size} className={`text-sky-300 ${className}`} />;
  
  return <Sun size={size} className={`text-orange-400 ${className}`} />;
};

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    const data = await getRealtimeWeather();
    if (data && data.current) {
      setWeather(data);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <RefreshCw size={32} className="animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">군산 실시간 날씨를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-gray-600 mb-4">날씨 정보를 가져오지 못했습니다.</p>
        <button 
          onClick={fetchWeather}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md active:scale-95 transition-transform"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { current, forecast } = weather;

  return (
    <div className="p-4 space-y-6 pb-20 animate-[fadeIn_0.4s_ease-out]">
      {/* Main Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-1.5">
                군산시
              </h2>
              <p className="text-blue-100 text-xs mt-1 font-medium bg-white/10 inline-block px-2 py-0.5 rounded-full">
                실시간 데이터 (Google Search)
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
              current.dustStatus?.includes('좋음') ? 'bg-green-500/20 border-green-400' : 
              current.dustStatus?.includes('나쁨') ? 'bg-red-500/20 border-red-400' : 'bg-yellow-500/20 border-yellow-400'
            }`}>
              미세먼지 {current.dustStatus}
            </div>
          </div>
          
          <div className="flex items-center mt-8">
            <div className="text-7xl font-bold tracking-tighter drop-shadow-md">{current.temp}°</div>
            <div className="ml-6 flex flex-col items-start">
               <span className="text-4xl drop-shadow-sm">{getWeatherIcon(current.condition, 40, "text-white")}</span>
               <span className="text-xl font-bold mt-2">{current.description}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-10 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">습도</span>
              <span className="font-bold text-white text-lg">{current.humidity}%</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">풍속</span>
              <span className="font-bold text-white text-lg">{current.windSpeed}m/s</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">상태</span>
              <span className="font-bold text-white text-base truncate w-full text-center px-1">{current.condition}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* 3-Day Forecast */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                <Info size={16} className="text-blue-500" /> 주간 예보
            </h3>
            <button onClick={fetchWeather} className="text-gray-400 hover:text-blue-500 transition-colors">
                <RefreshCw size={14} />
            </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {forecast.map((day: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <div className="w-16">
                <p className="font-bold text-gray-800">{day.day}</p>
                <p className="text-[10px] text-gray-400 font-medium">{day.date}</p>
              </div>
              
              <div className="flex items-center gap-3 flex-1 justify-center">
                {getWeatherIcon(day.condition, 24)}
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-600 leading-tight">{day.condition}</span>
                    <span className="text-[10px] font-bold text-blue-500">{day.rainProbability > 0 ? `강수 ${day.rainProbability}%` : ''}</span>
                </div>
              </div>
              
              <div className="flex gap-4 w-20 justify-end items-baseline">
                <span className="text-gray-400 text-xs font-medium">{day.low}°</span>
                <span className="font-bold text-gray-800 text-base">{day.high}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {weather.sourceUrl && (
          <div className="text-center">
              <a 
                href={weather.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-400 underline hover:text-blue-500"
              >
                  날씨 정보 출처 확인 (Google)
              </a>
          </div>
      )}
    </div>
  );
};

export default WeatherWidget;