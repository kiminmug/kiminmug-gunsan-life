
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
    model: 'gemini-1.5-flash',
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
      model: "gemini-3-flash-preview",
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
      model: 'gemini-1.5-flash',
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
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: "오늘 군산의 실시간 날씨와 현재 이슈를 확인하고, 군산 시민에게 건네는 따뜻한 아침 인사말을 다음 형식으로 상세하게(300자 내외) 작성해줘. \\n\\n형식:\\n1. **[날짜]:** YYYY년 MM월 DD일 요일 (음력 MM월 DD일)\\n2. * **실시간 날씨:** [온도, 상태, 특이사항]\\n3. * **현재 이슈:** [군산 관련 뉴스나 생활 정보]\\n4. * **[군산 시민을 위한 아침 인사]:** [사투리를 섞은 따뜻한 말]",
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "오늘도 좋은 하루 되세요!";
  } catch (e) {
    return "오늘도 활기찬 군산의 하루가 시작되었습니다!";
  }
}
