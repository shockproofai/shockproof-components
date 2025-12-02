import React from "react";
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
export declare const TimingInfo: React.FC<TimingInfoProps>;
export {};
