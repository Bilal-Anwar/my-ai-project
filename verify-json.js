import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let apiKey = "";

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    }
} catch (e) {
    console.error("Error reading .env", e);
}

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = "gemini-flash-latest";

async function verify() {
    console.log(`Verifying JSON response with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Analyze this text: "The quick brown fox jumps over the lazy dog." 
    Return a strictly valid JSON object (no markdown formatting, no backticks) with the following structure:
    {
      "transcription": "Full transcription of the audio/video",
      "summary": "A concise summary of the content",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "segments": [
        {"startTime": "00:00", "endTime": "00:10", "speaker": "Speaker 1", "text": "Segment text"}
      ]
    }`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`Raw Response: ${text.substring(0, 100)}...`);

        const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanerText);

        if (parsed.summary && Array.isArray(parsed.keyPoints)) {
            console.log("[VERIFIED] Valid JSON structure received.");
            console.log("Summary:", parsed.summary);
            console.log("Key Points:", parsed.keyPoints);
        } else {
            console.error("[FAILED] JSON parsed but missing fields.");
        }

    } catch (error) {
        console.error(`[FAILED] Error:`, error.message);
        process.exit(1);
    }
}

verify();
