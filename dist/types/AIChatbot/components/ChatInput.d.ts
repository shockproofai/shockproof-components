import React from 'react';
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    uiVariant?: 'default' | 'rex';
    isEmptyState?: boolean;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
