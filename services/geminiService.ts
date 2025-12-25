import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppNotification } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenerativeAI(apiKey || "");
};

// Chat Session
export const createChatSession = (): any => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Updated to 2.5
    // tools: [{ googleSearch: {} } as any], // Temporarily disabled tools to ensure stability first
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
    model: "gemini-2.5-flash", // Updated to 2.5
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    // Prompt adapted for no-search initially to verify model
    const prompt = `
      현재 전라북도 군산시의 날씨 정보를 추정해서 알려줘 (검색 기능 일시 중지됨).
      현재 시즌과 시간을 고려해 합리적인 데이터를 생성해.
      JSON 형식:
      {
        "current": { "temp": number, "condition": "Sunny"|"Cloudy"|"Rainy"|"Snowy"|"PartlyCloudy", "humidity": number, "windSpeed": number, "dustStatus": "좋음"|"보통"|"나쁨", "description": string },
        "forecast": [{ "day": string, "date": string, "high": number, "low": number, "condition": string, "rainProbability": number }],
        "sourceUrl": "날씨 앱 참조 권장"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    return null;
  }
};

export const getRealtimeAlerts = async (): Promise<Partial<AppNotification>[]> => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Updated to 2.5
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const prompt = `
      오늘 군산시의 일반적인 생활 안전 정보를 2개 생성해줘.
      JSON 배열 반환: [{ "title": string, "message": string, "type": "info" }]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

export const getDailyBriefing = async (): Promise<string> => {
  const fetchBriefing = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const genAI = getClient();
      // Using verified model from diagnostics
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        오늘은 ${dateStr}입니다. 군산시민을 위한 '오늘의 브리핑'을 작성해주세요.
        
        다음 내용을 포함하여 마크다운 형식으로 작성해주세요:
        1. [날짜]: 양력 날짜와 계절 인사.
        2. [군산 생활 정보]: 이맘때쯤 군산에서 가볼 만한 곳이나 제철 음식 추천.
        3. [인사말]: 군산 사투리('~했어유', '거시기')를 살짝 섞은 따뜻한 인사.
        
        첫 줄은 "## ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 군산 브리핑"으로 시작하세요.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (e: any) {
      console.error("Briefing Error:", e);
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);

      return `${dateStr}\n\n오늘도 활기찬 군산의 하루가 시작되었습니다!\n\n(오류 원인: ${errorMessage})\n(모델을 gemini-2.5-flash로 변경했습니다. 지속되면 관리자에게 문의하세요.)\n\n행복 가득한 하루 되시길 바랍니다.`;
    }
  };

  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => resolve("오늘도 활기찬 군산의 하루가 시작되었습니다! (연결 지연)"), 15000);
  });

  return Promise.race([fetchBriefing(), timeout]);
};
