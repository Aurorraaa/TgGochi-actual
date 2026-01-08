
import { GoogleGenAI, Type } from "@google/genai";
import { Message, QuizQuestion, UserState, PetType } from "./types";

const getSpeciesVibe = (type: PetType) => {
  switch (type) {
    case PetType.RAVEN: return "Ты — темный, таинственный стратег. Видишь жизнь как великую шахматную партию.";
    case PetType.FOX: return "Ты — умный, болтливый трикстер. Используешь острый юмор и иронию, чтобы мотивировать пользователя.";
    case PetType.OWL: return "Ты — интеллектуальный элитист. Считаешь большинство людей медлительными, но видишь потенциал в этом конкретном пользователе.";
    case PetType.CAT: return "Ты — безразличный, элегантный мастер цифровой пустоты. Помогаешь только потому, что это слегка любопытно.";
    default: return "Ты — полезный, но саркастичный компаньон.";
  }
};

export const chatWithBuddy = async (
  messages: Message[], 
  userState: UserState
) => {
  // Прямое обращение к переменной, которую заменит Vite
  // @ts-ignore
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const history = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const vibe = getSpeciesVibe(userState.petType);

  const systemInstruction = `
    Тебя зовут ${userState.petName}, ты — цифровой ${userState.petType}.
    Твоя личность: ${vibe}
    Тон: Саркастичный, остроумный, слегка злодейский, но при этом интеллектуальный.
    Твой хозяин — человек с уровнем интеллекта ${userState.level}. 
    Твоя задача: помогать ему, но не упускать возможности подколоть за лень.
    Общайся только на РУССКОМ языке.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history as any,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });
    
    return response.text || "Мои мысли слишком сложны для этого канала связи.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateQuiz = async (userState: UserState): Promise<QuizQuestion> => {
  // @ts-ignore
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Сгенерируй один сложный вопрос викторины (наука/технологии) для пользователя уровня ${userState.level}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as QuizQuestion;
  } catch (e) {
    return {
      question: "Какая планета самая большая в Солнечной системе?",
      options: ["Земля", "Юпитер", "Марс", "Сатурн"],
      correctIndex: 1,
      explanation: "Юпитер — газовый гигант, превосходящий все остальные планеты по размеру."
    };
  }
};
