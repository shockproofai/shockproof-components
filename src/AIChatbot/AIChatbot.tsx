// Main AIChatbot component
import React, { useEffect, useRef, useState } from 'react';
import { ChatProvider, ChatbotConfig, AIChatbotProps } from './types';
import { useChatState } from './hooks/useChatState';
import { MessageBubble, ChatInput, TimingInfo, DynamicQuestions } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card';
import { Button } from '../shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/components/ui/select';
import { Badge } from '../shared/components/ui/badge';
import { Alert, AlertDescription } from '../shared/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shared/components/ui/tooltip';
import { Bot, Sparkles, AlertCircle, RefreshCw, Info, Zap, Database, Cloud, Trash2 } from 'lucide-react';
import { CumulativeTokenUsage } from '../shared/types';

/**
 * AIChatbot - A reusable chat interface component
 * 
 * This component provides a complete chat interface that can work with
 * any provider implementation (Firebase, REST API, etc.)
 */
export function AIChatbot({
  provider,
  config = {},
  onMessageSent,
  onMessageReceived,
  onError,
  onSessionStart,
  onSessionEnd,
  className = '',
  style,
  user
}: AIChatbotProps) {
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Local state for streaming threshold
  const [streamingThreshold, setStreamingThreshold] = React.useState<number>(
    config.streamingThreshold || 300
  );

  // Merge local streaming threshold into config for useChatState
  const effectiveConfig = React.useMemo(() => ({
    ...config,
    streamingThreshold
  }), [config, streamingThreshold]);

  // Use our custom hook for state management
  const {
    messages,
    isLoading,
    isStreaming,
    streamingMessage,
    error,
    sessionId,
    selectedAgent,
    lastResponse,
    streamingMetrics,
    sendMessage,
    clearMessages,
    retryLastMessage,
    setSelectedAgent,
    updateStreamingThreshold,
    startNewSession,
  } = useChatState({
    provider,
    config: effectiveConfig,
    onMessageSent,
    onMessageReceived,
    onError,
    user
  });

  // Track cumulative token usage across the session
  const [cumulativeTokenUsage, setCumulativeTokenUsage] = useState<CumulativeTokenUsage>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    responseCount: 0
  });

  // Load questions from provider if not provided in config
  const [loadedQuestions, setLoadedQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Load chatbot config from provider (Firestore config/app)
  const [firestoreConfig, setFirestoreConfig] = useState<Record<string, any>>({});
  const [configLoading, setConfigLoading] = useState(false);

  // Load config from provider if available
  React.useEffect(() => {
    if (provider.getChatbotConfig && !configLoading && Object.keys(firestoreConfig).length === 0) {
      console.log('[AIChatbot] Loading config from provider...');
      setConfigLoading(true);
      provider.getChatbotConfig()
        .then((cfg) => {
          console.log('[AIChatbot] Loaded Firestore config:', cfg);
          setFirestoreConfig(cfg);
          setConfigLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load chatbot config from provider:', error);
          setConfigLoading(false);
        });
    }
  }, [provider, configLoading, firestoreConfig]);

  React.useEffect(() => {
    // Only load from provider if no questions in config and provider has getQuestions
    if (!config.questions && provider.getQuestions && !questionsLoading && loadedQuestions.length === 0) {
      console.log('[AIChatbot] Loading questions from provider...');
      setQuestionsLoading(true);
      provider.getQuestions()
        .then((questions) => {
          console.log('[AIChatbot] Loaded questions from provider:', questions.length, 'questions');
          setLoadedQuestions(questions);
          setQuestionsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load questions from provider:', error);
          setQuestionsLoading(false);
        });
    }
  }, [config.questions, provider, questionsLoading, loadedQuestions.length]);

  // Use loaded questions if config doesn't provide them
  const questionsToUse = config.questions || loadedQuestions;

  // Sync streaming threshold with config changes
  React.useEffect(() => {
    if (config.streamingThreshold !== undefined && config.streamingThreshold !== streamingThreshold) {
      setStreamingThreshold(config.streamingThreshold);
    }
  }, [config.streamingThreshold]);

  
  // Notify session start
  React.useEffect(() => {
    if (sessionId && onSessionStart) {
      onSessionStart(sessionId);
    }
  }, [sessionId, onSessionStart]);

  // Update cumulative token usage when we get a new response
  React.useEffect(() => {
    if (lastResponse?.tokenUsage) {
      setCumulativeTokenUsage((prev: CumulativeTokenUsage) => ({
        totalInputTokens: prev.totalInputTokens + lastResponse.tokenUsage!.inputTokens,
        totalOutputTokens: prev.totalOutputTokens + lastResponse.tokenUsage!.outputTokens,
        totalTokens: prev.totalTokens + lastResponse.tokenUsage!.totalTokens,
        responseCount: prev.responseCount + 1
      }));
    }
  }, [lastResponse]);

  // Reset cumulative usage when messages are cleared
  React.useEffect(() => {
    if (messages.length === 0) {
      setCumulativeTokenUsage({
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        responseCount: 0
      });
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive (not streaming updates)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Only scroll on new messages, not streaming content

  // Handle streaming threshold change
  const handleStreamingThresholdChange = (value: string) => {
    const threshold = parseInt(value);
    setStreamingThreshold(threshold); // Update local state
    updateStreamingThreshold(threshold); // Persist to Firestore
  };

  // Handle question click from DynamicQuestions
  const handleQuestionClick = (question: string, questionData?: {
    topicDescription?: string;
    contextHints?: string[];
  }) => {
    sendMessage(question);
  };

  // Handle agent switching
  const handleAgentChange = (agent: string) => {
    setSelectedAgent(agent);
  };

  // Handle retry
  const handleRetry = () => {
    retryLastMessage();
  };

  // Handle new chat
  const handleNewChat = () => {
    clearMessages();
    startNewSession();
  };
  
  return (
    <div 
      className={`flex flex-col h-full max-h-screen ${className}`}
      style={style}
      data-theme={config.theme || 'auto'}
    >
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>   
                <CardTitle className="flex items-center gap-2">
                  {config.title || "Ask Rex"}
                </CardTitle>
                {config.subtitle && (
                  <p className="text-sm text-gray-600">{config.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Agent Selector */}
              {(() => {
                const shouldShow = (firestoreConfig.showAgentSelector ?? config.showAgentSwitcher ?? config.showAgentSelector) && provider.getAvailableAgents;
                console.log('[AIChatbot] Agent selector should show:', shouldShow, {
                  firestoreShowAgent: firestoreConfig.showAgentSelector,
                  configShowSwitcher: config.showAgentSwitcher,
                  configShowAgent: config.showAgentSelector,
                  hasGetAvailableAgents: !!provider.getAvailableAgents
                });
                return shouldShow;
              })() && (
                <Select value={selectedAgent || ''} onValueChange={handleAgentChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {provider.getAvailableAgents?.().map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        <div className="flex items-center gap-2">
                          {agent === 'askRex' ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {agent}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Streaming Threshold */}
              {config.enableStreaming && (firestoreConfig.showStreamingSelector ?? config.showStreamingSelector) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Select 
                          value={streamingThreshold.toString()} 
                          onValueChange={handleStreamingThresholdChange}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            <SelectItem value="0">Always Stream</SelectItem>
                            <SelectItem value="300">300 chars</SelectItem>
                            <SelectItem value="500">500 chars</SelectItem>
                            <SelectItem value="1000">1K chars</SelectItem>
                            <SelectItem value="1500">1.5K chars</SelectItem>
                            <SelectItem value="2000">2K chars</SelectItem>
                            <SelectItem value="999999">Never Stream</SelectItem>
                          </SelectContent>
                        </Select>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs z-50">
                      <div className="space-y-2">
                        <p className="font-semibold">Streaming Threshold</p>
                        <p className="text-sm">
                          Controls when responses stream word-by-word vs appear all-at-once.
                        </p>
                        <p className="text-sm">
                          Numbers indicate minimum characters before streaming begins.
                        </p>
                        <ul className="text-xs space-y-1 mt-2">
                          <li>• <strong>Always Stream:</strong> All responses stream instantly</li>
                          <li>• <strong>300-2K:</strong> Only responses above threshold stream</li>
                          <li>• <strong>Never Stream:</strong> Wait for complete response</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <RefreshCw className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Messages Area */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4">
              {/* Welcome Message */}
              {config.welcomeMessage && (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Welcome to Ask Rex!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {config.welcomeMessage}
                    </p>
                  </div>
                </>
              )}
              
              {/* Dynamic Questions - Show below welcome message */}
              {config.enableQuestions && (
                <DynamicQuestions
                  onQuestionClick={handleQuestionClick}
                  isLoading={isLoading}
                  questions={questionsToUse}
                  maxInitialQuestions={config.maxInitialQuestions}
                  fallbackQuestions={config.fallbackQuestions}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4 break-words" style={{ wordWrap: "break-word", overflowWrap: "anywhere" }}>
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const shouldShowStreaming = isStreaming && isLastMessage && streamingMessage;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    streamingContent={shouldShowStreaming ? streamingMessage : undefined}
                    debugStreaming={config.debugStreaming}
                  />
                );
              })}

              {/* Standalone streaming message when no messages exist yet */}
              {isStreaming && streamingMessage && messages.length === 0 && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: '',
                    isLoading: true,
                    timestamp: new Date(),
                  }}
                  streamingContent={streamingMessage}
                  debugStreaming={config.debugStreaming}
                />
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Timing Information */}
      {config.showTimingInfo && lastResponse && (
        <TimingInfo
          timings={lastResponse.timings || {}}
          agentName={selectedAgent as "askRex" | "askRexTest"}
          actualTotalTime={lastResponse.searchTime}
          tokenUsage={lastResponse.tokenUsage}
          cumulativeTokenUsage={
            cumulativeTokenUsage.responseCount > 0 
              ? cumulativeTokenUsage 
              : undefined
          }
          streamingMetrics={lastResponse.streamingMetrics}
        />
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        placeholder={config.placeholder}
        disabled={!provider || !!error}
      />
    </div>
  );
}

// Display name for debugging
AIChatbot.displayName = 'AIChatbot';
