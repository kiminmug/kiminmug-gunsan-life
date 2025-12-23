
export interface NewsItem {
  id: string;
  title: string;
  category: string;
  source: string; // The visible media name (e.g., 'YTN', 'Gunsan City')
  platform: 'Google' | 'Naver' | 'KCN' | 'TodayGunsan'; // Added KCN and TodayGunsan
  originalUrl: string; // URL to the external article
  date: string;
  summary: string;
  imageUrl?: string;
  content?: string;
  videoId?: string; // YouTube Video ID for inline playback
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'PartlyCloudy';
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'PartlyCloudy';
  rainProbability: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  category: 'Safety' | 'Medical' | 'Utility' | 'Admin';
}

export interface TideInfo {
  date: string;
  day: string;
  tides: {
    time: string;
    type: 'High' | 'Low';
    height: number; // cm
  }[];
}

export interface LocalEvent {
  id: string;
  title: string;
  dateRange: string;
  location: string;
  type: 'Festival' | 'Culture' | 'Notice';
  description: string;
}

export interface SaemangeumUpdate {
  id: string;
  title: string;
  progress: number; // 0-100
  status: string;
  date: string;
}

export enum AppTab {
  HOME = 'HOME',
  NEWS = 'NEWS',
  WEATHER = 'WEATHER',
  INFO = 'INFO',
  CHAT = 'CHAT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'weather' | 'news' | 'info';
  timestamp: Date;
  read: boolean;
}
