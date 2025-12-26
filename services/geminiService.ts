import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppNotification } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenerativeAI(apiKey || "");
};

// Robust JSON helper to find the first JSON object
const cleanJson = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

// Chat Session
export const createChatSession = (): any => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} } as any],
  });

  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{
          text: `
          당신은 전라북도 군산시에 거주하는 주민들을 위한 친절한 '군산 AI 비서'입니다.
          군산 사투리를 아주 살짝 섞어서 친근하게 답변하세요.
          관광객이 아닌 거주민에게 필요한 실생활 정보를 제공하세요.
          날씨나 뉴스는 Google Search를 사용하여 최신 정보를 제공하세요.
        ` }],
      },
      {
        role: "model",
        parts: [{ text: "알겠슈~ 군산 시민들을 위해 싹싹하게 도와드릴게유. 무엇이 궁금한가요?" }],
      }
    ],
  });
};

export const sendMessageToGemini = async (
  chat: any,
  message: string,
  location?: { lat: number, lng: number }
): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    let responseText = response.text();
    return responseText || "죄송해유, 답변을 못 가져왔네유.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "네트워크가 좀 느린가벼. 다시 한번 말해줄래요?";
  }
};

export const getRealtimeWeather = async () => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} } as any],
    // generationConfig: { responseMimeType: "application/json" } // Removed to prevent 400 Conflict with Tools
  });

  try {
    // Prompt explicitly asking for search
    const prompt = `
      현재 전라북도 군산시의 실시간 날씨 정보를 Google Search를 사용하여 정확하게 찾아줘.
      반드시 최신 기상청 데이터를 기반으로 해야 해.
      JSON 형식:
      {
        "current": { "temp": number, "condition": "Sunny"|"Cloudy"|"Rainy"|"Snowy"|"PartlyCloudy", "humidity": number, "windSpeed": number, "dustStatus": "좋음"|"보통"|"나쁨", "description": string },
        "forecast": [{ "day": string, "date": string, "high": number, "low": number, "condition": string, "rainProbability": number }],
        "sourceUrl": "정보 출처 URL"
      }
      condition은 Sunny, Cloudy, Rainy, Snowy, PartlyCloudy 중 하나로.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Use helper to parse JSON robustly
    try {
      return JSON.parse(cleanJson(text));
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Text:", text);
      return { error: "JSON Parsing Failed" };
    }

  } catch (error: any) {
    console.error("Weather Fetch Error:", error);
    return { error: error.message || "Fetch Failed" };
  }
};

export const getRealtimeAlerts = async (): Promise<Partial<AppNotification>[]> => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} } as any],
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const prompt = `
      오늘 현재 군산시의 긴급 도로 교통 상황, 기상 특보, 주요 지역 소식을 찾아줘.
      Google Search를 통해 최신 뉴스 속보나 재난 문자를 확인해.
      알림용으로 2개 요약해서 JSON 배열로 반환해:
      [{ "title": string, "message": string, "type": "news" | "weather" | "info" }]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(cleanJson(text));

  } catch (error) {
    console.error("Alert Fetch Error:", error);
    return [];
  }
};

export const getDailyBriefing = async (): Promise<string> => {
  const fetchBriefing = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const genAI = getClient();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} } as any],
      });

      const prompt = `
        오늘은 ${dateStr}입니다. 군산시민을 위한 '오늘의 브리핑'을 작성해주세요.
        
        **반드시 Google Search를 사용하여 실시간 최신 정보를 검색**한 뒤 작성하세요:
        1. [날짜]: 양력 날짜와 음력, 절기 정보.
        2. [군산 날씨]: 오늘/내일 상세 날씨 (기온, 강수, 미세먼지).
        3. [군산 뉴스]: 최근 군산 지역 주요 뉴스 3가지를 요약 (링크 포함하지 않음).
        4. [인사말]: "좋은 아침" 같은 시간적 인사는 피하고, 시간에 관계없이 쓸 수 있는 멋지고 감성적인 응원의 한마디 (군산 사투리 살짝 섞어서).
        
        형식: 마크다운. 첫 줄 제목: '## YYYY년 M월 D일 군산 소식 브리핑'
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (e: any) {
      console.error("Briefing Error:", e);
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);

      return `${dateStr}\n\n오늘도 활기찬 군산의 하루가 시작되었습니다!\n\n(오류 원인: ${errorMessage})\n\n행복 가득한 하루 되시길 바랍니다.`;
    }
  };

  const timeout = new Promise<string>((resolve) => {
    // Extended timeout for slow Search tool (real-time data takes time)
    setTimeout(() => resolve("오늘도 활기찬 군산의 하루가 시작되었습니다! (연결 지연 - 잠시 후 다시 시도해보세요)"), 90000);
  });

  return Promise.race([fetchBriefing(), timeout]);
};
