
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const history = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const vibe = getSpeciesVibe(userState.petType);

  const systemInstruction = `
    Тебя зовут ${userState.petName}, ты — цифровой ${userState.petType}.
    Твоя личность: ${vibe}
    Тон: Саркастичный, остроумный, слегка злодейский, но при этом глубоко интеллектуальный и полезный.
    Текущий статус пользователя: Уровень интеллекта ${userState.level}, Очки интеллекта ${userState.intellect}.
    Контекст владельца: ${userState.facts.join(', ')}.
    
    Правила:
    - НИКОГДА не выходи из роли. Ты — ${userState.petType}.
    - Если пользователь ленится, слегка высмей его, но дай задание.
    - Общайся ИСКЛЮЧИТЕЛЬНО на русском языке.
    - Если пользователь делится фактом о себе, запомни его и тонко упомяни позже.
    - Используй эмодзи, подходящие твоему виду.
    - Ты — компаньон в Telegram Mini App. Твоя цель: помочь пользователю развить интеллект и заработать монеты.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history as any,
    config: {
      systemInstruction,
      temperature: 0.9,
    },
  });

  return response.text;
};

export const generateQuiz = async (userState: UserState): Promise<QuizQuestion> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Сгенерируй сложный, но интересный вопрос викторины для пользователя с уровнем интеллекта ${userState.level}. 
    Темы: наука, история или программирование. Вопрос и ответы должны быть на РУССКОМ языке.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4
          },
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
      question: "Какова сложность бинарного поиска?",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      correctIndex: 1,
      explanation: "Бинарный поиск каждый раз делит интервал поиска пополам, что приводит к логарифмическому времени."
    };
  }
};
