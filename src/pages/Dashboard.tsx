import { Menu, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import ChatInput from '../components/Chat/ChatInput';
import ChatMessage from '../components/Chat/ChatMessage';
import { generateResponse } from '../services/geminiService';

interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  media?: MediaAttachment[];
  isLoading?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you with legal document analysis today?',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  }
];

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);

  // Map our messages to the format expected by the Gemini API
  const getChatHistory = () => {
    return messages
      .filter(msg => !msg.isLoading)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
        content: msg.content
      }));
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (isProcessing) return;
    
    const mediaAttachments: MediaAttachment[] = [];
    
    if (files && files.length > 0) {
      files.forEach(file => {
        const fileType = file.type.startsWith('image/') ? 'image' as const : 'video' as const;
        mediaAttachments.push({
          type: fileType,
          url: URL.createObjectURL(file)
        });
      });
    }

    // Add the user's message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      media: mediaAttachments.length > 0 ? mediaAttachments : undefined
    };

    // Add a loading message for the AI response
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsProcessing(true);

    try {
      // Get chat history for context
      const chatHistory = getChatHistory();
      
      // Send to Gemini API and get response
      const response = await generateResponse(content, chatHistory);

      // Update the loading message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: response, isLoading: false } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Update the loading message with an error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { 
                ...msg, 
                content: 'Sorry, I encountered an error processing your request. Please try again.', 
                isLoading: false 
              } 
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat list would go here */}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Legal Document Analysis</h2>
              <p className="text-sm text-gray-500">with AI Assistant</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}