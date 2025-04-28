import { Menu, Search, Settings, PlusCircle, BarChart, MessagesSquare, BookOpen, X, MessageCircle, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-indigo-600" />
              NyayAI
            </h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex justify-between items-center mb-3 px-2">
            <h2 className="font-medium text-gray-700 text-sm">Recent Conversations</h2>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </button>
          </div>
          
          {/* Sample conversation list */}
          <div className="space-y-1">
            <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 text-indigo-600 mr-2" />
                  <span className="font-medium text-gray-800">Legal Document Analysis</span>
                </div>
                <span className="text-xs text-gray-500">Now</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">Active conversation</p>
            </div>
            
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-700">Previous Case {i + 1}</span>
                  </div>
                  <span className="text-xs text-gray-500">{i + 1}d ago</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">Last message preview...</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between mb-2">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 flex items-center transition-colors">
              <BarChart className="w-4 h-4 mr-1" /> Dashboard
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 flex items-center transition-colors">
              <BookOpen className="w-4 h-4 mr-1" /> Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Legal Document Analysis</h2>
              <p className="text-sm text-gray-500">with NyayAI Assistant</p>
            </div>
            <div className="flex items-center">
              <button className="p-2 hover:bg-gray-100 rounded-lg mx-1 transition-colors">
                <MessagesSquare className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg mx-1 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-red-100 rounded-lg mx-1 transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-4 mb-4">
              <p className="text-sm text-gray-500 border-b border-gray-200 pb-3 mb-3">Today</p>
            </div>
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-gray-50 px-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}