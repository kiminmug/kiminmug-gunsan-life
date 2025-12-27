
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchKMAWeather } from '../services/weatherService';

// Initialize Gemini
const API_KEY = "AIzaSyBtY8qWfX1f2CIg6i8gg6zO-XbnQNZMNaQ"; // User provided key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper to parse RSS XML
const parseRSS = (xmlText: string, limit: number): { title: string, link: string }[] => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll('item'));
        return items.slice(0, limit).map(item => ({
            title: item.querySelector('title')?.textContent || '제목 없음',
            link: item.querySelector('link')?.textContent || '#'
        }));
    } catch (e) {
        console.error("RSS Parse Error", e);
        return [];
    }
};

export const generateDailyBriefing = async (): Promise<string> => {
    try {
        // 1. Collect Data in Parallel
        const [weatherData, exchangeRes, krRes, jbRes, gsRes] = await Promise.all([
            fetchKMAWeather(),
            axios.get('https://api.exchangerate-api.com/v4/latest/USD').catch(() => ({ data: { rates: { KRW: 0 } } })),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko')}`),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss/search?q=전북&hl=ko&gl=KR&ceid=KR:ko')}`),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss/search?q=군산&hl=ko&gl=KR&ceid=KR:ko')}`)
        ]);

        // 2. Process Data
        const krwRate = exchangeRes.data.rates.KRW;
        const weatherText = weatherData.current ?
            `오늘날씨: ${weatherData.current.condition}, 기온: ${weatherData.current.temp}도, 습도: ${weatherData.current.humidity}%` :
            "날씨 정보 수신 실패";

        const tomorrow = weatherData.forecast && weatherData.forecast.length > 0 ? weatherData.forecast[0] : null;
        const tomText = tomorrow ? `내일날씨: ${tomorrow.condition}, 최고: ${tomorrow.high}, 최저: ${tomorrow.low}` : "";

        const krNews = parseRSS(krRes.data, 10).map(n => n.title).join(", ");
        const jbNews = parseRSS(jbRes.data, 5).map(n => n.title).join(", ");
        const gsNews = parseRSS(gsRes.data, 5).map(n => n.title).join(", ");

        const now = new Date();
        const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

        // 3. Construct Prompt with User requests
        // - Title size: Use ## or ###
        // - Economic summary: Explicitly ask for it
        // - Spacing: Compact
        const prompt = `
    당신은 전문 뉴스 큐레이터입니다. 아래 데이터를 바탕으로 "오늘 주요 브리핑"을 작성해주세요.
    
    **데이터:**
    - 날짜: ${dateStr}
    - 환율: ${krwRate}원/달러
    - 날씨: ${weatherText}. ${tomText}
    - 한국뉴스: ${krNews}
    - 전북뉴스: ${jbNews}
    - 군산뉴스: ${gsNews}
    
    **작성 규칙 (지키지 않으면 안됨):**
    1. **제목**: "## 📰 오늘 주요 브리핑" (H2 태그 사용, 너무 크지 않게).
    2. **1. 오늘의 기본 정보**: 날짜, 음력(오늘 기준 계산), 역사 속 오늘(12.27 사건 2개).
    3. **2. 경제 지표 및 요약**:
       - 환율 정보 표시.
       - **경제 요약**: 오늘 뉴스 헤드라인을 바탕으로 경제/사회 분위기를 1-2문장으로 요약해서 작성할 것. (필수).
    4. **3. 군산 날씨**: 위 날씨 데이터 기반 요약.
    5. **4. 뉴스 스크랩**: 카테고리별로 기사 제목만 나열 (각 5-10개).
       - ### 대한민국 주요 뉴스
       - ### 전북 주요 뉴스
       - ### 군산 주요 뉴스
    6. **스타일**:
       - 불필요한 빈 줄을 줄여서 좀 더 컴팩트하게 작성할 것 (경제지표와 뉴스 사이 간격 너무 넓지 않게).
       - 중요 키워드는 **볼드** 처리.
       - 각 섹션 사이에는 구분선(---) 하나만 넣을 것.
    `;

        // 4. Call Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;

    } catch (e: any) {
        console.error("Briefing Generation Error", e);
        return `
## ⚠️ 브리핑 생성 실패

죄송합니다. 오류가 발생했습니다.
잠시 후 다시 시도해주세요.

**오류 내용**: ${e.message || "알 수 없는 오류"}
    `;
    }
};
