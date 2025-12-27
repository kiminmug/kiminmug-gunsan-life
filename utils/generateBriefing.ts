
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";


// Initialize Gemini
const API_KEY = "AIzaSyBSQJ9eLmrL3wG4kFR8t4aFVUztwiNiPWM"; // User provided key
const genAI = new GoogleGenerativeAI(API_KEY);


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
        const [exchangeRes, krRes, jbRes, gsRes, finRes] = await Promise.all([
            axios.get('https://api.exchangerate-api.com/v4/latest/USD').catch(() => ({ data: { rates: { KRW: 0 } } })),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko')}`).catch(() => ({ data: "" })),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss/search?q=전북&hl=ko&gl=KR&ceid=KR:ko')}`).catch(() => ({ data: "" })),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://news.google.com/rss/search?q=군산&hl=ko&gl=KR&ceid=KR:ko')}`).catch(() => ({ data: "" })),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent('https://finance.naver.com/')}`).catch(e => { console.warn('Finance fetch failed', e); return { data: "" }; })
        ]);

        // 2. Process Data
        const krwRate = exchangeRes.data.rates.KRW;

        // Clean up financial HTML to just text to save tokens
        const finText = typeof finRes.data === 'string' ? finRes.data.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').slice(0, 10000) : "";

        // Reduce news items for speed (10->5, 5->3)
        const krNews = parseRSS(krRes.data, 5).map(n => `- ${n.title} (링크: ${n.link})`).join("\n");
        const jbNews = parseRSS(jbRes.data, 3).map(n => `- ${n.title} (링크: ${n.link})`).join("\n");
        const gsNews = parseRSS(gsRes.data, 3).map(n => `- ${n.title} (링크: ${n.link})`).join("\n");

        const now = new Date();
        const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

        // 3. Construct Prompt (Economics ADDED, Weather REMOVED)
        const prompt = `
    당신은 전문 뉴스 큐레이터입니다. 아래 데이터를 바탕으로 "오늘 주요 브리핑"을 작성해주세요.
    
    **데이터:**
    - 날짜: ${dateStr}
    - 기본 환율(API): ${krwRate}원/달러
    - **네이버 증권 페이지 텍스트(참고용)**: ${finText}
    
    [한국뉴스 데이터]
    ${krNews}
    
    [전북뉴스 데이터]
    ${jbNews}
    
    [군산뉴스 데이터]
    ${gsNews}
    
    **작성 규칙 (필수):**
    1. **제목**: "## 📰 오늘 주요 브리핑" (H2 태그).
    2. **1. 오늘의 기본 정보**: 날짜, 음력(오늘 기준 계산), 역사 속 오늘(12.27 사건 2개).
    3. **2. 주요 경제 지표** (제공된 네이버 증권 텍스트에서 KOSPI, KOSDAQ, WTI, 금리 등을 찾아 아래 형식으로 작성. 못 찾으면 '확인 불가'로 표시):
       - **환율**: 1,XXX.xx원 (전일 대비 변동폭) (API 값보다 텍스트 내 최신 값을 우선할 것)
       - **KOSPI**: X,XXX.xx (전일 대비 변동폭)
       - **KOSDAQ**: XXX.xx (전일 대비 변동폭)
       - **금리 (국고채 3년)**: X.XX%
       - **국제유가 (WTI)**: $XX.XX (배럴당)
       
    4. **3. 뉴스 스크랩**: 카테고리별로 제목 나열. **반드시 원본 기사 링크 포함**.
       - 형식: "- [기사 제목](기사 원본 링크)"
       - ### 대한민국 주요 뉴스
       - ### 전북 주요 뉴스
       - ### 군산 주요 뉴스
    5. **스타일**:
       - 섹션 간 구분선(---) 사용.
       - **날씨 정보는 절대 넣지 말 것. (군산 날씨 포함 금지)**
       - 불필요한 빈 줄을 줄여서 좀 더 컴팩트하게 작성할 것.
       - 중요 키워드는 **볼드** 처리.
    `;

        // 4. Call Gemini with Fallback Models
        const modelsToTry = [
            "gemini-2.0-flash", // Best for speed
            "gemini-flash-latest",
            "gemini-2.0-flash-exp",
            "gemini-pro-latest"
        ];

        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}`);
                const currentModel = genAI.getGenerativeModel({ model: modelName });
                const result = await currentModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (e: any) {
                console.warn(`Model ${modelName} failed:`, e.message);
                lastError = e;
            }
        }

        throw lastError || new Error("All models failed");

    } catch (e: any) {
        console.error("Briefing Generation Error", e);

        // Debug: Try to list models
        let debugInfo = "";
        try {
            const listRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY.trim()}`);
            const availableModels = listRes.data.models ? listRes.data.models.map((m: any) => m.name).join(", ") : "None";
            debugInfo = `\n\n**사용 가능한 모델 리스트**: ${availableModels}`;
        } catch (listErr: any) {
            debugInfo = `\n\n**모델 리스트 조회 실패**: ${listErr.message}`;
        }

        return `
## ⚠️ 브리핑 생성 실패 (v0.0.6 - Stable)

죄송합니다. 서비스 연결에 문제가 있습니다.
아래 모델 리스트를 확인 후 개발자에게 알려주세요.

**오류 내용**: ${e.message || "알 수 없는 오류"}
${debugInfo}
    `;
    }
};
