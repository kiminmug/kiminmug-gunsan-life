import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppNotification } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenerativeAI(apiKey || "");
};

// Chat Session Interface wrapper to match previous usage if needed, or return the SDK ChatSession
export const createChatSession = (): any => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-001",
    tools: [{ googleSearch: {} } as any], // Explicit cast for googleSearch tool
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
    // Note: Standard SDK doesn't support request-time tool config easily in startChat, 
    // but the model has tools enabled. Location context might need to be passed in prompt if retrievalConfig is not supported directly.

    // Simplification for standard SDK: just send message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    let responseText = response.text();

    if (!responseText) {
      return "죄송해유, 답변을 못 가져왔네유.";
    }

    // Grounding check (Metadata structure might differ slightly in standard SDK response)
    // The standard SDK usually puts grounding in candidates[0].groundingMetadata or similar.
    // For simplicity, we assume text contains the info or we return text.
    return responseText;

  } catch (error) {
    console.error("Gemini Error:", error);
    return "네트워크가 좀 느린가벼. 다시 한번 말해줄래요?";
  }
};

export const getRealtimeWeather = async () => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-001",
    tools: [{ googleSearch: {} } as any],
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const prompt = `
      현재 전라북도 군산시의 실시간 날씨 정보를 알려줘.
      JSON 형식으로 다음 필드를 포함해야 해:
      {
        "current": { "temp": number, "condition": string, "humidity": number, "windSpeed": number, "dustStatus": string, "description": string },
        "forecast": [{ "day": string, "date": string, "high": number, "low": number, "condition": string, "rainProbability": number }],
        "sourceUrl": string
      }
      condition은 Sunny, Cloudy, Rainy, Snowy, PartlyCloudy 중 하나로.
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
    model: "gemini-1.5-flash-001",
    tools: [{ googleSearch: {} } as any],
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const prompt = `
      오늘 현재 군산시의 긴급 도로 교통 상황, 기상 특보, 주요 지역 소식을 찾아줘.
      알림용으로 2개 요약해서 JSON 배열로 반환해:
      [{ "title": string, "message": string, "type": "news" | "weather" | "info" }]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

// Helper for fallback generation
const generateWithFallback = async (prompt: string, useTools: boolean = true) => {
  const genAI = getClient();

  // Strategy: Try efficient model with tools -> Pro model with tools -> Efficient model no tools -> Legacy model
  const attempts = [
    { model: "gemini-1.5-flash", tools: useTools },
    { model: "gemini-1.5-flash-001", tools: useTools },
    { model: "gemini-1.5-pro", tools: useTools },
    { model: "gemini-1.5-flash", tools: false }, // Fallback: try without search if search is broken
    { model: "gemini-pro", tools: false } // Last resort: legacy model
  ];

  let lastError;

  for (const attempt of attempts) {
    try {
      const config: any = { model: attempt.model };
      if (attempt.tools) {
        config.tools = [{ googleSearch: {} }];
      }

      const modelInstance = genAI.getGenerativeModel(config);
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.warn(`Failed with model ${attempt.model} (tools=${attempt.tools}):`, e);
      lastError = e;
      // Continue to next attempt
    }
  }

  throw lastError;
};

export const getDailyBriefing = async (): Promise<string> => {
  const fetchBriefing = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const prompt = `
        오늘은 ${dateStr}입니다. 군산시민을 위한 '오늘의 브리핑'을 작성해주세요.
        가능하다면 Google Search를 사용하여 다음 정보를 포함하세요:
        1. [날짜]: 양력/음력/절기.
        2. [군산 날씨]: 오늘/내일 상세 날씨.
        3. [군산 뉴스]: 최근 주요 뉴스 3가지.
        4. [인사말]: 군산 사투리 조금 섞어서.
        
        형식: 마크다운. 첫 줄 제목: 'YYYY년 M월 D일 군산 소식 브리핑'
      `;

      return await generateWithFallback(prompt, true);

    } catch (e: any) {
      console.error("Briefing Error:", e);
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return `${dateStr}\n\n오늘도 활기찬 군산의 하루가 시작되었습니다!\n\n(오류 원인 [FB]: ${errorMessage})\n\n행복 가득한 하루 되시길 바랍니다.`;
    }
  };

  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => resolve("오늘도 활기찬 군산의 하루가 시작되었습니다! (연결 지연)"), 15000);
  });

  return Promise.race([fetchBriefing(), timeout]);
};
