import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

// Vite ke liye key yahan se aayegi
const API_KEY = import.meta.env.VITE_API_KEY || "YOUR_KEY_HERE"; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeMedia = async (
  base64Data: string,
  mimeType: string,
  language: string = "English"
): Promise<AnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the audio/video content. Return results in JSON format with fields: transcription, summary, keyPoints (array), and segments (array). Output language: ${language}`;

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Data } },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

// --- YE FUNCTION ZAROORI HAI (Iska error aa raha tha) ---
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};