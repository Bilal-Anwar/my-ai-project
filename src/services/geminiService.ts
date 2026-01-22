import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing! Please set it in your environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeMedia = async (fileUrl: string, mimeType: string, language: string) => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }

  try {
    // Agar 1.5-flash-latest kaam na kare, to sirf gemini-1.5-flash use karein
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Supabase se file nahi mil saki.");
    const blob = await response.blob();

    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const prompt = `Analyze this media in ${language}. 
    Return a strictly valid JSON object (no markdown formatting, no backticks) with the following structure:
    {
      "transcription": "Full transcription of the audio/video",
      "summary": "A concise summary of the content",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "segments": [
        {"startTime": "00:00", "endTime": "00:10", "speaker": "Speaker 1", "text": "Segment text"}
      ]
    }`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      { text: prompt }
    ]);

    const aiResponse = await result.response;
    const text = aiResponse.text();

    // Clean code blocks if present (e.g. ```json ... ```)
    const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleanerText);
      return {
        transcription: parsed.transcription || "No transcription available",
        summary: parsed.summary || "No summary available",
        keyPoints: parsed.keyPoints || [],
        segments: parsed.segments || []
      };
    } catch (e) {
      console.error("JSON Parse Error:", e, "Raw Text:", text);
      return {
        transcription: text,
        summary: "Failed to parse analysis results.",
        keyPoints: ["Raw output returned"],
        segments: []
      };
    }
  } catch (error: any) {
    console.error("Detailed Error:", error);
    throw new Error("AI Analysis fail: " + error.message);
  }
};