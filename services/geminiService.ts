
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, AppNotification } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const createChatSession = (): Chat => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-1.5-flash-001',
    config: {
      systemInstruction: `
        당신은 전라북도 군산시에 거주하는 주민들을 위한 친절한 '군산 AI 비서'입니다.
        
        당신의 역할:
        1. 군산의 뉴스, 날씨, 생활 정보를 친절하게 안내합니다.
        2. 군산 사투리를 아주 살짝, 자연스럽게 섞어서 친근감을 줍니다 (예: "~했어유", "~거시기 하네").
        3. 관광객이 아닌 '거주민' 입장에서 실질적인 도움이 되는 정보를 제공합니다.
        4. 사용자가 날씨나 최신 뉴스를 물어보면 Google Search 도구를 활용하여 최신 정보를 제공하십시오.
        
        답변 스타일:
        - 간결하고 명확하게.
        - 따뜻하고 이웃 같은 말투.
      `,
      tools: [{ googleSearch: {} }]
    },
  });
};

export const sendMessageToGemini = async (
  chat: Chat,
  message: string,
  location?: { lat: number, lng: number }
): Promise<string> => {
  try {
    const requestOptions: any = { message };

    if (location) {
      requestOptions.config = {
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      };
    }

    const response: GenerateContentResponse = await chat.sendMessage(requestOptions);
    let responseText = response.text || "죄송해유, 지금은 대답하기가 좀 거시기하네요. 잠시 뒤에 다시 물어봐주세요.";

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const links: string[] = [];
      const seenLinks = new Set<string>();

      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          if (!seenLinks.has(chunk.web.uri)) {
            links.push(`- [${chunk.web.title}](${chunk.web.uri})`);
            seenLinks.add(chunk.web.uri);
          }
        }
      });

      if (links.length > 0) {
        responseText += "\n\n**관련 정보:**\n" + links.join("\n");
      }
    }

    return responseText;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "네트워크가 좀 느린가벼. 다시 한번 말해줄래요?";
  }
};

export const getRealtimeWeather = async () => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: "현재 전라북도 군산시의 실시간 날씨 정보를 알려줘. 온도, 상태, 습도, 풍속, 미세먼지 농도 및 상태, 그리고 향후 3일간의 일자별 최고/최저 기온과 상태를 포함해줘.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.NUMBER, description: "현재 온도 (섭씨)" },
                condition: { type: Type.STRING, description: "Sunny, Cloudy, Rainy, Snowy, PartlyCloudy 중 하나" },
                humidity: { type: Type.NUMBER, description: "습도 (%)" },
                windSpeed: { type: Type.NUMBER, description: "풍속 (m/s)" },
                dustStatus: { type: Type.STRING, description: "미세먼지 상태 (좋음, 보통, 나쁨)" },
                description: { type: Type.STRING, description: "날씨 한 줄 요약" }
              },
              required: ["temp", "condition", "humidity", "windSpeed", "dustStatus", "description"]
            },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "요일 (예: 내일, 모레, 글피)" },
                  date: { type: Type.STRING, description: "날짜 (MM/DD)" },
                  high: { type: Type.NUMBER },
                  low: { type: Type.NUMBER },
                  condition: { type: Type.STRING, description: "Sunny, Cloudy, Rainy, Snowy, PartlyCloudy 중 하나" },
                  rainProbability: { type: Type.NUMBER }
                }
              }
            },
            sourceUrl: { type: Type.STRING, description: "정보 출처 URL" }
          },
          required: ["current", "forecast"]
        }
      }
    });

    const weatherData = JSON.parse(response.text || "{}");
    return weatherData;
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    return null;
  }
};

/**
 * 실시간 군산 상황(교통, 사고, 긴급 뉴스)을 검색하여 알림 객체로 반환
 */
export const getRealtimeAlerts = async (): Promise<Partial<AppNotification>[]> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001',
      contents: "오늘 현재 전라북도 군산시의 긴급한 도로 교통 상황(사고, 공사, 정체)이나 실시간 기상 특보(호우, 폭염 등), 또는 중요한 지역 소식을 찾아줘. 알림으로 띄울 만한 정보 2개를 요약해줘.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "알림 제목 (아이콘 포함)" },
              message: { type: Type.STRING, description: "알림 상세 내용" },
              type: { type: Type.STRING, description: "weather, news, info 중 하나" }
            },
            required: ["title", "message", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Alerts Fetch Error:", error);
    return [];
  }
};

export const getDailyBriefing = async (): Promise<string> => {
  const ai = getClient();

  // Timeout promise
  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => resolve("오늘도 활기찬 군산의 하루가 시작되었습니다! (연결 지연으로 기본 인사가 제공됩니다)"), 8000);
  });

  const fetchBriefing = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-001',
        contents: `오늘은 ${dateStr}입니다. 군산시민을 위한 '오늘의 브리핑'을 작성해주세요.
        
        다음 정보를 검색하여 포함하세요:
        1. [날짜]: 양력 날짜와 음력 날짜, 그리고 해당되는 절기가 있다면 포함.
        2. [군산 날씨 전망]: 오늘과 내일의 상세 날씨 (기온, 강수, 바람 등) 및 외출 조언.
        3. [군산 주요 뉴스]: 최근 군산 지역의 주요 뉴스 3가지를 요약.
        4. [인사말]: 군산 사투리('~했어유', '거시기')를 살짝 섞은 따뜻한 아침 인사.

        형식은 **마크다운** 스타일(헤더, 리스트)을 사용하여 가독성 있게 작성해주세요. 
        단, 가장 첫 줄은 인사를 제외한 'YYYY년 M월 D일 군산 소식 브리핑' 제목으로 시작하세요.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      return response.text || "오늘의 브리핑 정보를 가져올 수 없습니다.";
    } catch (e: any) {
      console.error("Briefing Error:", e);
      // Fallback with Error Details for Debugging
      const today = new Date();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`;
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);

      return `${dateStr}\n\n오늘도 활기찬 군산의 하루가 시작되었습니다!\n\n(오류 원인: ${errorMessage})\n\n행복 가득한 하루 되시길 바랍니다.`;
    }
  };

  return Promise.race([fetchBriefing(), timeout]);
}
