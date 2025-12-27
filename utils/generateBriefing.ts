
import axios from 'axios';

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
    const steps = [];

    // 1. Date Info
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    const dateStr = now.toLocaleDateString('ko-KR', dateOptions);

    // Lunar Date (Approximation or Placeholder) - Javascript built-in doesn't support Lunar easily without lib
    // We will skip Lunar for now to avoid errors, or add if "sol-lunar" package exists.

    let markdown = `# 📅 ${dateStr} 브리핑\n\n`;

    // 2. Economics (Parallel Fetch)
    try {
        const exchangeRes = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const krwRate = exchangeRes.data.rates.KRW;
        markdown += `### 💰 경제 지표\n`;
        markdown += `- *원/달러 환율*: **${krwRate.toLocaleString()}원**\n`;
        markdown += `- *증시/유가*: [네이버 증권 확인하기](https://m.stock.naver.com)\n\n`;
    } catch (e) {
        markdown += `### 💰 경제 지표\n- 데이터 수신 실패\n\n`;
    }

    markdown += `---\n\n`;

    // 3. News Fetching
    const GOOGLE_NEWS_KR = 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko';
    const GOOGLE_NEWS_JB = 'https://news.google.com/rss/search?q=전북&hl=ko&gl=KR&ceid=KR:ko';
    const GOOGLE_NEWS_GS = 'https://news.google.com/rss/search?q=군산&hl=ko&gl=KR&ceid=KR:ko';

    try {
        const [krRes, jbRes, gsRes] = await Promise.all([
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent(GOOGLE_NEWS_KR)}`),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent(GOOGLE_NEWS_JB)}`),
            axios.get(`/.netlify/functions/getNews?url=${encodeURIComponent(GOOGLE_NEWS_GS)}`)
        ]);

        const krNews = parseRSS(krRes.data, 10);
        const jbNews = parseRSS(jbRes.data, 5);
        const gsNews = parseRSS(gsRes.data, 5);

        markdown += `### 🇰🇷 대한민국 주요 뉴스\n`;
        krNews.forEach((n, i) => markdown += `${i + 1}. [${n.title}](${n.link})\n`);
        markdown += `\n`;

        markdown += `### 🚩 전북특별자치도 뉴스\n`;
        jbNews.forEach((n, i) => markdown += `${i + 1}. [${n.title}](${n.link})\n`);
        markdown += `\n`;

        markdown += `### ⚓ 군산시 주요 뉴스\n`;
        gsNews.forEach((n, i) => markdown += `${i + 1}. [${n.title}](${n.link})\n`);

    } catch (e) {
        markdown += `\n**뉴스 데이터를 불러오는 중 오류가 발생했습니다.**`;
        console.error(e);
    }

    markdown += `\n\n---\n*이 브리핑은 실시간 데이터를 기반으로 자동 생성되었습니다.*`;

    return markdown;
};
