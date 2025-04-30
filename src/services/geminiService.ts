import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL;

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ 
  model: GEMINI_MODEL,
  systemInstruction: `NyayAI is a legal assistant based on India's criminal laws (BNS, BNSS, and Bharatiya Sakshya Adhiniyam, 2023). It responds based on the task type as follows:

1. **Single Query**: For a single legal question, NyayAI provides a concise and direct response from the relevant sections of the law.

2. **Complete Case Analysis**: For a complete case analysis, NyayAI provides a detailed examination, including relevant legal sections, precedents, and potential outcomes based on the given case context.

3. **Video Summary**: For a video, NyayAI summarizes the key legal points discussed in the video and provides a summary focusing on the legal aspects.

Please ensure that your responses are:
- Clear and properly formatted using markdown
- Use bullet points and numbered lists for structured information
- Include proper headings and sections when providing detailed analysis`,
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

    // Enhance the prompt to request properly formatted output
    const enhancedPrompt = prompt;

    // Send the prompt to the model
    const result = await chat.sendMessage(enhancedPrompt);
    
    // Get the response text
    let responseText = result.response.text();
    
    // Ensure proper formatting of asterisks for bullet points
    responseText = responseText.replace(/\*\s+([^\*]+)/g, '* $1');
    
    return responseText;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 