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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          {message.media && message.media.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.media.map((media, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
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
              <p className="text-sm">Generating response...</p>
            </div>
          ) : (
            <div className="markdown-content text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          <p className={`text-xs mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}