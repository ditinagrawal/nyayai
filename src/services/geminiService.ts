import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ 
  model: GEMINI_MODEL,
  systemInstruction: "You are a judge in a court of law. Your task is to provide legal advice and opinions based on the information provided to you. Please ensure that your responses are clear, concise, and relevant to the legal matters at hand.",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Type for chat history
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Send a message to the Gemini API and get a response
 * @param prompt The user's message
 * @param chatHistory Optional chat history for context
 * @returns The model's response
 */
export async function generateResponse(
  prompt: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });

    // Add chat history if provided
    for (const message of chatHistory) {
      if (message.role === 'user') {
        await chat.sendMessage(message.content);
      }
    }

    // Send the prompt to the model
    const result = await chat.sendMessage(prompt);
    
    // Return the response text
    return result.response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 