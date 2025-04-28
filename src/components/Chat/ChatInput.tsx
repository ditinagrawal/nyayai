import { FileVideo, Paperclip, Send, Smile, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface MediaPreview {
  file: File;
  type: 'image' | 'video';
  previewUrl: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, media?: File[]) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || mediaFiles.length > 0) {
      onSendMessage(message, mediaFiles.map(m => m.file));
      setMessage('');
      setMediaFiles([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        setMediaFiles(prev => [...prev, {
          file,
          type,
          previewUrl
        }]);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {mediaFiles.length > 0 && (
        <div className="p-2 flex gap-2 overflow-x-auto">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'image' ? (
                  <img
                    src={media.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeMedia(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px]"
              rows={1}
            />
          </div>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-600 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={!message.trim() && mediaFiles.length === 0}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}