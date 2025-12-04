import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../shared/components/ui/button';
import { Textarea } from '../../shared/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  uiVariant?: 'default' | 'rex';
  formClassName?: string; // Custom className for form wrapper
  containerClassName?: string; // Custom className for input container (use --chat-input-bg CSS variable to control background color)
  textareaClassName?: string; // Custom className for textarea
  buttonClassName?: string; // Custom className for submit button
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Ask a question...",
  disabled = false,
  uiVariant = 'default',
  formClassName,
  containerClassName,
  textareaClassName,
  buttonClassName
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Rex variant: broader, multiline, rounded bordered input (both empty and non-empty states)
  if (uiVariant === 'rex') {
    return (
      <form onSubmit={handleSubmit} className={formClassName || "w-full mx-auto"}>
        <div className={containerClassName || "relative flex items-end gap-3 p-5 rounded-[28px] border border-gray-200 transition-shadow bg-[var(--chat-input-bg,hsl(var(--input)))]"}>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className={textareaClassName || "flex-1 min-h-[120px] max-h-60 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed bg-transparent"}
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading || disabled}
            size="icon"
            className={buttonClassName || "rounded-full h-12 w-12 flex-shrink-0 mb-1"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Default variant: standard bottom input
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-white border-t">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading || disabled}
        size="sm"
        className="self-end"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};