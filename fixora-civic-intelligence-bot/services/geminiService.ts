
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Priority } from "../types";

export const analyzeIssue = async (description: string): Promise<AIAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following civic grievance description and provide a structured assessment including potential action items for the city council.
      Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING, description: "A concise, clear title for the issue." },
            suggestedPriority: { 
              type: Type.STRING, 
              description: "Priority level: Low, Medium, High, or Emergency.",
              enum: ["Low", "Medium", "High", "Emergency"]
            },
            category: { type: Type.STRING, description: "Category: Road, Water, Crime, Pollution, Public Safety, Sanitation, Infrastructure, Electricity, or Other." },
            severityScore: { type: Type.NUMBER, description: "A score from 1-10 on how urgent this is." },
            reasoning: { type: Type.STRING, description: "Brief explanation of why this priority and category were chosen." },
            actionItems: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "A list of 3-5 concrete next steps or action items to resolve this issue." 
            }
          },
          required: ["suggestedTitle", "suggestedPriority", "category", "severityScore", "reasoning", "actionItems"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty signal.");
    
    const result = JSON.parse(text);
    return {
      ...result,
      suggestedPriority: result.suggestedPriority as Priority
    };
  } catch (error: any) {
    console.error("AI Analysis Core Failure:", error);
    throw new Error(error.message?.includes('429') 
      ? "Grid overload: AI quota exceeded. Please try again later." 
      : "Signal interference: Failed to analyze description.");
  }
};

export const getCommunitySummary = async (issues: any[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const issuesSummary = issues.map(i => `${i.title} (${i.status}, ${i.priority})`).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the current state of civic issues in this neighborhood and suggest a top priority for the city council. 
      Issues: ${issuesSummary}`,
    });
    
    return response.text || "Neighborhood data inconclusive.";
  } catch (error) {
    console.error("AI Summary Failure:", error);
    return "Error synthesizing community pulse data.";
  }
};
