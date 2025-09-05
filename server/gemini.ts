import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeImageForPrompt(imageData: Buffer, mimeType: string, itemType: "found" | "lost"): Promise<string> {
    try {
        const contents = [
            {
                inlineData: {
                    data: imageData.toString("base64"),
                    mimeType: mimeType,
                },
            },
            itemType === "found" 
                ? "Analyze this image and create a detailed 3-5 sentence description of the item for a lost and found report. Include specific details like color, type, brand, size, condition, distinctive features, and any identifying marks. Make it detailed enough for someone to identify if they lost it."
                : "Analyze this image and create a detailed 3-5 sentence description of the item for a lost and found report. Include specific details like color, type, brand, size, condition, distinctive features, and where it might have been lost. Make it detailed enough for someone to identify if they found it.",
        ];

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: contents,
        });

        return response.text || "Unable to analyze image";
    } catch (error) {
        console.error("Failed to analyze image:", error);
        throw new Error("Failed to analyze image with AI");
    }
}

export async function analyzeImageForChat(imageData: Buffer, mimeType: string): Promise<string> {
    try {
        const contents = [
            {
                inlineData: {
                    data: imageData.toString("base64"),
                    mimeType: mimeType,
                },
            },
            "Briefly describe what you see in this image in 1-2 sentences.",
        ];

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: contents,
        });

        return response.text || "Image shared";
    } catch (error) {
        console.error("Failed to analyze chat image:", error);
        return "Image shared";
    }
}