
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const QUESTION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "Nội dung câu hỏi Toán học THPT. Sử dụng ký hiệu toán học rõ ràng.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Mảng gồm đúng 4 lựa chọn (A, B, C, D).",
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: "Chỉ số của câu trả lời đúng (từ 0 đến 3).",
      },
      explanation: {
        type: Type.STRING,
        description: "Giải thích chi tiết các bước giải bài toán.",
      },
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"],
  },
};

export const generateMathQuiz = async (topic: string): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Hãy tạo 10 câu hỏi trắc nghiệm khách quan môn Toán cấp THPT về chủ đề: "${topic}". 
      Các câu hỏi phải có độ khó đa dạng (nhận biết, thông hiểu, vận dụng). 
      Sử dụng tiếng Việt chuyên ngành toán học chính xác. 
      Đảm bảo có lời giải chi tiết cho mỗi câu.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUESTION_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được dữ liệu từ AI");
    
    const questions: Question[] = JSON.parse(text).map((q: any, idx: number) => ({
      ...q,
      id: `q-${idx}-${Date.now()}`
    }));

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
