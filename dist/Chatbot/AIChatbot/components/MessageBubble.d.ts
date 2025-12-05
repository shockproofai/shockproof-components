import React from "react";
import { ChatMessage } from "../types";
interface MessageBubbleProps {
    message: ChatMessage;
    streamingContent?: string;
    debugStreaming?: boolean;
}
export declare const MessageBubble: React.FC<MessageBubbleProps>;
export {};
