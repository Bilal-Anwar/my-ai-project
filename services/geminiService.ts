import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMedia = async (
  base64Data: string,
  mimeType: string,
  language: string = "English"
): Promise<AnalysisResult> => {
  try {
    const ai = getAiClient();
    
    // Using gemini-3-flash-preview for fast multimodal processing
    const model = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analyze the audio/video content. 
            The output MUST be in ${language} language.
            
            1. Provide a full, accurate transcription of the spoken content in ${language}.
            2. Write a concise summary of the content (approx 100 words) in ${language}.
            3. Extract the most important key points as a list of bullet points in ${language}.
            4. Identify speakers (Speaker A, Speaker B, etc.) and provide timestamps for each segment of speech.
            
            Return the result in JSON format matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.STRING, description: "Start time (e.g. 00:00)" },
                  endTime: { type: Type.STRING, description: "End time (e.g. 00:15)" },
                  speaker: { type: Type.STRING, description: "Speaker label (e.g. Speaker A)" },
                  text: { type: Type.STRING, description: "Spoken text in this segment" }
                }
              }
            }
          },
          required: ["transcription", "summary", "keyPoints", "segments"],
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated.");
    }

    try {
        return JSON.parse(text) as AnalysisResult;
    } catch (e) {
        console.error("JSON parsing error", e);
        // Fallback structure
        return {
            transcription: text,
            summary: "Could not parse summary.",
            keyPoints: [],
            segments: []
        };
    }

  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

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

export const fetchMediaFromUrl = async (url: string): Promise<{ blob: Blob; mimeType: string }> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type || 'video/mp4'; // Default fallback
    return { blob, mimeType };
  } catch (error) {
    throw new Error("Could not fetch the video. This is often due to CORS restrictions on the server hosting the video. Please try downloading the file and uploading it manually.");
  }
};