
import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, ScheduleSlot, Person } from "../types";

export const getAIInsights = async (logs: DailyLog[], slots: ScheduleSlot[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    당신은 전문 퍼포먼스 코치입니다. 다음 로그와 스케줄 데이터를 분석하여 성과 및 웰니스 리포트를 작성하세요.
    Logs: ${JSON.stringify(logs)}
    Slots: ${JSON.stringify(slots)}
    
    답변은 반드시 한국어로 작성하며 Markdown 형식을 사용하세요:
    1. 최근 생산성 요약 및 몰입 패턴 분석
    2. 기분 및 에너지 수준과 업무 효율의 상관관계
    3. 구체적인 개선 제안
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "당신은 냉철하면서도 따뜻한 코치입니다. 데이터에 기반하여 정량적인 조언을 제공하세요."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "AI 분석 도중 오류가 발생했습니다.";
  }
};

export const suggestSubgoals = async (goalTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    목표 "${goalTitle}"을 달성하기 위한 구체적이고 정량적인 하위 전략 3가지와 각 전략별 구체적 실행 과제(Checklist)를 제안하세요.
    또한 제안된 과제 중 매일 반복하면 좋은 항목이 있다면 루틴 여부(isRoutine)를 표시하세요.
    반드시 JSON 형식으로 응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "하위 전략 제목 (예: 하루 30분 집중 코딩)" },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    suggestedAsRoutine: { type: Type.BOOLEAN }
                  },
                  required: ["title"]
                }
              }
            },
            required: ["title", "tasks"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Subgoal Error:", error);
    return [];
  }
};

export const getPersonFollowUp = async (person: Person) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    다음 인맥 정보를 바탕으로, 이 사람에게 오랜만에 연락할 때 대화하면 좋을 주제 3가지를 제안하세요.
    이름: ${person.name}
    관계: ${person.relation}
    관심사/태그: ${person.tags.join(", ")}
    비고사항: ${person.notes}
    마지막 연락일: ${person.lastContactDate || "알 수 없음"}
    
    답변은 한국어로, 친근하고 정중하게 3가지 포인트로 Markdown 리스트 형식을 사용하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Follow-up Error:", error);
    return "제안을 생성하지 못했습니다. 직접 메시지를 작성해보세요.";
  }
};
