// Gemini AI integration for generating responses to chatbot questions

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

export async function getResponseFromGemini(question: string, apiKey: string | undefined): Promise<string> {
  try {
    if (!apiKey) {
      return generateFallbackResponse();
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const prompt = `
    You are a job applicant answering a question during the job application process.
    Please respond to the following question in a professional manner:
    
    "${question}"
    
    Provide a concise, positive, and professional answer that highlights your skills and experiences
    without being too generic or using excessive jargon.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating response from Gemini:', error.message || error);
    return generateFallbackResponse();
  }
}

function generateFallbackResponse(): string {
  return "I am a highly skilled professional with relevant experience for this position. I have a strong background in software development and problem-solving, with excellent communication skills. I'm enthusiastic about this opportunity and would be happy to discuss my qualifications further during an interview.";
}
