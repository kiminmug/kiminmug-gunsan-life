import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, RefreshCw, AlertCircle, Info, Waves } from 'lucide-react';
import { fetchKMAWeather, fetchTides } from '../services/weatherService';

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
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, tideRes] = await Promise.all([
        fetchKMAWeather(),
        fetchTides()
      ]);

      if (weatherRes && weatherRes.current) {
        setWeather(weatherRes);
      } else {
        setError(weatherRes?.error || "날씨 정보를 불러올 수 없습니다.");
      }

      if (tideRes && Array.isArray(tideRes)) {
        setTideData(tideRes);
      }
    } catch (e) {
      console.error("Data Fetch Error", e);
      setError("데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <RefreshCw size={32} className="animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">군산 실시간 날씨 & 물때 검색중...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-gray-900 font-bold mb-1">일시적 오류</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
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
                기상청 공공데이터 (실시간)
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${current.dustStatus?.includes('좋음') ? 'bg-green-500/20 border-green-400' :
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
          <button onClick={fetchData} className="text-gray-400 hover:text-blue-500 transition-colors">
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

      {/* Tide Info Section */}
      <div className="space-y-4">
        {tideData.length > 0 ? tideData.map((tideInfo: any, dayIdx: number) => (
          <div key={dayIdx} className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${dayIdx === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-white border border-gray-100'}`}>
            <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 relative z-10 ${dayIdx === 0 ? 'text-white' : 'text-gray-800'}`}>
              <Waves size={24} className={dayIdx === 0 ? 'text-white' : 'text-blue-500'} />
              {dayIdx === 0 ? '오늘 군산항 물때' : `${tideInfo.date} 물때표`}
            </h3>
            <p className={`text-sm mb-4 relative z-10 ${dayIdx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>
              {tideInfo.date}
            </p>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {tideInfo.tides.map((tide: any, idx: number) => (
                <div key={idx} className={`rounded-lg p-3 border ${dayIdx === 0 ? 'bg-white/10 backdrop-blur border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${tide.type === 'high' ? 'bg-red-400/80 text-white' : 'bg-blue-800/50 text-white'}`}>
                      {tide.type === 'high' ? '만조 (고)' : '간조 (저)'}
                    </span>
                  </div>
                  <div className={`text-xl font-bold tracking-wider ${dayIdx === 0 ? 'text-white' : 'text-gray-800'}`}>{tide.time}</div>
                  <div className={`text-xs mt-1 ${dayIdx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>물높이 {tide.height}cm</div>
                </div>
              ))}
            </div>
            {dayIdx === 0 && (
              <div className="mt-4 text-[10px] text-blue-200 text-center relative z-10">
                ※ 국립해양조사원 실시간 데이터
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400 text-sm">
            물때 정보를 불러오는 중입니다...
          </div>
        )}
      </div>

      {weather.sourceUrl && (
        <div className="text-center mt-8">
          <p className="text-[10px] text-gray-400">
            데이터 출처: 기상청 & 국립해양조사원 (API)
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;