import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../../shared/components/ui/button";
import { Badge } from "../../shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shared/components/ui/tooltip";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ChatQuestion } from "../types";

// Fallback questions defined outside component to prevent recreation
const FALLBACK_QUESTIONS: ChatQuestion[] = [
  {
    id: "1",
    question: "What is cash flow analysis?",
    contextHints: ["operating cash flow", "free cash flow", "cash flow statement"],
    priority: 1,
  },
  {
    id: "2",
    question: "How do I evaluate credit risk?",
    contextHints: ["credit analysis", "risk factors", "loan underwriting"],
    priority: 1,
  },
  {
    id: "3",
    question: "Explain debt capacity ratios",
    contextHints: ["debt service coverage", "leverage ratios", "financial health"],
    priority: 1,
  },
  {
    id: "4",
    question: "What are the five C's of credit?",
    contextHints: ["character", "capacity", "capital", "collateral", "conditions"],
    priority: 1,
  },
  {
    id: "5",
    question: "How do I calculate debt service coverage ratio?",
    contextHints: ["debt service", "cash flow", "EBITDA", "loan payments"],
    priority: 1,
  },
  {
    id: "6",
    question: "What factors affect loan pricing?",
    contextHints: ["interest rates", "risk premium", "market conditions"],
    priority: 1,
  },
  {
    id: "7",
    question: "How to analyze working capital needs?",
    contextHints: ["current assets", "current liabilities", "liquidity"],
    priority: 1,
  },
  {
    id: "8",
    question: "What is collateral valuation?",
    contextHints: ["asset valuation", "loan-to-value", "security interest"],
    priority: 1,
  },
  {
    id: "9",
    question: "How to structure a commercial loan?",
    contextHints: ["loan terms", "repayment schedule", "covenants"],
    priority: 2,
  },
  {
    id: "10",
    question: "What are bank regulatory requirements?",
    contextHints: ["compliance", "capital requirements", "regulatory oversight"],
    priority: 2,
  },
  {
    id: "11",
    question: "How to assess industry risk?",
    contextHints: ["market trends", "competitive landscape", "sector risks"],
    priority: 2,
  },
  {
    id: "12",
    question: "What is loan documentation process?",
    contextHints: ["legal documents", "loan agreements", "compliance"],
    priority: 2,
  },
  {
    id: "13",
    question: "How to monitor loan performance?",
    contextHints: ["performance metrics", "early warning signs", "portfolio management"],
    priority: 2,
  },
  {
    id: "14",
    question: "What are environmental risk factors?",
    contextHints: ["environmental liability", "ESG factors", "regulatory compliance"],
    priority: 3,
  },
  {
    id: "15",
    question: "How to handle loan workout situations?",
    contextHints: ["troubled debt", "restructuring", "loss mitigation"],
    priority: 3,
  },
  {
    id: "16",
    question: "What are cross-default provisions?",
    contextHints: ["default triggers", "loan agreements", "risk management"],
    priority: 3,
  },
  {
    id: "17",
    question: "How to assess management quality?",
    contextHints: ["leadership assessment", "track record", "business experience"],
    priority: 3,
  },
  {
    id: "18",
    question: "What is stress testing in lending?",
    contextHints: ["scenario analysis", "risk assessment", "capital adequacy"],
    priority: 3,
  },
  {
    id: "19",
    question: "How to price construction loans?",
    contextHints: ["project financing", "draw schedules", "completion risk"],
    priority: 4,
  },
  {
    id: "20",
    question: "What are SBA loan requirements?",
    contextHints: ["government programs", "guarantee structure", "eligibility"],
    priority: 4,
  },
  {
    id: "21",
    question: "How to evaluate real estate investments?",
    contextHints: ["property valuation", "NOI analysis", "cap rates"],
    priority: 4,
  },
  {
    id: "22",
    question: "What is asset-based lending?",
    contextHints: ["inventory financing", "receivables", "asset coverage"],
    priority: 4,
  },
  {
    id: "23",
    question: "How to assess borrower's cash management?",
    contextHints: ["treasury operations", "cash conversion cycle", "liquidity planning"],
    priority: 5,
  },
  {
    id: "24",
    question: "What are covenant compliance requirements?",
    contextHints: ["financial covenants", "reporting requirements", "compliance testing"],
    priority: 5,
  },
  {
    id: "25",
    question: "How to handle international trade financing?",
    contextHints: ["letters of credit", "export financing", "documentary collections"],
    priority: 5,
  },
];

interface DynamicQuestionsProps {
  onQuestionClick: (
    question: string,
    questionData?: {
      topicDescription?: string;
      contextHints?: string[];
    }
  ) => void;
  isLoading: boolean;
  questions?: ChatQuestion[];
  maxInitialQuestions?: number;
  fallbackQuestions?: ChatQuestion[]; // New prop for configurable fallback questions
  hideShowMoreButton?: boolean; // New prop to hide show more button
  uiVariant?: 'default' | 'rex'; // New prop for UI style variant
}

export { FALLBACK_QUESTIONS };

export const DynamicQuestions: React.FC<DynamicQuestionsProps> = ({
  onQuestionClick,
  isLoading,
  questions, // No default - undefined means loading
  maxInitialQuestions = 8, // Changed from 5 to 8 to match original (4x2 grid)
  fallbackQuestions = FALLBACK_QUESTIONS, // Use provided fallback or default
  hideShowMoreButton = false, // Default to showing show more button
  uiVariant = 'default', // Default to standard UI
}) => {
  const [showMore, setShowMore] = useState(false);

  const { initialQuestions, additionalQuestions, questionsLoaded } = useMemo(() => {
    // If questions is undefined, we're still loading - don't show anything
    if (questions === undefined) {
      return {
        initialQuestions: [],
        additionalQuestions: [],
        questionsLoaded: false,
      };
    }
    
    const questionsToUse = questions.length > 0 ? questions : fallbackQuestions;
    const sortedQuestions = [...questionsToUse].sort((a, b) => a.priority - b.priority);
    const initial = sortedQuestions.slice(0, maxInitialQuestions);
    const additional = sortedQuestions.slice(maxInitialQuestions);
    
    return {
      initialQuestions: initial,
      additionalQuestions: additional,
      questionsLoaded: initial.length > 0,
    };
  }, [questions, maxInitialQuestions, fallbackQuestions]);

  const handleToggleMore = useCallback(() => {
    setShowMore(prev => !prev);
  }, []);

  const truncateText = useCallback((text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }, []);

  const renderQuestion = (question: ChatQuestion, index: number) => {
    const truncatedQuestion = truncateText(question.question);
    const isLongQuestion = question.question.length > 120;

  // Rex-style pill button
  if (uiVariant === 'rex') {
      return (
        <button
          key={`${question.id}-${index}`}
          onClick={() =>
            onQuestionClick(question.question, {
              contextHints: question.contextHints,
            })
          }
          disabled={isLoading}
          className="px-6 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {truncatedQuestion}
        </button>
      );
    }

    // Default style with tooltip
    const questionButton = (
      <Button
        key={`${question.id}-${index}`}
        variant="outline"
        size="sm"
        onClick={() =>
          onQuestionClick(question.question, {
            contextHints: question.contextHints,
          })
        }
        disabled={isLoading}
        className="text-left justify-start group hover:bg-blue-50 hover:border-blue-200 hover:text-black transition-colors h-auto min-h-[2.5rem] whitespace-normal p-4"
      >
        <span className="text-sm font-normal leading-tight whitespace-normal break-words">
          {truncatedQuestion}
        </span>
      </Button>
    );

    if (isLongQuestion) {
      return (
        <TooltipProvider key={question.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {questionButton}
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-md text-sm p-3"
            >
              <p className="whitespace-normal break-words">
                {question.question}
              </p>
              {question.contextHints && question.contextHints.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-medium mb-1">Related topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {question.contextHints.map((hint, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {hint}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return questionButton;
  };

  if (!questionsLoaded || (initialQuestions.length === 0 && additionalQuestions.length === 0)) {
    return (
      <div className={uiVariant === 'rex' ? "flex flex-wrap justify-center gap-3 max-w-2xl animate-pulse" : "grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl animate-pulse"}>
        {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, maxInitialQuestions).map((i) => (
          <div key={i} className={uiVariant === 'rex' ? "h-12 w-48 bg-gray-200 rounded-full" : "h-12 bg-gray-200 rounded-md border"} />
        ))}
      </div>
    );
  }

  // Rex-style centered layout
  if (uiVariant === 'rex') {
    return (
      <div className="flex flex-col items-center gap-3 max-w-2xl">
        {/* Questions as centered pill buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {initialQuestions.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>

        {/* Show More Button - only if not hidden and there are additional questions */}
        {!hideShowMoreButton && additionalQuestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleMore}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            {showMore ? (
              <>
                Show fewer questions
                <ChevronUp className="w-3 h-3 ml-2" />
              </>
            ) : (
              <>
                Show more questions ({additionalQuestions.length})
                <ChevronDown className="w-3 h-3 ml-2" />
              </>
            )}
          </Button>
        )}

        {/* Additional Questions */}
        {showMore && additionalQuestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 animate-in slide-in-from-top-2 duration-200">
            {additionalQuestions.map((question, index) =>
              renderQuestion(question, index + initialQuestions.length)
            )}
          </div>
        )}
      </div>
    );
  }

  // Default grid layout
  return (
    <TooltipProvider>
      <div className="max-w-4xl">
        {/* Initial Questions - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {initialQuestions.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>

        {/* Show More Button */}
        {!hideShowMoreButton && additionalQuestions.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMore}
              disabled={isLoading}
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              {showMore ? (
                <>
                  Show fewer questions
                  <ChevronUp className="w-3 h-3 ml-2" />
                </>
              ) : (
                <>
                  Show more questions ({additionalQuestions.length})
                  <ChevronDown className="w-3 h-3 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Additional Questions - Grid Layout */}
        {showMore && additionalQuestions.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
            {additionalQuestions.map((question, index) =>
              renderQuestion(question, index + initialQuestions.length)
            )}
          </div>
        )}

      </div>
    </TooltipProvider>
  );
};