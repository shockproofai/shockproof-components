import React, { useState } from "react";
import { Card } from "../../shared/components/ui/card";
import { Badge } from "../../shared/components/ui/badge";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  streamingContent?: string;
  debugStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  streamingContent, 
  debugStreaming = false 
}) => {
  const isUser = message.role === "user";
  const isLoading = message.isLoading;
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  // Debug logging
  if (debugStreaming) {
    console.log(`[${new Date().toISOString()}] 🎨 MessageBubble render:`, {
      isLoading,
      streamingContentLength: streamingContent?.length || 0,
      streamingContentPreview: streamingContent ? streamingContent.substring(0, 50) + '...' : 'none'
    });
  }

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4 items-start`}
    >
      {/* Shockproof icon for assistant messages only */}
      {!isUser && (
        <img 
          src="/shockproof-icon.png" 
          alt="Rex" 
          className="flex-shrink-0 w-8 h-8"
        />
      )}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? "flex justify-end" : ""}`}>
        <div className={`${isUser ? "inline-flex flex-col" : "w-full"}`}>
          <Card
            className={`${
              isUser 
                ? "p-3 inline-block bg-blue-100 text-blue-900 border border-blue-200"
                : "p-0 bg-transparent border-0"
            } ${isUser ? "inline-block" : (streamingContent ? "w-full" : "max-w-[95%]")} min-w-0 break-words`}
            style={{ wordWrap: "break-word", overflowWrap: "anywhere" }}
          >
            {/* Message Text */}
            {isLoading ? (
              streamingContent ? (
                // Show streaming content in the main message area
                <div className="prose prose-sm prose-slate max-w-none break-words prose-headings:font-semibold prose-headings:text-gray-900 prose-p:my-2 prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-table:text-sm prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-td:border prose-td:border-gray-200">
                  <ReactMarkdown
                    children={typeof streamingContent === 'string' ? streamingContent : String(streamingContent || '')}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: (props) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  />
                  {/* Streaming indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    <span className="text-xs text-blue-500">Streaming response...</span>
                  </div>
                </div>
              ) : (
                // Show loading spinner when no streaming content yet
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              )
            ) : (
              // Show final message content
              <div className="prose prose-sm prose-slate max-w-none break-words prose-headings:font-semibold prose-headings:text-gray-900 prose-p:my-2 prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-table:text-sm prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-td:border prose-td:border-gray-200">
                <ReactMarkdown
                  children={typeof message.content === 'string' ? message.content : String(message.content || '')}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                />
              </div>
            )}
          </Card>

          {/* Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className={`mt-2 ${isUser ? "flex justify-end" : ""}`}>
              <div className={`${isUser ? "inline-block" : "max-w-[95%]"}`}>
                <div className="text-xs text-gray-500 mb-1">
                  <button
                    onClick={() => setSourcesExpanded(!sourcesExpanded)}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Sources ({message.sources.length})</span>
                    {sourcesExpanded ? (
                      <span>▼</span>
                    ) : (
                      <span>▶</span>
                    )}
                  </button>
                </div>
                
                {sourcesExpanded && (
                  <div className="space-y-1">
                    {message.sources.map((source, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs mr-1 mb-1"
                      >
                        {source.filename || source.path || `Source ${index + 1}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          {message.timestamp && (
            <div className={`text-xs text-gray-400 mt-1 ${isUser ? "text-right" : "text-left"}`}>
              {new Date(message.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};