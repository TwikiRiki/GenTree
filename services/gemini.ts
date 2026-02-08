
import { GoogleGenAI } from "@google/genai";
import { HealthProfile, VitalRecord } from "../types";

/**
 * Generates health insights based on patient profile and vital records using Gemini AI.
 * This fixes the "Expected 0 arguments, but got 2" error in components/PatientProfile.tsx.
 */
export const getHealthInsights = async (profile: HealthProfile, records: VitalRecord[]) => {
  // Always use a named parameter for the apiKey as per the @google/genai coding guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a summary of the vital records for the AI to analyze.
  const recordSummary = records.map(r => 
    `Date: ${new Date(r.timestamp).toLocaleString()}, BP: ${r.systolic}/${r.diastolic} mmHg, HR: ${r.heartRate} bpm, SpO2: ${r.oxygenSaturation}%`
  ).join('\n');

  const prompt = `
    Analyze the following health data for a patient and provide brief, helpful insights or trends based on their history.
    
    Patient Info:
    - Name: ${profile.name}
    - Gender: ${profile.gender}
    - Date of Birth: ${profile.dateOfBirth}
    - Blood Type: ${profile.bloodType || 'Unknown'}
    - Additional Notes: ${profile.notes || 'None'}
    
    Recent Vital Records:
    ${recordSummary}
    
    Please provide:
    1. A short summary of the observed trends in the vitals.
    2. Identification of any values that are outside typical healthy ranges (e.g., Blood Pressure > 140/90, SpO2 < 95%).
    3. A concluding reminder to consult a healthcare professional for clinical advice.
    
    Format the response as clear, concise paragraphs. Do not use Markdown headers, just simple formatting.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning tasks like health data analysis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    
    // Accessing the .text property directly as per the @google/genai guidelines (not a method call).
    return response.text || "No insights could be generated at this time.";
  } catch (error) {
    console.error("Gemini API Error during insight generation:", error);
    // Throwing an error allows the calling component to handle failure in its own catch block.
    throw new Error("Failed to generate health insights using AI.");
  }
};
