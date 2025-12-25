import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppNotification } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenerativeAI(apiKey || "");
};

// ... existing helper functions (createChatSession, etc. kept minimal or unchanged for now)
export const createChatSession = (): any => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return model.startChat({ history: [] });
};

export const sendMessageToGemini = async (chat: any, message: string): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "죄송해유, 지금은 대답하기 곤란하네유.";
  }
};

export const getRealtimeWeather = async () => { return null; };
export const getRealtimeAlerts = async () => { return []; };

// DIAGNOSTIC VERSION
export const getDailyBriefing = async (): Promise<string> => {
  const fetchBriefing = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const genAI = getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        오늘은 ${dateStr}입니다. 군산시민을 위한 '오늘의 브리핑'을 작성해주세요.
        (검색 기능 없이 기존 지식으로만 작성)
        형식: 마크다운.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (e: any) {
      console.error("Briefing Error:", e);
      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      // DIAGNOSTIC STEP: Check available models directly via REST
      let diagnosticMsg = "";
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";
        if (!apiKey) {
          diagnosticMsg = "API KEY 없음";
        } else {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await response.json();

          if (data.error) {
            diagnosticMsg = `API 상태 에러: ${data.error.message}`;
          } else if (data.models) {
            const modelNames = data.models.map((m: any) => m.name.replace('models/', '')).slice(0, 3).join(', ');
            diagnosticMsg = `키 정상 (가능 모델: ${modelNames} 등)`;
          } else {
            diagnosticMsg = `응답 이상함: ${JSON.stringify(data).substring(0, 50)}`;
          }
        }
      } catch (diagErr: any) {
        diagnosticMsg = `진단 실패: ${diagErr.message}`;
      }

      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      // Simplify error message for user
      const simpleError = errorMessage.includes("404") ? "모델을 찾을 수 없음" : "연결 실패";

      return `${dateStr}\n\n오늘도 활기찬 군산의 하루가 시작되었습니다!\n\n(오류 진단 [DIAG]: ${diagnosticMsg})\n(상세: ${simpleError})\n\n행복 가득한 하루 되시길 바랍니다.`;
    }
  };

  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => resolve("오늘도 활기찬 군산의 하루가 시작되었습니다! (연결 지연)"), 15000);
  });

  return Promise.race([fetchBriefing(), timeout]);
};
