import React from 'react';
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    uiVariant?: 'default' | 'rex';
    formClassName?: string;
    containerClassName?: string;
    textareaClassName?: string;
    buttonClassName?: string;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
