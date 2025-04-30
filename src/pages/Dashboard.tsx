import { Bot, FileVideo, PlayCircle, Search, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatInput from '../components/Chat/ChatInput';
import ChatMessage from '../components/Chat/ChatMessage';
import { generateResponse } from '../services/geminiService';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

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

// Example suggested sections
const suggestedSections = [
  'Bharatiya Nyaya Sanhita (BNS)',
  'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
  'Bharatiya Sakshya Adhiniyam, 2023',
  'Criminal Defamation',
  'Cyber Crimes',
  'Digital Evidence'
];

// Example recent questions
const recentQuestions = [
  'What are the penalties for defamation under BNS?',
  'How is digital evidence handled under the new laws?',
  'What changes were made to bail provisions?',
  'Explain the procedure for filing an FIR under BNSS',
  'What is the punishment for cyber terrorism?'
];

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'query' | 'video'>('query');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setActiveTab('video');
    }
  };

  const handleRecentQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleSuggestedSectionClick = (section: string) => {
    handleSendMessage(`Tell me about ${section}`);
  };

  const handleAnalyzeVideo = () => {
    if (videoUrl) {
      handleSendMessage(`Analyze this video for legal implications. It contains footage relevant to legal matters.`);
    }
  };

  return (
    <div className="h-screen flex flex-col dark-theme bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Navbar */}
      <div className="border-b border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-[var(--accent-color)] mr-2" />
            <h1 className="text-xl font-bold">NyayAI</h1>
          </div>
          <div>
          <SignedIn>
        <UserButton />
      </SignedIn>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4">
        <div className="max-w-7xl w-full mx-auto flex gap-4 h-full">
          {/* Left Sidebar - Recent Questions */}
          <div className="w-64 flex flex-col panel-border bg-[var(--bg-secondary)] overflow-hidden">
            <div className="p-3 border-b border-[var(--border-color)]">
              <h2 className="font-medium text-center">Recent Asked Questions</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {recentQuestions.map((question, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => handleRecentQuestionClick(question)}
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main Content Panel */}
            <div className="flex-1 panel-border bg-[var(--bg-secondary)] overflow-hidden flex flex-col">
              <div className="p-3 border-b border-[var(--border-color)] flex">
                <div 
                  onClick={() => setActiveTab('query')}
                  className={`cursor-pointer px-3 py-1 rounded-lg mr-2 ${activeTab === 'query' ? 'bg-[var(--accent-color)]' : 'hover:bg-[var(--bg-tertiary)]'}`}
                >
                  Query Box
                </div>
                <div 
                  onClick={() => videoUrl && setActiveTab('video')}
                  className={`cursor-pointer px-3 py-1 rounded-lg ${activeTab === 'video' ? 'bg-[var(--accent-color)]' : videoUrl ? 'hover:bg-[var(--bg-tertiary)]' : 'opacity-50 cursor-not-allowed'}`}
                >
                  Video Analysis
                </div>
              </div>

              {activeTab === 'query' ? (
                /* Query Chat Area */
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Video Analysis Area */
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
                  {videoUrl ? (
                    <div className="w-full">
                      <video 
                        controls 
                        className="max-h-96 rounded-lg mx-auto shadow-lg"
                        src={videoUrl}
                      />
                      <div className="mt-4 text-center">
                        <p className="mb-2">{uploadedVideo?.name}</p>
                        <button 
                          onClick={handleAnalyzeVideo}
                          className="px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors inline-flex items-center"
                        >
                          <PlayCircle className="w-5 h-5 mr-2" />
                          Analyze Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-[var(--text-secondary)]">
                      <p>No video uploaded yet.</p>
                      <p>Please upload a video from the right panel.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Input Area */}
              {activeTab === 'query' && (
                <div className="border-t border-[var(--border-color)]">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 flex flex-col gap-4">
            {/* Suggested Sections */}
            <div className="panel-border bg-[var(--bg-secondary)] flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b border-[var(--border-color)]">
                <h2 className="font-medium text-center">Suggested Sections</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {suggestedSections.map((section, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => handleSuggestedSectionClick(section)}
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Video */}
            <div className="panel-border bg-[var(--bg-secondary)] overflow-hidden flex-1">
              <div className="p-3 border-b border-[var(--border-color)]">
                <h2 className="font-medium text-center">
                  {videoUrl ? 'Video Uploaded' : 'Upload Video'}
                </h2>
              </div>
              <div className="p-4 flex flex-col items-center justify-center h-[calc(100%-43px)]">
                {videoUrl ? (
                  <div className="text-center">
                    <FileVideo className="w-10 h-10 mx-auto mb-2 text-[var(--accent-color)]" />
                    <p className="text-sm mb-1 truncate max-w-full">{uploadedVideo?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {uploadedVideo?.size ? `${(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                    </p>
                    <button 
                      onClick={() => {
                        setUploadedVideo(null);
                        setVideoUrl(null);
                        setActiveTab('query');
                      }}
                      className="mt-2 p-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-1" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer mx-auto hover:bg-[var(--border-color)] transition-colors"
                    >
                      <Upload className="w-12 h-12 text-[var(--accent-color)]" />
                    </div>
                    <p className="mt-3 text-sm">Click to upload a video</p>
                    <p className="text-xs text-[var(--text-secondary)]">MP4, MOV, AVI up to 100MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}