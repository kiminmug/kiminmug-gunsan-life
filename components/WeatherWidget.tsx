import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun } from 'lucide-react';
import { MOCK_FORECAST } from '../constants';
import { DailyForecast } from '../types';

const getWeatherIcon = (condition: string, size: number = 24, className: string = '') => {
  switch (condition) {
    case 'Sunny': return <Sun size={size} className={`text-orange-500 ${className}`} />;
    case 'Cloudy': return <Cloud size={size} className={`text-gray-500 ${className}`} />;
    case 'Rainy': return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
    case 'Snowy': return <CloudSnow size={size} className={`text-sky-300 ${className}`} />;
    case 'PartlyCloudy': return <CloudSun size={size} className={`text-yellow-500 ${className}`} />;
    default: return <Sun size={size} className={`text-orange-500 ${className}`} />;
  }
};

const WeatherWidget: React.FC = () => {
  const today = MOCK_FORECAST[0];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Main Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">군산시 수송동</h2>
              <p className="text-blue-100 text-sm mt-1">현재 날씨</p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              미세먼지 좋음
            </div>
          </div>
          
          <div className="flex items-center mt-6">
            <div className="text-6xl font-bold tracking-tighter">{today.high}°</div>
            <div className="ml-6 flex flex-col">
               <span className="text-3xl">{getWeatherIcon(today.condition, 32, "text-white")}</span>
               <span className="text-lg font-medium mt-1">맑음</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-8 text-blue-100 text-sm">
            <div className="flex flex-col items-center">
              <span>습도</span>
              <span className="font-semibold text-white">45%</span>
            </div>
            <div className="flex flex-col items-center">
              <span>풍속</span>
              <span className="font-semibold text-white">3m/s</span>
            </div>
            <div className="flex flex-col items-center">
              <span>강수확률</span>
              <span className="font-semibold text-white">{today.rainProbability}%</span>
            </div>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* 3-Day Forecast */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 px-1">주간 예보 (3일)</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {MOCK_FORECAST.slice(1).map((day: DailyForecast) => (
            <div key={day.date} className="flex items-center justify-between p-4">
              <div className="w-16">
                <p className="font-bold text-gray-800">{day.day}</p>
                <p className="text-xs text-gray-500">{day.date}</p>
              </div>
              
              <div className="flex items-center gap-2 flex-1 justify-center">
                {getWeatherIcon(day.condition, 24)}
                <span className="text-xs font-medium text-blue-600">{day.rainProbability > 0 ? `${day.rainProbability}%` : ''}</span>
              </div>
              
              <div className="flex gap-4 w-20 justify-end text-sm">
                <span className="text-gray-400">{day.low}°</span>
                <span className="font-bold text-gray-800">{day.high}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;