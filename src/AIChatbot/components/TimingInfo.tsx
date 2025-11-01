import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/components/ui/card";
import { Badge } from "../../shared/components/ui/badge";
import { Button } from "../../shared/components/ui/button";
import {
  Clock,
  Database,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Hash,
  Layers,
  Radio,
  Package,
} from "lucide-react";
import { ChatResponse } from "../types";

interface TimingInfoProps {
  timings?: Record<string, number>;
  agentName?: string;
  actualTotalTime?: number;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cumulativeTokenUsage?: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    responseCount: number;
  };
  streamingMetrics?: {
    wasStreamed: boolean;
    chunkCount: number;
    totalContentLength: number;
    streamingThreshold: number;
    timeToFirstChunkMs?: number;
    streamingDurationMs?: number;
    bufferingReason?: 'threshold' | 'delay' | 'immediate' | 'error';
    averageChunkSize?: number;
  };
  response?: ChatResponse;
  className?: string;
}

export const TimingInfo: React.FC<TimingInfoProps> = ({
  timings,
  agentName,
  actualTotalTime,
  tokenUsage,
  cumulativeTokenUsage,
  streamingMetrics,
  response,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use response data if available, otherwise use individual props
  const effectiveTimings = timings || response?.timings;
  const effectiveTokenUsage = tokenUsage || response?.tokenUsage;
  const effectiveStreamingMetrics = streamingMetrics || response?.streamingMetrics;
  const effectiveTotalTime = actualTotalTime || response?.searchTime;

  if (!effectiveTimings && !effectiveTokenUsage && !cumulativeTokenUsage && !effectiveStreamingMetrics) {
    return null;
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) {
      return `${tokens}`;
    } else if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
  };

  const getTimingIcon = (key: string) => {
    if (key.includes("embedding") || key.includes("Embedding")) {
      return <Zap className="w-3 h-3" />;
    }
    if (
      key.includes("search") ||
      key.includes("Search") ||
      key.includes("vector") ||
      key.includes("Vector")
    ) {
      return <Database className="w-3 h-3" />;
    }
    return <Clock className="w-3 h-3" />;
  };

  const getTimingColor = (ms: number): "default" | "secondary" | "destructive" => {
    if (ms < 500) return "secondary"; // Fast - green-ish
    if (ms < 2000) return "default"; // Medium - blue
    return "destructive"; // Slow - red
  };

  const getTTFCColor = (ms: number): "default" | "secondary" | "destructive" => {
    if (ms < 200) return "secondary"; // Excellent - green
    if (ms < 500) return "default"; // Good - blue
    return "destructive"; // Slow - red
  };

  const getTokenColor = (tokens: number): "default" | "secondary" | "destructive" => {
    if (tokens < 1000) return "secondary"; // Low usage - green-ish
    if (tokens < 10000) return "default"; // Medium usage - blue
    return "destructive"; // High usage - red
  };

  const hasTimingData = effectiveTimings && Object.keys(effectiveTimings).length > 0;

  // Helper function to clean up timing labels
  const getTimingLabel = (key: string): string => {
    return key
      .replace(/TimeMs|Ms$/i, "")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getTotalTime = (): number => {
    // Use the actual total time if provided, otherwise sum components
    if (effectiveTotalTime) {
      return effectiveTotalTime;
    }
    if (hasTimingData) {
      return Object.values(effectiveTimings!).reduce((sum, time) => sum + time, 0);
    }
    return 0;
  };

  const sortedTimings = hasTimingData
    ? Object.entries(effectiveTimings!).sort(([, a], [, b]) => b - a)
    : [];
  const totalTime = getTotalTime();

  // Expanded view
  if (isExpanded) {
    return (
      <Card className={`border-t-0 rounded-t-none bg-gray-50/50 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {hasTimingData ? (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Performance Breakdown
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4" />
                  Token Usage
                </>
              )}
              {agentName && (
                <Badge variant="outline" className="text-xs">
                  {agentName === "askRex" ? "Ask Rex" : "Ask Rex Test"}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {/* Total Time - only show if we have timing data */}
            {hasTimingData && totalTime > 0 && (
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    Total Processing Time
                  </span>
                </div>
                <Badge
                  variant={getTimingColor(totalTime)}
                  className="font-mono"
                >
                  {formatTime(totalTime)}
                </Badge>
              </div>
            )}

            {/* Individual Timings - only show if we have timing data */}
            {hasTimingData && (
              <div className="space-y-2">
                {sortedTimings.map(([key, value]) => {
                  const percentage = totalTime > 0 ? ((value / totalTime) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-white/70 rounded border-l-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {getTimingIcon(key)}
                        <span className="text-sm">{getTimingLabel(key)}</span>
                        <div className="flex-1 mx-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 min-w-10">
                          {percentage}%
                        </span>
                      </div>
                      <Badge
                        variant={getTimingColor(value)}
                        className="font-mono text-xs ml-2"
                      >
                        {formatTime(value)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Streaming Metrics */}
            {effectiveStreamingMetrics && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Streaming Performance
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">Was Streamed</span>
                    <Badge variant={effectiveStreamingMetrics.wasStreamed ? "secondary" : "outline"} className="text-xs">
                      {effectiveStreamingMetrics.wasStreamed ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  {effectiveStreamingMetrics.timeToFirstChunkMs && (
                    <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                      <span className="text-sm">Time to First Chunk</span>
                      <Badge 
                        variant={getTTFCColor(effectiveStreamingMetrics.timeToFirstChunkMs)}
                        className="text-xs font-mono"
                      >
                        {formatTime(effectiveStreamingMetrics.timeToFirstChunkMs)}
                      </Badge>
                    </div>
                  )}
                  
                  {effectiveStreamingMetrics.streamingDurationMs && (
                    <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                      <span className="text-sm">Streaming Duration</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {formatTime(effectiveStreamingMetrics.streamingDurationMs)}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">Chunks Sent</span>
                    <Badge variant="outline" className="text-xs">
                      {effectiveStreamingMetrics.chunkCount}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">Threshold</span>
                    <Badge variant="outline" className="text-xs">
                      {effectiveStreamingMetrics.streamingThreshold}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Token Usage */}
            {(effectiveTokenUsage || cumulativeTokenUsage) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Token Usage
                </h4>
                <div className="space-y-1">
                  {effectiveTokenUsage && (
                    <>
                      <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                        <span className="text-sm">Input Tokens</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {formatTokens(effectiveTokenUsage.inputTokens)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                        <span className="text-sm">Output Tokens</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {formatTokens(effectiveTokenUsage.outputTokens)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                        <span className="text-sm">Current Response Total</span>
                        <Badge 
                          variant={getTokenColor(effectiveTokenUsage.totalTokens)}
                          className="text-xs font-mono"
                        >
                          {formatTokens(effectiveTokenUsage.totalTokens)}
                        </Badge>
                      </div>
                    </>
                  )}

                  {cumulativeTokenUsage && cumulativeTokenUsage.responseCount > 0 && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium">
                            Session ({cumulativeTokenUsage.responseCount})
                          </span>
                          <Badge 
                            variant={getTokenColor(cumulativeTokenUsage.totalTokens)}
                            className="text-xs font-mono"
                          >
                            {formatTokens(cumulativeTokenUsage.totalTokens)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                          <span className="text-sm">Session Input Total</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {formatTokens(cumulativeTokenUsage.totalInputTokens)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                          <span className="text-sm">Session Output Total</span>
                          <Badge 
                            variant={getTokenColor(
                              cumulativeTokenUsage.totalOutputTokens
                            )}
                            className="text-xs font-mono"
                          >
                            {formatTokens(cumulativeTokenUsage.totalOutputTokens)}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search Results */}
            {response && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Search Results
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">Sources Found</span>
                    <Badge variant="outline" className="text-xs">
                      {response.sources?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">Total Documents</span>
                    <Badge variant="outline" className="text-xs">
                      {response.totalDocuments || 0}
                    </Badge>
                  </div>
                  
                  {response.confidence && (
                    <div className="flex items-center justify-between p-2 bg-white/70 rounded">
                      <span className="text-sm">Confidence Score</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(response.confidence * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Collapsed view - show compact summary
  return (
    <Card className={`border-t-0 rounded-t-none bg-gray-50/50 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BarChart3 className="w-3 h-3" />
            <span className="font-medium">Performance:</span>
          </div>

          {/* Total time badge */}
          {hasTimingData && totalTime > 0 && (
            <Badge
              variant={getTimingColor(totalTime)}
              className="text-xs flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Total:</span>
              <span className="font-mono">{formatTime(totalTime)}</span>
            </Badge>
          )}

          {/* Show top 2 timing categories */}
          {hasTimingData && sortedTimings.slice(0, 2).map(([key, value]) => (
            <Badge
              key={key}
              variant={getTimingColor(value)}
              className="text-xs flex items-center gap-1"
            >
              {getTimingIcon(key)}
              <span className="capitalize">{getTimingLabel(key)}:</span>
              <span className="font-mono">{formatTime(value)}</span>
            </Badge>
          ))}

          {/* Token usage badge */}
          {effectiveTokenUsage && (
            <Badge 
              variant={getTokenColor(effectiveTokenUsage.totalTokens)}
              className="text-xs flex items-center gap-1"
            >
              <Package className="w-3 h-3" />
              <span className="font-mono">{formatTokens(effectiveTokenUsage.totalTokens)}</span>
            </Badge>
          )}

          {/* Cumulative token usage */}
          {cumulativeTokenUsage && cumulativeTokenUsage.responseCount > 0 && (
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 h-5"
            >
              <Layers className="w-3 h-3" />
              <span className="font-mono">
                {formatTokens(cumulativeTokenUsage.totalTokens)}
              </span>
              <span className="text-gray-500">
                ({cumulativeTokenUsage.responseCount})
              </span>
            </Badge>
          )}

          {/* Streaming metrics badge */}
          {effectiveStreamingMetrics && (
            <Badge
              variant={effectiveStreamingMetrics.wasStreamed ? "default" : "secondary"}
              className="text-xs flex items-center gap-1 h-5"
            >
              {effectiveStreamingMetrics.wasStreamed ? (
                <>
                  <Radio className="w-3 h-3" />
                  <span>Streamed ({effectiveStreamingMetrics.chunkCount})</span>
                </>
              ) : (
                <>
                  <Package className="w-3 h-3" />
                  <span>Buffered</span>
                </>
              )}
            </Badge>
          )}

          {/* Show TTFC badge if available and noteworthy */}
          {effectiveStreamingMetrics?.timeToFirstChunkMs !== undefined && effectiveStreamingMetrics.timeToFirstChunkMs < 500 && (
            <Badge
              variant={getTTFCColor(effectiveStreamingMetrics.timeToFirstChunkMs)}
              className="text-xs flex items-center gap-1 h-5"
            >
              <Clock className="w-3 h-3" />
              <span>TTFC: {formatTime(effectiveStreamingMetrics.timeToFirstChunkMs)}</span>
            </Badge>
          )}

          {agentName && (
            <Badge variant="outline" className="text-xs">
              {agentName === "askRex" ? "Ask Rex" : "Ask Rex Test"}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="h-6 w-6 p-0 ml-1"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};