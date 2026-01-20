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
    console.log(`Verifying fix with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
        const prompt = "Reply with 'Fixed'";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`[VERIFIED] Model responded: ${text}`);
    } catch (error) {
        console.error(`[FAILED] Error:`, error.message);
        process.exit(1);
    }
}

verify();
