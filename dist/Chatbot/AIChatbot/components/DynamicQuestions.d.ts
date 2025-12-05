import React from "react";
import { ChatQuestion } from "../types";
declare const FALLBACK_QUESTIONS: ChatQuestion[];
interface DynamicQuestionsProps {
    onQuestionClick: (question: string, questionData?: {
        topicDescription?: string;
        contextHints?: string[];
    }) => void;
    isLoading: boolean;
    questions?: ChatQuestion[];
    maxInitialQuestions?: number;
    fallbackQuestions?: ChatQuestion[];
    hideShowMoreButton?: boolean;
    uiVariant?: 'default' | 'rex';
}
export { FALLBACK_QUESTIONS };
export declare const DynamicQuestions: React.FC<DynamicQuestionsProps>;
