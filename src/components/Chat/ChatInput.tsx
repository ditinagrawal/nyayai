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
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {mediaFiles.length > 0 && (
        <div className="p-3 flex gap-3 overflow-x-auto bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group animate-fade-in">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                {media.type === 'image' ? (
                  <img
                    src={media.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-10 h-10 text-[var(--text-secondary)]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeMedia(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-all duration-200 transform hover:scale-110"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-3">
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
            className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-tertiary)] rounded-full transition-colors duration-200"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] focus-within:border-[var(--accent-color)] rounded-2xl px-4 py-2 border border-[var(--border-color)] transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] text-[var(--text-primary)] outline-none"
              rows={1}
            />
          </div>
          <button
            type="button"
            className="p-2.5 text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors duration-200"
            title="Insert emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="p-3 text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] rounded-full transition-all duration-200 shadow-md disabled:opacity-50 disabled:shadow-none transform hover:scale-105 active:scale-95"
            disabled={!message.trim() && mediaFiles.length === 0}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}