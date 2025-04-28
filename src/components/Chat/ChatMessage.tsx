import { Loader2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
}

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    media?: MediaAttachment[];
    isLoading?: boolean;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 transition-all`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-[85%]`}>
        <div className={`w-9 h-9 rounded-full ${isUser ? 'bg-indigo-500' : 'bg-gray-700'} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <User className="w-5 h-5 text-white" />
        </div>
        <div
          className={`px-5 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none'
              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
          } transition-all duration-200 hover:shadow-md`}
        >
          {message.media && message.media.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.media.map((media, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-sm">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt="Attached image"
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <video
                      controls
                      className="max-w-full h-auto rounded-lg"
                    >
                      <source src={media.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          )}
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm font-medium">Generating response...</p>
            </div>
          ) : (
            <div className={`markdown-content text-sm ${isUser ? '' : 'text-gray-800'}`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          <p className={`text-xs mt-2 ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}