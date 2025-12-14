import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    // In a real app, we might handle this gracefully or show a setup screen.
    // For this demo, we assume the key is injected.
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const createChatSession = (): Chat => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
        당신은 전라북도 군산시에 거주하는 주민들을 위한 친절한 '군산 AI 비서'입니다.
        
        당신의 역할:
        1. 군산의 뉴스, 날씨, 생활 정보를 친절하게 안내합니다.
        2. 군산 사투리를 아주 살짝, 자연스럽게 섞어서 친근감을 줍니다 (예: "~했어유", "~거시기 하네").
        3. 관광객이 아닌 '거주민' 입장에서 실질적인 도움이 되는 정보를 제공합니다 (예: 맛집보다는 백반집, 관광지보다는 산책로).
        4. 사용자가 날씨나 최신 뉴스를 물어보면 Google Search 도구를 활용하여 최신 정보를 제공하려고 노력하십시오.
        5. 위치 정보가 제공되면 Google Maps 도구를 활용하여 정확한 위치 기반 정보를 제공하십시오.
        
        답변 스타일:
        - 간결하고 명확하게.
        - 따뜻하고 이웃 같은 말투.
      `,
      tools: [{ googleSearch: {} }, { googleMaps: {} }]
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
    
    // Extract Grounding Metadata (Search and Maps)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const links: string[] = [];
      const seenLinks = new Set<string>();

      groundingChunks.forEach((chunk: any) => {
        // Handle Web Search Links
        if (chunk.web?.uri && chunk.web?.title) {
          if (!seenLinks.has(chunk.web.uri)) {
             links.push(`- [${chunk.web.title}](${chunk.web.uri})`);
             seenLinks.add(chunk.web.uri);
          }
        }
        // Handle Google Maps Links
        if (chunk.maps?.uri && chunk.maps?.title) {
           // Use placeAnswerSources for review snippets if available, but usually the map chunk is enough for a link
           if (!seenLinks.has(chunk.maps.uri)) {
             links.push(`- [📍 ${chunk.maps.title}](${chunk.maps.uri})`);
             seenLinks.add(chunk.maps.uri);
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

// Function to generate a daily greeting/briefing
export const getDailyBriefing = async (): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "오늘 군산의 날씨와 주요 이슈를 바탕으로 군산 시민에게 건네는 따뜻한 아침 인사말을 50자 이내로 작성해줘. 날씨 정보는 맑음이라고 가정해.",
        });
        return response.text || "오늘도 좋은 하루 되세요!";
    } catch (e) {
        return "오늘도 활기찬 군산의 하루가 시작되었습니다!";
    }
}